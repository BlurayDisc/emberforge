import {
  DAMAGE_VARIANCE_FRACTION,
  MITIGATION_BASE,
  MITIGATION_PER_ATTACKER_LEVEL,
} from '../../content/balance/battle';
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
}

export function rollDamage(attacker: BattleUnit, target: BattleUnit, random: Random, modifiers: Partial<DamageModifiers> = {}): DamageRoll {
  const { power = 1, damageKind = attacker.attackKind, statusFactor = 1 } = modifiers;
  const mitigationStat = damageKind === 'magic' ? target.resistance : target.defence;
  const reduction = mitigationStat / (mitigationStat + MITIGATION_BASE + MITIGATION_PER_ATTACKER_LEVEL * attacker.level);
  const variance = 1 + (random.nextFloat() * 2 - 1) * DAMAGE_VARIANCE_FRACTION;
  const isCritical = random.chance(attacker.critChance);
  const criticalMultiplier = isCritical ? attacker.criticalDamageMultiplier : 1;
  const amount = Math.max(1, Math.round(attacker.attack * power * (1 - reduction) * variance * criticalMultiplier * statusFactor));
  return { amount, isCritical };
}
