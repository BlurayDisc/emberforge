import { playMusic, playSound } from '../audio';
import { LOG_TURN_SECONDS } from '../content/balance/battle';
import { ARMOUR_HIT_SOUNDS, CLASS_ATTACK_SOUNDS, MONSTER_ATTACK_SOUNDS, MONSTER_HURT_SOUNDS } from '../content/audio';
import { CLASSES } from '../content/classes';
import { DUNGEONS } from '../content/dungeons';
import { requireById } from '../content/lookup';
import { completeRunCommand, describeSpellEvent, experienceForDefeatedMonsters, findActiveRun, planNextEncounter, type GameStore, type SpellPresentation } from '../game';
import type { BattleEvent, BattleUnit } from '../model/battle';
import type { ClassId } from '../model/hero';
import type { BattleView } from '../render/battleView';
import type { PixelStage } from '../render/pixelStage';
import type { TownView } from '../render/townView';
import type { LogEntry, LogUnit } from '../ui/battleLogLines';
import type { ArmourWeight } from '../model/item';
import { listOf, resourceName, unitDisplayName } from '../ui/displayNames';
import { t } from '../ui/i18n';
import { spellName as spellNameOf } from '../ui/spellText';
import { focusRun, focusedRunNumber, onRunFocusChange } from '../ui/runFocus';
import { playSpellSounds } from './spellSounds';
import { forgetRunProgress, publishRunProgress } from '../ui/runProgress';
import type { RunHud } from '../ui/runHud';

const MAXIMUM_FRAME_SECONDS = 0.1;
const PAUSE_AFTER_FIGHT_SECONDS = 1.5;

export interface SceneViews {
  battleView: BattleView;
  townView: TownView;
}

interface EncounterPlayback {
  partyUnits: readonly BattleUnit[];
  monsterUnits: readonly BattleUnit[];
  events: readonly BattleEvent[];
  unitsById: ReadonlyMap<string, BattleUnit>;
  durationSeconds: number;
  partyWon: boolean;
  nextEventIndex: number;
  elapsedSeconds: number;
  hasAnnouncedResult: boolean;
  lastLoggedTurn: number;
}

// One player for each active run. Every player advances in time, so a run that is not
// in focus still fights, loots and levels up. Only the focused player draws on the stage.
interface RunPlayer {
  runNumber: number;
  dungeonId: string;
  encounter: EncounterPlayback | null;
}

function logUnitOf(unit: BattleUnit | undefined): LogUnit {
  return unit ? { name: unitDisplayName(unit), side: unit.side } : { name: t('log.someone'), side: 'enemy' };
}

// A turn is a fixed span of battle time, so a long fight reads as a list of numbered turns.
function turnOf(event: BattleEvent): number {
  return Math.floor(event.timeSeconds / LOG_TURN_SECONDS) + 1;
}

function logEntriesForEvent(event: BattleEvent, encounter: EncounterPlayback): LogEntry[] {
  const entries: LogEntry[] = [];
  const turn = turnOf(event);
  if (turn !== encounter.lastLoggedTurn) {
    encounter.lastLoggedTurn = turn;
    entries.push({ kind: 'turn', turn });
  }
  const actor = logUnitOf(encounter.unitsById.get(event.actorId));
  const targetUnit = encounter.unitsById.get(event.targetId);
  const target = logUnitOf(targetUnit);
  const spellName = event.spellId === undefined ? undefined : spellNameOf(event.spellId);
  const actorUnit = encounter.unitsById.get(event.actorId);
  const resourceSpent = event.resourceSpent !== undefined && actorUnit ? { resourceName: resourceName(actorUnit.resourceId), amount: event.resourceSpent } : undefined;
  if (event.kind === 'effect') entries.push({ kind: 'effect', actor, target, spellName: spellName ?? '', resourceSpent });
  else if (event.kind === 'heal') entries.push({ kind: 'heal', actor, target, amount: event.amount, spellName, resourceSpent });
  else entries.push({ kind: 'hit', actor, target, amount: event.amount, isCritical: event.isCritical, spellName, resourceSpent });
  if (targetUnit && event.targetHpAfter === 0) entries.push({ kind: 'defeated', unit: target });
  return entries;
}

// A hero attack sounds as the weapon plus the monster's cry. A monster attack sounds as its own
// strike plus the hit on the armour type of the hero. A spell with its own sounds plays them instead of the weapon.
function playEventSounds(event: BattleEvent, unitsById: ReadonlyMap<string, BattleUnit>, spell: SpellPresentation | null): void {
  const actor = unitsById.get(event.actorId);
  const target = unitsById.get(event.targetId);
  if (!actor || !target) return;
  if (spell) playSpellSounds(spell);
  if (event.kind === 'heal' || event.kind === 'effect') {
    if (!spell) playSound('heal-chime');
    return;
  }
  if (actor.rank === 'hero') {
    if (!spell) playSound(CLASS_ATTACK_SOUNDS[actor.definitionId as ClassId]);
    playSound(MONSTER_HURT_SOUNDS[target.spriteKey] ?? '', 0.05);
  } else {
    playSound(MONSTER_ATTACK_SOUNDS[actor.spriteKey] ?? '');
    playSound(ARMOUR_HIT_SOUNDS[requireById(CLASSES, target.definitionId).armourWeights[0] as ArmourWeight], 0.04);
  }
  if (event.isCritical) playSound('critical-ping', 0.05);
  if (event.targetHpAfter === 0) playSound(target.rank === 'hero' ? 'defeat-hero' : 'defeat-monster', 0.12);
}

export function startRunPlayback(store: GameStore, stage: PixelStage, scenes: SceneViews, hud: RunHud): void {
  const { battleView: view, townView } = scenes;
  const players = new Map<number, RunPlayer>();
  let previousFrameSeconds: number | null = null;
  let displayedRunNumber: number | null = null;
  let hasLoaded = false;

  const showResourcesAfterEvent = (event: BattleEvent): void => {
    view.setUnitResource(event.actorId, event.actorResourceAfter);
    view.setUnitResource(event.targetId, event.targetResourceAfter);
  };

  // A spell with a look (data/spell-visuals.json) shows its own effects. Any other event keeps the plain hit and heal look.
  const showSpellOnView = (event: BattleEvent, spell: SpellPresentation & { visual: NonNullable<SpellPresentation['visual']> }): void => {
    if (spell.startsCast) view.playSpellCast(event.actorId, spell.visual);
    if (spell.role === 'damage') view.playSpellHit(event.actorId, event.targetId, event.amount, event.isCritical, spell.visual, spell.hitIndex, spell.statusDurationSeconds);
    else if (spell.role === 'heal') view.playSpellHeal(event.actorId, event.targetId, event.amount, spell.visual);
    else if (spell.statusDurationSeconds !== null) view.playSpellStatus(event.actorId, event.targetId, spell.visual, spell.role, spell.statusDurationSeconds);
  };

  const applyEventToView = (event: BattleEvent, encounter: EncounterPlayback, eventIndex: number): void => {
    const target = encounter.unitsById.get(event.targetId);
    if (target) view.setUnitHealth(target.id, event.targetHpAfter);
    showResourcesAfterEvent(event);
    const spell = describeSpellEvent(encounter.events, eventIndex, encounter.unitsById);
    const spellWithLook = spell?.visual ? { ...spell, visual: spell.visual } : null;
    if (spellWithLook) showSpellOnView(event, spellWithLook);
    else if (event.kind === 'attack') view.playHit(event.actorId, event.targetId, event.amount, event.isCritical);
    else if (event.kind === 'heal') view.playHeal(event.actorId, event.targetId, event.amount);
    playEventSounds(event, encounter.unitsById, spellWithLook);
    logEntriesForEvent(event, encounter).forEach(hud.appendLogEntry);
    if (target && event.targetHpAfter === 0) view.markDefeated(target.id);
  };

  // Rebuild the stage for a fight that is already in progress. Past events only set
  // health and defeat marks, so no sound, particle or damage number replays.
  const presentEncounter = (player: RunPlayer): void => {
    const encounter = player.encounter;
    displayedRunNumber = player.runNumber;
    hud.clearLog();
    view.setBackdrop(player.dungeonId);
    if (!encounter) {
      view.showUnits([]);
      return;
    }
    view.showUnits([...encounter.partyUnits, ...encounter.monsterUnits]);
    hud.appendLogEntry({ kind: 'fight', monsters: listOf(encounter.monsterUnits.map((unit) => unitDisplayName(unit))) });
    encounter.lastLoggedTurn = 0;
    for (const event of encounter.events.slice(0, encounter.nextEventIndex)) {
      logEntriesForEvent(event, encounter).forEach(hud.appendLogEntry);
      showResourcesAfterEvent(event);
      const target = encounter.unitsById.get(event.targetId);
      if (!target) continue;
      view.setUnitHealth(target.id, event.targetHpAfter);
      if (event.targetHpAfter === 0) view.markDefeated(target.id);
    }
  };

  const beginEncounter = (player: RunPlayer): void => {
    const state = store.getState();
    const run = findActiveRun(state, player.runNumber);
    if (!run) return;
    const plan = planNextEncounter(state, player.runNumber);
    const units = [...plan.partyUnits, ...plan.monsterUnits];
    player.encounter = {
      partyUnits: plan.partyUnits,
      monsterUnits: plan.monsterUnits,
      events: plan.report.events,
      unitsById: new Map(units.map((unit) => [unit.id, unit])),
      durationSeconds: plan.report.durationSeconds,
      partyWon: plan.report.winner === 'party',
      nextEventIndex: 0,
      elapsedSeconds: 0,
      hasAnnouncedResult: false,
      lastLoggedTurn: 0,
    };
    if (focusedRunNumber() === player.runNumber) presentEncounter(player);
  };

  const synchronizeScene = (): void => {
    const focused = focusedRunNumber();
    const player = focused === null ? undefined : players.get(focused);
    if (!player) {
      townView.setVisible(true);
      view.setVisible(false);
      displayedRunNumber = null;
      playMusic('town');
      return;
    }
    townView.setVisible(false);
    view.setVisible(true);
    playMusic(DUNGEONS.find((dungeon) => dungeon.id === player.dungeonId)?.bossMonsterId ? 'boss' : 'battle');
    if (displayedRunNumber !== player.runNumber) presentEncounter(player);
  };

  // Keep the players in step with the saved state. A run that ended or was stopped loses its player.
  const reconcilePlayers = (): void => {
    const state = store.getState();
    const activeNumbers = new Set(state.dungeonRuns.map((run) => run.runNumber));
    for (const runNumber of [...players.keys()]) if (!activeNumbers.has(runNumber)) {
      players.delete(runNumber);
      forgetRunProgress(runNumber);
    }
    for (const run of state.dungeonRuns) {
      if (players.has(run.runNumber)) continue;
      players.set(run.runNumber, { runNumber: run.runNumber, dungeonId: run.dungeonId, encounter: null });
      const isNewRunFromThisSession = hasLoaded && run.runNumber === state.runsStarted;
      if (isNewRunFromThisSession) focusRun(run.runNumber);
    }
    const focused = focusedRunNumber();
    if (focused !== null && !activeNumbers.has(focused)) focusRun(null);
    for (const player of players.values()) {
      if (!player.encounter) beginEncounter(player);
    }
    synchronizeScene();
  };

  const advancePlayer = (player: RunPlayer, deltaSeconds: number): void => {
    const encounter = player.encounter;
    if (!encounter) return;
    encounter.elapsedSeconds += deltaSeconds;
    const totalSeconds = encounter.durationSeconds + PAUSE_AFTER_FIGHT_SECONDS;
    publishRunProgress(player.runNumber, encounter.elapsedSeconds / totalSeconds, totalSeconds - encounter.elapsedSeconds, encounter.elapsedSeconds);
    const isFocused = focusedRunNumber() === player.runNumber;
    for (let event = encounter.events[encounter.nextEventIndex]; event && event.timeSeconds <= encounter.elapsedSeconds; event = encounter.events[encounter.nextEventIndex]) {
      if (isFocused) applyEventToView(event, encounter, encounter.nextEventIndex);
      encounter.nextEventIndex += 1;
    }
    if (isFocused && !encounter.hasAnnouncedResult && encounter.elapsedSeconds >= encounter.durationSeconds) {
      encounter.hasAnnouncedResult = true;
      hud.appendLogEntry({ kind: 'result', won: encounter.partyWon });
      if (encounter.partyWon) {
        for (const hero of encounter.partyUnits) {
          hud.appendLogEntry({ kind: 'experience', hero: logUnitOf(hero), amount: experienceForDefeatedMonsters(encounter.monsterUnits, hero.level) });
        }
      }
    }
    if (encounter.elapsedSeconds >= encounter.durationSeconds + PAUSE_AFTER_FIGHT_SECONDS) {
      player.encounter = null;
      store.execute(completeRunCommand(player.runNumber, Date.now()));
    }
  };

  stage.onFrame((elapsedSeconds) => {
    // A hidden browser tab stops animation frames. The cap keeps a long gap from skipping whole fights.
    const frameSeconds = previousFrameSeconds === null ? 0 : Math.min(MAXIMUM_FRAME_SECONDS, elapsedSeconds - previousFrameSeconds);
    previousFrameSeconds = elapsedSeconds;
    const deltaSeconds = frameSeconds;
    for (const player of [...players.values()]) advancePlayer(player, deltaSeconds);
  });

  store.subscribe(reconcilePlayers);
  onRunFocusChange(synchronizeScene);
  reconcilePlayers();
  hasLoaded = true;
}
