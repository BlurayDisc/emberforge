import { MAXIMUM_BATTLE_SECONDS } from '../../../content/balance/battle';
import { FIELD_DEPTH, FIELD_LENGTH, TICK_SECONDS } from '../../../content/balance/battlefield';
import type { Random } from '../../../kernel/random';
import type { BattleUnit } from '../../../model/battle';
import type { RealtimeBattleReport } from '../../../model/realtimeBattle';
import { regenerateResource } from '../resourcePool';
import { burnTickEvents } from '../damageTaken';
import type { FieldBattle } from './fieldBattle';
import { resolveDueAction } from './pendingAction';
import { isAlive, type RealtimeUnit } from './realtimeUnit';
import { placeOnStartPositions } from './startPositions';
import { timeOfTick } from './tickClock';
import { recordSample, startTrackOf } from './trackRecorder';
import { decideAction, stillBusy } from './unitDecision';
import { attackReachOf, bodyRadiusOf, isRangedProfile, movementProfileOf, movementSpeedOf, type BattleUnitWithMovement } from './unitProfile';

function createRealtimeUnit(source: BattleUnitWithMovement): RealtimeUnit {
  const { movementSpeedBonus: _movementSpeedBonus, ...unit } = source;
  const profile = movementProfileOf(source);
  return {
    combatant: { unit: { ...unit }, charge: 0, statuses: [], shield: null, spellReadyAtSeconds: {} },
    x: 0,
    y: 0,
    bodyRadius: bodyRadiusOf(source),
    attackReach: attackReachOf(profile),
    isRanged: isRangedProfile(profile),
    movementSpeed: movementSpeedOf(source, profile),
    facing: source.side === 'party' ? 1 : -1,
    motion: 'idle',
    targetId: null,
    readyAtSeconds: 0,
    pending: null,
    slideSign: 0,
    stuckSeconds: 0,
  };
}

const sideIsAlive = (units: readonly RealtimeUnit[], side: BattleUnit['side']): boolean => units.some((unit) => unit.combatant.unit.side === side && isAlive(unit));

// The real-time battle. The whole fight is simulated at once from a seed, in fixed ticks,
// then replayed by the screen. Units run at each other, stop when the target is in reach, attack or cast, and block each other.
// Units act in the order of the input list within a tick (a fixed order keeps the result the same on every run).
export function simulateRealtimeBattle(sourceUnits: readonly BattleUnitWithMovement[], random: Random): RealtimeBattleReport {
  const units = sourceUnits.map(createRealtimeUnit);
  placeOnStartPositions(units.filter((unit) => unit.combatant.unit.side === 'party'), 'party');
  placeOnStartPositions(units.filter((unit) => unit.combatant.unit.side === 'enemy'), 'enemy');
  const battle: FieldBattle = { units, combatants: units.map((unit) => unit.combatant), random: random.fork('realtimeCombat'), events: [], actionEvents: [] };
  const tracks = units.map(startTrackOf);
  const recordTick = (): void => units.forEach((unit, index) => recordSample(tracks[index]!, unit));
  const deadUnitIds = new Set<string>();
  const markDeaths = (timeSeconds: number): void => {
    for (const unit of units) {
      if (isAlive(unit) || deadUnitIds.has(unit.combatant.unit.id)) continue;
      deadUnitIds.add(unit.combatant.unit.id);
      unit.motion = 'dead';
      unit.pending = null;
      battle.actionEvents.push({ kind: 'death', timeSeconds, unitId: unit.combatant.unit.id });
    }
  };

  recordTick();
  const maximumTicks = Math.round(MAXIMUM_BATTLE_SECONDS / TICK_SECONDS);
  let tick = 0;
  while (tick < maximumTicks && sideIsAlive(units, 'party') && sideIsAlive(units, 'enemy')) {
    tick += 1;
    const timeSeconds = timeOfTick(tick);
    battle.events.push(...burnTickEvents(battle.combatants, timeSeconds));
    markDeaths(timeSeconds);
    for (const unit of units) {
      if (!isAlive(unit)) continue;
      regenerateResource(unit.combatant.unit, TICK_SECONDS);
      resolveDueAction(battle, unit, timeSeconds);
      if (isAlive(unit) && !stillBusy(unit, timeSeconds)) {
        decideAction(battle, unit, timeSeconds);
        resolveDueAction(battle, unit, timeSeconds);
      }
      markDeaths(timeSeconds);
    }
    recordTick();
  }

  return {
    winner: sideIsAlive(units, 'enemy') ? 'enemy' : 'party',
    durationSeconds: timeOfTick(tick),
    events: battle.events,
    finalUnits: battle.combatants.map((combatant) => combatant.unit),
    tickSeconds: TICK_SECONDS,
    field: { length: FIELD_LENGTH, depth: FIELD_DEPTH },
    tracks,
    actionEvents: battle.actionEvents,
  };
}
