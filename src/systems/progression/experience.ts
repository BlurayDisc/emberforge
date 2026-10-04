import {
  EXPERIENCE_RANK_MULTIPLIER,
  EXPERIENCE_TO_NEXT_LEVEL_BASE,
  EXPERIENCE_TO_NEXT_LEVEL_EXPONENT,
  KILLS_PER_LEVEL_BASE,
  KILLS_PER_LEVEL_GROWTH,
  LEVEL_CAP,
} from '../../content/balance/progression';
import type { UnitRank } from '../../model/battle';
import type { Hero } from '../../model/hero';

export function experienceToNextLevel(level: number): number {
  return Math.round(EXPERIENCE_TO_NEXT_LEVEL_BASE * level ** EXPERIENCE_TO_NEXT_LEVEL_EXPONENT);
}

// A kill pays a fixed amount that depends only on the monster. A hero never changes it, so a monster far below the hero pays a very small part of the level.
export function experienceForKill(monsterLevel: number, monsterRank: UnitRank): number {
  const killsPerLevel = KILLS_PER_LEVEL_BASE + KILLS_PER_LEVEL_GROWTH * monsterLevel;
  const experienceOfNormalMonster = experienceToNextLevel(monsterLevel) / killsPerLevel;
  return Math.max(1, Math.round(experienceOfNormalMonster * EXPERIENCE_RANK_MULTIPLIER[monsterRank]));
}

export function applyExperience(hero: Hero, gainedExperience: number): Hero {
  let level = hero.level;
  let experience = hero.experience + gainedExperience;
  while (level < LEVEL_CAP && experience >= experienceToNextLevel(level)) {
    experience -= experienceToNextLevel(level);
    level += 1;
  }
  if (level === LEVEL_CAP) experience = 0;
  return { ...hero, level, experience };
}
