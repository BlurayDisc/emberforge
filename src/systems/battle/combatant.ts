import type { BattleSide, BattleUnit } from '../../model/battle';
import type { SpellStatus } from '../../model/spell';

export interface ActiveStatus {
  status: SpellStatus;
  strength: number;
  expiresAtSeconds: number;
}

export interface Combatant {
  unit: BattleUnit;
  charge: number;
  statuses: ActiveStatus[];
  // The battle time when a spell may be cast again. A spell that is not listed is ready.
  spellReadyAtSeconds: Record<string, number>;
}

export function livingUnitsOf(combatants: readonly Combatant[], side: BattleSide): BattleUnit[] {
  return combatants.filter((combatant) => combatant.unit.side === side && combatant.unit.hp > 0).map((combatant) => combatant.unit);
}

export function combatantOf(combatants: readonly Combatant[], unit: BattleUnit): Combatant {
  const combatant = combatants.find((candidate) => candidate.unit.id === unit.id);
  if (!combatant) throw new Error(`Unknown combatant: ${unit.id}`);
  return combatant;
}

export function statusStrength(combatant: Combatant, status: SpellStatus, timeSeconds: number): number {
  return combatant.statuses.reduce((strongest, active) => (active.status === status && active.expiresAtSeconds > timeSeconds ? Math.max(strongest, active.strength) : strongest), 0);
}

// Weaken on the attacker and guard on the target both cut the damage of a hit.
export function damageFactorBetween(attacker: Combatant, target: Combatant, timeSeconds: number): number {
  return (1 - statusStrength(attacker, 'weaken', timeSeconds)) * (1 - statusStrength(target, 'guard', timeSeconds));
}

// A new status of the same kind replaces the old one, so statuses never stack.
export function applyStatus(combatant: Combatant, status: ActiveStatus): void {
  combatant.statuses = [...combatant.statuses.filter((active) => active.status !== status.status), status];
}
