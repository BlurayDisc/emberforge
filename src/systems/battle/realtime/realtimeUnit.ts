import type { BattleSpell } from '../../../model/spell';
import type { UnitMotionState } from '../../../model/realtimeBattle';
import type { Combatant } from '../combatant';

// The part of a battle unit that is only about the real-time field. Armed with the combat state of the turn rules (Combatant).
export type PendingAction =
  | { kind: 'attack' | 'heal'; targetId: string; hitAtSeconds: number }
  | { kind: 'cast'; spell: BattleSpell; resourceCost: number; targetId: string | null; effectAtSeconds: number };

export interface RealtimeUnit {
  combatant: Combatant;
  x: number;
  y: number;
  bodyRadius: number;
  // Edge to edge distance across which the unit can hit. A per-unit value, so an ability can raise it later.
  attackReach: number;
  isRanged: boolean;
  movementSpeed: number;
  facing: 1 | -1;
  motion: UnitMotionState;
  targetId: string | null;
  // Exact time when the unit may start its next action. It can lie between two ticks, so a run of attacks keeps its exact rhythm.
  readyAtSeconds: number;
  pending: PendingAction | null;
  // Which way the unit slides round a blocker, kept until the way is free again so it does not jitter. 0 means no slide.
  slideSign: -1 | 0 | 1;
  stuckSeconds: number;
  // Hero cast order: a cast is due after a basic attack, and the next cast starts at the slot after this index (-1 before the first cast).
  castIsDue: boolean;
  lastCastSpellIndex: number;
}

export const unitIdOf = (unit: RealtimeUnit): string => unit.combatant.unit.id;
export const isAlive = (unit: RealtimeUnit): boolean => unit.combatant.unit.hp > 0;

export function edgeDistanceBetween(first: RealtimeUnit, second: RealtimeUnit): number {
  return Math.hypot(first.x - second.x, first.y - second.y) - first.bodyRadius - second.bodyRadius;
}
