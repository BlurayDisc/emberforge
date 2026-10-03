import {
  activeRunOf,
  finishEncounterCommand,
  listPartyBattleUnits,
  planNextEncounter,
  type GameStore,
} from '../game';
import type { BattleEvent, BattleUnit } from '../model/battle';
import type { BattleView } from '../render/battleView';
import type { PixelStage } from '../render/pixelStage';
import type { RunHud } from '../ui/runHud';

const MAXIMUM_FRAME_SECONDS = 0.1;
const PAUSE_AFTER_ENCOUNTER_SECONDS = 1;

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
  const actorName = unitsById.get(event.actorId)?.name ?? 'Someone';
  const targetName = unitsById.get(event.targetId)?.name ?? 'someone';
  if (event.kind === 'heal') return `${actorName} heals ${targetName} for ${event.amount}.`;
  const critical = event.isCritical ? ' Critical hit!' : '';
  return `${actorName} hits ${targetName} for ${event.amount}.${critical}`;
}

export function startRunPlayback(store: GameStore, stage: PixelStage, view: BattleView, hud: RunHud): void {
  let playback: EncounterPlayback | null = null;
  let previousFrameSeconds: number | null = null;

  const beginEncounter = (): void => {
    const state = store.getState();
    const run = activeRunOf(state);
    if (run === null) return;
    const plan = planNextEncounter(state);
    if (run.encounterNumber === 0) hud.clearLog();
    view.showUnits([...plan.partyUnits, ...plan.monsterUnits]);
    const monsterNames = plan.monsterUnits.map((unit) => unit.name).join(', ');
    hud.appendLogLine(`Fight ${run.encounterNumber + 1}: ${monsterNames}.`);
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
      view.showUnits(listPartyBattleUnits(state));
      return;
    }
    if (playback === null) beginEncounter();
  };

  const applyEvent = (event: BattleEvent, current: EncounterPlayback): void => {
    const target = current.unitsById.get(event.targetId);
    if (target) view.setUnitHealth(target.id, event.targetHpAfter, target.maxHp);
    if (event.kind === 'attack') view.flashUnit(event.targetId);
    hud.appendLogLine(describeEvent(event, current.unitsById));
    if (target && event.targetHpAfter === 0) {
      view.markDefeated(target.id);
      hud.appendLogLine(`${target.name} is defeated.`);
    }
  };

  stage.onFrame((elapsedSeconds) => {
    const frameSeconds =
      previousFrameSeconds === null ? 0 : Math.min(MAXIMUM_FRAME_SECONDS, elapsedSeconds - previousFrameSeconds);
    previousFrameSeconds = elapsedSeconds;
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
      hud.appendLogLine(current.partyWon ? 'Victory!' : 'Defeat. The party retreats to town.');
    }
    if (current.elapsedSeconds >= current.durationSeconds + PAUSE_AFTER_ENCOUNTER_SECONDS) {
      playback = null;
      store.execute(finishEncounterCommand());
    }
  });

  store.subscribe(synchronizeWithState);
  synchronizeWithState();
}
