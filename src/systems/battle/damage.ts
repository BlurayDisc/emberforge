import { MAXIMUM_CRITICAL_CHANCE } from '../../content/balance/battle';
import type { Random } from '../../kernel/random';
import type { AttackKind, BattleUnit } from '../../model/battle';

export interface DamageRoll {
  amount: number;
  isCritical: boolean;
}

export interface DamageModifiers {
  // The part of the attacker's attack that the hit uses. A basic attack uses all of it.
  power: number;
  damageKind: AttackKind;
  // Weaken and Hex, already combined. They change the damage before the armour is taken off.
  statusFactor: number;
  // Fortify, Guard and Sunder on the target. It multiplies the flat armour that the target uses against this hit.
  targetArmourFactor: number;
  // Damage added to the base of the hit before the swing and the critical multiplier (for example a share of the caster's Defence).
  bonusDamage: number;
  // Empower on the attacker: attack added before the power is applied.
  attackBonus: number;
}

// The flat armour that a hit meets: Defence for a physical hit (minus the armour penetration of the attacker), Resistance for a magical hit.
function armourAgainst(attacker: BattleUnit, target: BattleUnit, damageKind: AttackKind, targetArmourFactor: number): number {
  const penetration = damageKind === 'magic' ? 0 : attacker.armourPenetration ?? 0;
  return (damageKind === 'magic' ? target.resistance : target.defence) * targetArmourFactor * (1 - penetration);
}

// hit = attack x swing x spell power x critical multiplier, minus the flat armour. A hit never does less than 1. The result is rounded once, at the end.
export function rollDamage(attacker: BattleUnit, target: BattleUnit, random: Random, modifiers: Partial<DamageModifiers> = {}): DamageRoll {
  const { power = 1, damageKind = attacker.attackKind, statusFactor = 1, targetArmourFactor = 1, bonusDamage = 0, attackBonus = 0 } = modifiers;
  // Each unit has its own swing: a steady class hits for 90-110% of its attack, a wild class for 80-120%.
  const swing = 1 + (random.nextFloat() * 2 - 1) * attacker.damageVarianceFraction;
  const isCritical = random.chance(Math.min(MAXIMUM_CRITICAL_CHANCE, attacker.critChance));
  const criticalMultiplier = isCritical ? attacker.criticalDamageMultiplier : 1;
  const hitBeforeArmour = ((attacker.attack + attackBonus) * power + bonusDamage) * swing * criticalMultiplier * statusFactor;
  const amount = Math.max(1, Math.round(hitBeforeArmour - armourAgainst(attacker, target, damageKind, targetArmourFactor)));
  return { amount, isCritical };
}
