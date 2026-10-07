import { MINIMUM_ATTACK_SPEED_FACTOR } from '../../content/balance/battle';
import type { AttackKind, BattleSide, BattleUnit } from '../../model/battle';
import type { SpellStatus } from '../../model/spell';

// A Burn remembers who set it and how hard that unit hit, because the damage comes from the attack of the caster.
export interface BurnSource {
  sourceId: string;
  sourceAttack: number;
  nextTickAtSeconds: number;
}

export interface ActiveStatus {
  status: SpellStatus;
  strength: number;
  expiresAtSeconds: number;
  // Evade: how many hits the unit can still dodge.
  charges?: number;
  burn?: BurnSource;
}

// A shield has its own counter. Damage empties it before it touches the health of the unit.
export interface ActiveShield {
  remaining: number;
  expiresAtSeconds: number;
}

export interface Combatant {
  unit: BattleUnit;
  charge: number;
  statuses: ActiveStatus[];
  shield: ActiveShield | null;
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

// Weaken on the attacker cuts the damage of a hit before the armour. Hex on the target raises it, for magic damage only.
export function damageFactorBetween(attacker: Combatant, target: Combatant, timeSeconds: number, damageKind: AttackKind = attacker.unit.attackKind): number {
  const hexFactor = damageKind === 'magic' ? 1 + statusStrength(target, 'hex', timeSeconds) : 1;
  return (1 - statusStrength(attacker, 'weaken', timeSeconds)) * hexFactor;
}

// Fortify and Guard raise the flat armour of the target and Sunder cuts it, all as shares of the armour value. Fortify only touches Defence (physical hits).
export function armourFactorOf(target: Combatant, damageKind: AttackKind, timeSeconds: number): number {
  const fortify = damageKind === 'physical' ? statusStrength(target, 'fortify', timeSeconds) : 0;
  return Math.max(0, 1 + fortify + statusStrength(target, 'guard', timeSeconds) - statusStrength(target, 'sunder', timeSeconds));
}

// Empower adds a share of the main attribute of the unit to its attack.
export function empowerAttackBonusOf(combatant: Combatant, timeSeconds: number): number {
  return statusStrength(combatant, 'empower', timeSeconds) * combatant.unit.mainAttributeValue;
}

// Haste and Slow join the Agility and gear bonus in one pool. The pool never drops below the minimum factor, so the attack time stays finite.
export function attackSpeedFactorOf(combatant: Combatant, timeSeconds: number): number {
  const pool = 1 + combatant.unit.attackSpeedBonus + statusStrength(combatant, 'haste', timeSeconds) - statusStrength(combatant, 'slow', timeSeconds);
  return Math.max(MINIMUM_ATTACK_SPEED_FACTOR, pool);
}

// A new status of the same kind replaces the old one, so statuses never stack.
export function applyStatus(combatant: Combatant, status: ActiveStatus): void {
  combatant.statuses = [...combatant.statuses.filter((active) => active.status !== status.status), status];
}
