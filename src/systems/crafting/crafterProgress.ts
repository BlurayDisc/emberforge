import { CRAFT_SECONDS_BASE, CRAFT_SECONDS_PER_REQUIRED_LEVEL } from '../../content/balance/crafting';
import {
  CRAFTING_EXPERIENCE_PER_MATERIAL_BASE,
  CRAFTING_EXPERIENCE_PER_MATERIAL_PER_REQUIRED_LEVEL,
  CRAFTING_EXPERIENCE_TO_NEXT_BASE,
  CRAFTING_EXPERIENCE_TO_NEXT_EXPONENT,
  CRAFTING_LEVEL_GAP_FACTOR_MINIMUM,
  CRAFTING_LEVEL_GAP_STEP,
  CRAFTING_MAXIMUM_LEVEL,
} from '../../content/balance/crafting';
import { clamp } from '../../kernel/math';
import type { CrafterProgress } from '../../model/gameState';
import type { Recipe } from './recipes';

export function craftingExperienceToNextLevel(level: number): number {
  return Math.round(CRAFTING_EXPERIENCE_TO_NEXT_BASE * level ** CRAFTING_EXPERIENCE_TO_NEXT_EXPONENT);
}

// A craft pays for each unit of the main material, so crafter experience follows the number of dungeon runs that dropped it.
// A craft gives less experience when the crafter is far above the recipe level.
export function craftingExperienceForCraft(recipe: Recipe, crafterLevel: number): number {
  const mainMaterialQuantity = recipe.ingredients[0]!.quantity;
  const base = mainMaterialQuantity * (CRAFTING_EXPERIENCE_PER_MATERIAL_BASE + CRAFTING_EXPERIENCE_PER_MATERIAL_PER_REQUIRED_LEVEL * recipe.requiredCraftLevel);
  const gapFactor = clamp(1 - CRAFTING_LEVEL_GAP_STEP * (crafterLevel - recipe.requiredCraftLevel), CRAFTING_LEVEL_GAP_FACTOR_MINIMUM, 1);
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

// Crafting takes time, longer for higher recipes.
export function craftSeconds(requiredCraftLevel: number): number {
  return Math.round(CRAFT_SECONDS_BASE + CRAFT_SECONDS_PER_REQUIRED_LEVEL * requiredCraftLevel);
}
