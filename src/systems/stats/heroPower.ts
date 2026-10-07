import { MINIMUM_ATTACK_SPEED_FACTOR } from '../../content/balance/battle';
import { monsterStatsAtLevel } from '../../content/balance/monsterScaling';
import type { Hero } from '../../model/hero';
import { heroToBattleUnit } from './heroStats';

// One number for comparing gear. Offence is damage per second with crits. Durability is HP counted in hits of a same-level monster, so flat Defence is worth what it takes off such a hit.
export function computeHeroPower(hero: Hero): number {
  const unit = heroToBattleUnit({ ...hero, healthFraction: 1 });
  const monsterHit = monsterStatsAtLevel(unit.level).damage;
  const hitAfterDefence = Math.max(1, monsterHit - unit.defence);
  const attackSeconds = unit.baseAttackSeconds / Math.max(MINIMUM_ATTACK_SPEED_FACTOR, 1 + unit.attackSpeedBonus);
  const offence = (unit.attack / attackSeconds) * (1 + unit.critChance * (unit.criticalDamageMultiplier - 1));
  const durability = (unit.maxHp / hitAfterDefence) * monsterHit;
  return Math.round(Math.sqrt(offence * durability));
}
