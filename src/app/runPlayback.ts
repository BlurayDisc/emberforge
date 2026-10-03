import { activeRunOf, finishEncounterCommand, planNextEncounter, type GameStore } from '../game';
import type { BattleEvent, BattleUnit } from '../model/battle';
import type { BattleView } from '../render/battleView';
import type { TownView } from '../render/townView';
import type { PixelStage } from '../render/pixelStage';
import { listOf, unitDisplayName } from '../ui/displayNames';
import { t } from '../ui/i18n';
import type { RunHud } from '../ui/runHud';

const MAXIMUM_FRAME_SECONDS = 0.1;
const PAUSE_AFTER_ENCOUNTER_SECONDS = 1;
const RESULT_DISPLAY_SECONDS = 3.5;

interface EncounterPlayback {
  events: readonly BattleEvent[];
  unitsById: ReadonlyMap<string, BattleUnit>;
  durationSeconds: number;
  partyWon: boolean;
  nextEventIndex: number;
  elapsedSeconds: number;
  hasAnnouncedResult: boolean;
}

function describeEvent(event: BattleEvent, unitsById: ReadonlyMap<string, BattleUnit>): string {
  const actor = unitsById.get(event.actorId);
  const target = unitsById.get(event.targetId);
  const actorName = actor ? unitDisplayName(actor) : t('log.someone');
  const targetName = target ? unitDisplayName(target) : t('log.someone');
  if (event.kind === 'heal') return t('log.heal', { actor: actorName, target: targetName, amount: event.amount });
  const critical = event.isCritical ? t('log.crit') : '';
  return `${t('log.hit', { actor: actorName, target: targetName, amount: event.amount })}${critical}`;
}

export interface SceneViews {
  battleView: BattleView;
  townView: TownView;
}

export function startRunPlayback(store: GameStore, stage: PixelStage, scenes: SceneViews, hud: RunHud): void {
  const { battleView: view, townView } = scenes;
  let playback: EncounterPlayback | null = null;
  let previousFrameSeconds: number | null = null;
  let resultPauseRemainingSeconds = 0;

  const beginEncounter = (): void => {
    const state = store.getState();
    const run = activeRunOf(state);
    if (run === null) return;
    const plan = planNextEncounter(state);
    if (run.encounterNumber === 0) hud.clearLog();
    view.setBackdrop(run.dungeonId);
    view.showUnits([...plan.partyUnits, ...plan.monsterUnits]);
    const monsterNames = listOf(plan.monsterUnits.map((unit) => unitDisplayName(unit)));
    hud.appendLogLine(t('log.fight', { number: run.encounterNumber + 1, monsters: monsterNames }));
    playback = {
      events: plan.report.events,
      unitsById: new Map([...plan.partyUnits, ...plan.monsterUnits].map((unit) => [unit.id, unit])),
      durationSeconds: plan.report.durationSeconds,
      partyWon: plan.report.winner === 'party',
      nextEventIndex: 0,
      elapsedSeconds: 0,
      hasAnnouncedResult: false,
    };
  };

  const synchronizeWithState = (): void => {
    const state = store.getState();
    if (activeRunOf(state) === null) {
      playback = null;
      resultPauseRemainingSeconds = 0;
      view.setVisible(false);
      townView.setVisible(true);
      return;
    }
    townView.setVisible(false);
    view.setVisible(true);
    if (playback === null && resultPauseRemainingSeconds <= 0) beginEncounter();
  };

  const applyEvent = (event: BattleEvent, current: EncounterPlayback): void => {
    const target = current.unitsById.get(event.targetId);
    if (target) view.setUnitHealth(target.id, event.targetHpAfter, target.maxHp);
    if (event.kind === 'attack') view.playHit(event.actorId, event.targetId, event.amount, event.isCritical);
    else view.playHeal(event.actorId, event.targetId, event.amount);
    hud.appendLogLine(describeEvent(event, current.unitsById));
    if (target && event.targetHpAfter === 0) {
      view.markDefeated(target.id);
      hud.appendLogLine(t('log.defeated', { name: unitDisplayName(target) }));
    }
  };

  stage.onFrame((elapsedSeconds) => {
    const frameSeconds =
      previousFrameSeconds === null ? 0 : Math.min(MAXIMUM_FRAME_SECONDS, elapsedSeconds - previousFrameSeconds);
    previousFrameSeconds = elapsedSeconds;
    if (resultPauseRemainingSeconds > 0) {
      resultPauseRemainingSeconds -= frameSeconds * hud.playbackSpeed();
      if (resultPauseRemainingSeconds <= 0) {
        resultPauseRemainingSeconds = 0;
        hud.hideResult();
        if (playback === null) synchronizeWithState();
      }
      return;
    }
    const current = playback;
    if (current === null) return;

    current.elapsedSeconds += frameSeconds * hud.playbackSpeed();
    while (current.events[current.nextEventIndex]?.timeSeconds !== undefined) {
      const event = current.events[current.nextEventIndex] as BattleEvent;
      if (event.timeSeconds > current.elapsedSeconds) break;
      applyEvent(event, current);
      current.nextEventIndex += 1;
    }

    if (!current.hasAnnouncedResult && current.elapsedSeconds >= current.durationSeconds) {
      current.hasAnnouncedResult = true;
      hud.appendLogLine(current.partyWon ? t('log.victory') : t('log.defeat'));
    }
    if (current.elapsedSeconds >= current.durationSeconds + PAUSE_AFTER_ENCOUNTER_SECONDS) {
      playback = null;
      resultPauseRemainingSeconds = RESULT_DISPLAY_SECONDS;
      store.execute(finishEncounterCommand());
      const finishedRun = store.getState().dungeonRun;
      if (finishedRun?.status === 'active' && finishedRun.lastEncounter) hud.showResult(finishedRun.lastEncounter);
      else resultPauseRemainingSeconds = 0;
    }
  });

  store.subscribe(synchronizeWithState);
  synchronizeWithState();
}
