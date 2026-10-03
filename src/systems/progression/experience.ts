import {
  EXPERIENCE_RANK_MULTIPLIER,
  EXPERIENCE_TO_NEXT_LEVEL_BASE,
  EXPERIENCE_TO_NEXT_LEVEL_EXPONENT,
  KILLS_PER_LEVEL_BASE,
  KILLS_PER_LEVEL_GROWTH,
  LEVEL_CAP,
  LEVEL_GAP_FACTOR_MAXIMUM,
  LEVEL_GAP_FACTOR_MINIMUM,
  LEVEL_GAP_STEP,
} from '../../content/balance/progression';
import { clamp } from '../../kernel/math';
import type { UnitRank } from '../../model/battle';
import type { Hero } from '../../model/hero';

export function experienceToNextLevel(level: number): number {
  return Math.round(EXPERIENCE_TO_NEXT_LEVEL_BASE * level ** EXPERIENCE_TO_NEXT_LEVEL_EXPONENT);
}

export function experienceForKill(monsterLevel: number, heroLevel: number, monsterRank: UnitRank): number {
  const killsPerLevel = KILLS_PER_LEVEL_BASE + KILLS_PER_LEVEL_GROWTH * monsterLevel;
  const experienceAtMatchedLevel = experienceToNextLevel(monsterLevel) / killsPerLevel;
  const levelGapFactor = clamp(
    1 + LEVEL_GAP_STEP * (monsterLevel - heroLevel),
    LEVEL_GAP_FACTOR_MINIMUM,
    LEVEL_GAP_FACTOR_MAXIMUM,
  );
  const experience = experienceAtMatchedLevel * levelGapFactor * EXPERIENCE_RANK_MULTIPLIER[monsterRank];
  return Math.max(1, Math.round(experience));
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
