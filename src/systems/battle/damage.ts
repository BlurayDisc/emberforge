import { MAXIMUM_CRITICAL_CHANCE, MAXIMUM_DAMAGE_CUT, MITIGATION_BASE, MITIGATION_PER_ATTACKER_LEVEL } from '../../content/balance/battle';
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
  // Statuses from both sides, already combined.
  statusFactor: number;
  // Fortify on the target. It multiplies the Defence that the target uses against this hit.
  targetDefenceFactor: number;
  // Damage added to the base of the hit before the target's armour reduces it (for example a share of the caster's Defence).
  bonusDamage: number;
  // Empower on the attacker: attack added before the power is applied, and critical chance added to the chance of the attacker.
  attackBonus: number;
  critChanceBonus: number;
}

// The share of a hit that armour (or resistance) cuts. A higher level attacker cuts through armour more easily.
// The cut never passes the maximum, so a hero is never close to immune, even with Fortify.
export function mitigationShare(mitigationStat: number, attackerLevel: number): number {
  return Math.min(MAXIMUM_DAMAGE_CUT, mitigationStat / (mitigationStat + MITIGATION_BASE + MITIGATION_PER_ATTACKER_LEVEL * attackerLevel));
}

export function rollDamage(attacker: BattleUnit, target: BattleUnit, random: Random, modifiers: Partial<DamageModifiers> = {}): DamageRoll {
  const { power = 1, damageKind = attacker.attackKind, statusFactor = 1, targetDefenceFactor = 1, bonusDamage = 0, attackBonus = 0, critChanceBonus = 0 } = modifiers;
  const mitigationStat = damageKind === 'magic' ? target.resistance : target.defence * targetDefenceFactor * (1 - (attacker.armourPenetration ?? 0));
  const reduction = mitigationShare(mitigationStat, attacker.level);
  // Each unit has its own swing: a steady class hits for 90-110% of its damage, a wild class for 80-120%.
  const variance = 1 + (random.nextFloat() * 2 - 1) * attacker.damageVarianceFraction;
  const isCritical = random.chance(Math.min(MAXIMUM_CRITICAL_CHANCE, attacker.critChance + critChanceBonus));
  const criticalMultiplier = isCritical ? attacker.criticalDamageMultiplier : 1;
  const amount = Math.max(1, Math.round(((attacker.attack + attackBonus) * power + bonusDamage) * (1 - reduction) * variance * criticalMultiplier * statusFactor));
  return { amount, isCritical };
}
