import {
  CRAFTING_EXPERIENCE_BASE,
  CRAFTING_EXPERIENCE_PER_REQUIRED_LEVEL,
  CRAFTING_EXPERIENCE_TO_NEXT_BASE,
  CRAFTING_EXPERIENCE_TO_NEXT_EXPONENT,
  CRAFTING_LEVEL_GAP_FACTOR_MINIMUM,
  CRAFTING_LEVEL_GAP_STEP,
  CRAFTING_MAXIMUM_LEVEL,
} from '../../content/balance/crafting';
import { clamp } from '../../kernel/math';
import type { CrafterProgress } from '../../model/gameState';

export function craftingExperienceToNextLevel(level: number): number {
  return Math.round(CRAFTING_EXPERIENCE_TO_NEXT_BASE * level ** CRAFTING_EXPERIENCE_TO_NEXT_EXPONENT);
}

// A craft gives less experience when the crafter is far above the recipe level.
export function craftingExperienceForCraft(requiredLevel: number, crafterLevel: number): number {
  const base = CRAFTING_EXPERIENCE_BASE + CRAFTING_EXPERIENCE_PER_REQUIRED_LEVEL * requiredLevel;
  const gapFactor = clamp(1 - CRAFTING_LEVEL_GAP_STEP * (crafterLevel - requiredLevel), CRAFTING_LEVEL_GAP_FACTOR_MINIMUM, 1);
  return Math.max(1, Math.round(base * gapFactor));
}

export function applyCraftingExperience(progress: CrafterProgress, gainedExperience: number): CrafterProgress {
  let level = progress.level;
  let experience = progress.experience + gainedExperience;
  while (level < CRAFTING_MAXIMUM_LEVEL && experience >= craftingExperienceToNextLevel(level)) {
    experience -= craftingExperienceToNextLevel(level);
    level += 1;
  }
  return { level, experience: level === CRAFTING_MAXIMUM_LEVEL ? 0 : experience };
}
