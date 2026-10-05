import { CRITICAL_CHANCE_PER_SKILL_POINT } from '../../content/balance/battle';
import type { AttackKind, BattleSide, BattleUnit } from '../../model/battle';
import type { SpellStatus } from '../../model/spell';

// A Burn remembers who set it and how hard that unit hit, because the damage comes from the attack of the caster.
export interface BurnSource {
  sourceId: string;
  sourceAttack: number;
  sourceLevel: number;
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

// Weaken on the attacker and guard on the target both cut the damage of a hit. Sunder on the target raises it. Hex raises it for magic damage only.
export function damageFactorBetween(attacker: Combatant, target: Combatant, timeSeconds: number, damageKind: AttackKind = attacker.unit.attackKind): number {
  const hexFactor = damageKind === 'magic' ? 1 + statusStrength(target, 'hex', timeSeconds) : 1;
  return (1 - statusStrength(attacker, 'weaken', timeSeconds)) * (1 - statusStrength(target, 'guard', timeSeconds)) * (1 + statusStrength(target, 'sunder', timeSeconds)) * hexFactor;
}

export function defenceFactorOf(combatant: Combatant, timeSeconds: number): number {
  return 1 + statusStrength(combatant, 'fortify', timeSeconds);
}

// Empower adds a share of the main attribute of the unit. Skill also gives critical chance, so an Empowered Archer crits more.
export function empowerBonusesOf(combatant: Combatant, timeSeconds: number): { attackBonus: number; critChanceBonus: number } {
  const strength = statusStrength(combatant, 'empower', timeSeconds);
  const { mainAttribute, mainAttributeValue, skill } = combatant.unit;
  return {
    attackBonus: strength * mainAttributeValue,
    critChanceBonus: mainAttribute === 'skill' ? strength * skill * CRITICAL_CHANCE_PER_SKILL_POINT : 0,
  };
}

// A new status of the same kind replaces the old one, so statuses never stack.
export function applyStatus(combatant: Combatant, status: ActiveStatus): void {
  combatant.statuses = [...combatant.statuses.filter((active) => active.status !== status.status), status];
}
