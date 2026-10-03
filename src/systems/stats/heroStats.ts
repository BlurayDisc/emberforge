import {
  CRITICAL_CHANCE_PER_SKILL_POINT,
  MAXIMUM_CRITICAL_CHANCE,
} from '../../content/balance/battle';
import { CLASSES } from '../../content/classes';
import { requireById } from '../../content/lookup';
import type { BattleUnit } from '../../model/battle';
import type { Hero } from '../../model/hero';
import type { StatBlock } from '../../model/statBlock';

function statAtLevel(base: number, growthPerLevel: number, level: number): number {
  return Math.round(base + growthPerLevel * (level - 1));
}

export function computeHeroStats(hero: Hero): StatBlock {
  const { baseStats, growthPerLevel } = requireById(CLASSES, hero.classId);
  return {
    hp: statAtLevel(baseStats.hp, growthPerLevel.hp, hero.level),
    strength: statAtLevel(baseStats.strength, growthPerLevel.strength, hero.level),
    magic: statAtLevel(baseStats.magic, growthPerLevel.magic, hero.level),
    skill: statAtLevel(baseStats.skill, growthPerLevel.skill, hero.level),
    speed: statAtLevel(baseStats.speed, growthPerLevel.speed, hero.level),
    defence: statAtLevel(baseStats.defence, growthPerLevel.defence, hero.level),
    resistance: statAtLevel(baseStats.resistance, growthPerLevel.resistance, hero.level),
  };
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
