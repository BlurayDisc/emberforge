import {
  ACTION_THRESHOLD,
  CRITICAL_CHANCE_PER_SKILL_POINT,
  CRITICAL_DAMAGE_MULTIPLIER,
  MAXIMUM_CRITICAL_CHANCE,
  MITIGATION_BASE,
  MITIGATION_PER_ATTACKER_LEVEL,
} from '../../content/balance/battle';
import { CLASSES } from '../../content/classes';
import { requireById } from '../../content/lookup';
import type { BattleUnit } from '../../model/battle';
import type { Hero } from '../../model/hero';
import type { StatBlock } from '../../model/statBlock';

function statAtLevel(base: number, growthPerLevel: number, level: number): number {
  return Math.round(base + growthPerLevel * (level - 1));
}

const STAT_NAMES: readonly (keyof StatBlock)[] = ['hp', 'strength', 'magic', 'skill', 'speed', 'defence', 'resistance'];

function gearBonusForStat(hero: Hero, stat: keyof StatBlock): number {
  return Object.values(hero.equipment).reduce((total, item) => {
    const fromBase = item.baseStats[stat] ?? 0;
    const fromAffixes = item.affixes.reduce((sum, affix) => (affix.stat === stat ? sum + affix.value : sum), 0);
    return total + fromBase + fromAffixes;
  }, 0);
}

export function computeHeroStats(hero: Hero): StatBlock {
  const { baseStats, growthPerLevel } = requireById(CLASSES, hero.classId);
  const stats = {} as StatBlock;
  for (const stat of STAT_NAMES) {
    stats[stat] = statAtLevel(baseStats[stat], growthPerLevel[stat], hero.level) + gearBonusForStat(hero, stat);
  }
  return stats;
}

export function heroToBattleUnit(hero: Hero): BattleUnit {
  const classDefinition = requireById(CLASSES, hero.classId);
  const stats = computeHeroStats(hero);
  return {
    id: hero.id,
    definitionId: hero.classId,
    name: hero.name,
    side: 'party',
    rank: 'hero',
    spriteKey: classDefinition.spriteKey,
    level: hero.level,
    maxHp: stats.hp,
    hp: Math.max(1, Math.round(stats.hp * hero.healthFraction)),
    attack: classDefinition.attackKind === 'magic' ? stats.magic : stats.strength,
    attackKind: classDefinition.attackKind,
    defence: stats.defence,
    resistance: stats.resistance,
    speed: stats.speed,
    critChance: Math.min(MAXIMUM_CRITICAL_CHANCE, stats.skill * CRITICAL_CHANCE_PER_SKILL_POINT),
    behavior: classDefinition.behavior,
  };
}

export function computeHeroPower(hero: Hero): number {
  const unit = heroToBattleUnit({ ...hero, healthFraction: 1 });
  const reduction = unit.defence / (unit.defence + MITIGATION_BASE + MITIGATION_PER_ATTACKER_LEVEL * unit.level);
  const offence = unit.attack * (unit.speed / ACTION_THRESHOLD) * (1 + unit.critChance * (CRITICAL_DAMAGE_MULTIPLIER - 1));
  const durability = unit.maxHp / (1 - reduction);
  return Math.round(Math.sqrt(offence * durability));
}
