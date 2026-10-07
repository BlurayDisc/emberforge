import type { UnitTrack } from '../../../model/realtimeBattle';
import type { RealtimeUnit } from './realtimeUnit';

const roundToMillimetre = (value: number): number => Math.round(value * 1000) / 1000;

export function startTrackOf(unit: RealtimeUnit): UnitTrack {
  const { id, side, rank } = unit.combatant.unit;
  return { unitId: id, side, rank, bodyRadius: unit.bodyRadius, attackReach: unit.attackReach, x: [], y: [], facing: [], state: [] };
}

// One sample per tick. Rounding keeps the report small and the same on every machine.
export function recordSample(track: UnitTrack, unit: RealtimeUnit): void {
  track.x.push(roundToMillimetre(unit.x));
  track.y.push(roundToMillimetre(unit.y));
  track.facing.push(unit.facing);
  track.state.push(unit.motion);
}
