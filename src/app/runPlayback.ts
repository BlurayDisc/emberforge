import { playMusic } from '../audio';
import { completeRunCommand, experienceForDefeatedMonsters, findActiveRun, planNextEncounter, type GameStore } from '../game';
import type { BattleEvent, BattleReport, BattleUnit } from '../model/battle';
import type { RealtimeBattleReport } from '../model/realtimeBattle';
import type { BattleView } from '../render/battleView';
import type { PixelStage } from '../render/pixelStage';
import type { SceneToggle } from '../render/slidingView';
import { listOf, unitDisplayName } from '../ui/displayNames';
import { isInCastle, onCastleVisitChange } from '../ui/castleVisit';
import { focusRun, focusedRunNumber, onRunFocusChange } from '../ui/runFocus';
import { presentBattleEvent } from './battleEventPresenter';
import { logEntriesForEvent, logUnitOf } from './battleLogEntries';
import { chooseMusicTrack, STORY_TRACK_ID } from './sceneMusic';
import { forgetRunProgress, publishRunProgress } from '../ui/runProgress';
import { isStoryMusicActive, onStoryMusicChange } from '../ui/storyMusic';
import type { RunHud } from '../ui/runHud';

const MAXIMUM_FRAME_SECONDS = 0.1;
const PAUSE_AFTER_FIGHT_SECONDS = 1.5;

export interface SceneViews {
  battleView: BattleView;
  townView: SceneToggle;
}

interface EncounterPlayback {
  partyUnits: readonly BattleUnit[];
  monsterUnits: readonly BattleUnit[];
  events: readonly BattleEvent[];
  unitsById: ReadonlyMap<string, BattleUnit>;
  // Set when the planner gives a real-time report: the stage then moves the units along its tracks. Null keeps the old fixed slots.
  realtimeReport: RealtimeBattleReport | null;
  durationSeconds: number;
  partyWon: boolean;
  nextEventIndex: number;
  elapsedSeconds: number;
  hasAnnouncedResult: boolean;
  lastLoggedTimeMarker: number;
}

// One player for each active run. Every player advances in time, so a run that is not
// in focus still fights, loots and levels up. Only the focused player draws on the stage.
interface RunPlayer {
  runNumber: number;
  dungeonId: string;
  encounter: EncounterPlayback | null;
}

function realtimeReportOf(report: BattleReport): RealtimeBattleReport | null {
  return 'tracks' in report && 'actionEvents' in report ? (report as RealtimeBattleReport) : null;
}

export function startRunPlayback(store: GameStore, stage: PixelStage, scenes: SceneViews, hud: RunHud): void {
  const { battleView: view, townView } = scenes;
  const players = new Map<number, RunPlayer>();
  let previousFrameSeconds: number | null = null;
  let displayedRunNumber: number | null = null;
  let hasLoaded = false;

  const applyEventToView = (event: BattleEvent, encounter: EncounterPlayback, eventIndex: number): void => {
    presentBattleEvent(view, event, encounter.events, eventIndex, encounter.unitsById);
    logEntriesForEvent(event, encounter).forEach(hud.appendLogEntry);
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
    view.setRealtimeBattle(encounter.realtimeReport);
    view.setBattleTime(encounter.elapsedSeconds);
    hud.appendLogEntry({ kind: 'fight', monsters: listOf(encounter.monsterUnits.map((unit) => unitDisplayName(unit))) });
    encounter.lastLoggedTimeMarker = -1;
    for (const event of encounter.events.slice(0, encounter.nextEventIndex)) {
      logEntriesForEvent(event, encounter).forEach(hud.appendLogEntry);
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
      realtimeReport: realtimeReportOf(plan.report),
      durationSeconds: plan.report.durationSeconds,
      partyWon: plan.report.winner === 'party',
      nextEventIndex: 0,
      elapsedSeconds: 0,
      hasAnnouncedResult: false,
      lastLoggedTimeMarker: -1,
    };
    if (focusedRunNumber() === player.runNumber) presentEncounter(player);
  };

  const updateMusic = (): void => {
    const watchedPlayer = players.get(focusedRunNumber() ?? -1);
    const oldestPlayer = players.get(Math.min(...players.keys()));
    playMusic(isStoryMusicActive() ? STORY_TRACK_ID : chooseMusicTrack(watchedPlayer?.dungeonId ?? null, oldestPlayer?.dungeonId ?? null, isInCastle()));
  };

  const synchronizeScene = (): void => {
    const focused = focusedRunNumber();
    const player = focused === null ? undefined : players.get(focused);
    updateMusic();
    if (!player) {
      townView.setVisible(true);
      view.setVisible(false);
      displayedRunNumber = null;
      return;
    }
    townView.setVisible(false);
    view.setVisible(true);
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
    if (isFocused && encounter.realtimeReport) view.setBattleTime(encounter.elapsedSeconds);
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
  onCastleVisitChange(updateMusic);
  onStoryMusicChange(updateMusic);
  reconcilePlayers();
  hasLoaded = true;
}
