import {
  CRITICAL_DAMAGE_MULTIPLIER,
  DAMAGE_VARIANCE_FRACTION,
  MITIGATION_BASE,
  MITIGATION_PER_ATTACKER_LEVEL,
} from '../../content/balance/battle';
import type { Random } from '../../kernel/random';
import type { BattleUnit } from '../../model/battle';

export interface DamageRoll {
  amount: number;
  isCritical: boolean;
}

export function rollDamage(attacker: BattleUnit, target: BattleUnit, random: Random): DamageRoll {
  const mitigationStat = attacker.attackKind === 'magic' ? target.resistance : target.defence;
  const reduction = mitigationStat / (mitigationStat + MITIGATION_BASE + MITIGATION_PER_ATTACKER_LEVEL * attacker.level);
  const variance = 1 + (random.nextFloat() * 2 - 1) * DAMAGE_VARIANCE_FRACTION;
  const isCritical = random.chance(attacker.critChance);
  const criticalMultiplier = isCritical ? CRITICAL_DAMAGE_MULTIPLIER : 1;
  const amount = Math.max(1, Math.round(attacker.attack * (1 - reduction) * variance * criticalMultiplier));
  return { amount, isCritical };
}
