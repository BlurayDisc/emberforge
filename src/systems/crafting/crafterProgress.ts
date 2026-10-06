import { CRAFT_SECONDS_BASE, CRAFT_SECONDS_FACTOR_PER_MATERIAL, CRAFT_SECONDS_PER_REQUIRED_LEVEL, CRAFT_SECONDS_REFERENCE_MATERIAL_COUNT } from '../../content/balance/crafting';
import {
  CRAFTING_EXPERIENCE_PER_MATERIAL_BASE,
  CRAFTING_EXPERIENCE_PER_MATERIAL_PER_REQUIRED_LEVEL,
  CRAFTING_EXPERIENCE_TO_NEXT_BASE,
  CRAFTING_EXPERIENCE_TO_NEXT_BY_LEVEL,
  CRAFTING_EXPERIENCE_TO_NEXT_EXPONENT,
  CRAFTING_LEVEL_GAP_FACTOR_MINIMUM,
  CRAFTING_LEVEL_GAP_STEP,
  CRAFTING_MAXIMUM_LEVEL,
  CRAFTING_LEVELS_PER_CRAFT_CAP_BELOW_LEVEL,
  CRAFTING_MAXIMUM_LEVELS_PER_CRAFT,
} from '../../content/balance/crafting';
import { clamp } from '../../kernel/math';
import type { CrafterProgress } from '../../model/gameState';
import type { Recipe } from './recipes';

// The first levels follow the experience of the best recipe the crafter can make, so a level takes 1 craft early and 4 crafts at level 9. Later levels use the formula.
export function craftingExperienceToNextLevel(level: number): number {
  return CRAFTING_EXPERIENCE_TO_NEXT_BY_LEVEL[level - 1] ?? Math.round(CRAFTING_EXPERIENCE_TO_NEXT_BASE * level ** CRAFTING_EXPERIENCE_TO_NEXT_EXPONENT);
}

// A craft pays for each unit of the main material, so crafter experience follows the number of dungeon runs that dropped it.
// A craft gives less experience when the crafter is far above the recipe level.
export function craftingExperienceForCraft(recipe: Recipe, crafterLevel: number): number {
  const mainMaterialQuantity = recipe.ingredients[0]!.quantity;
  const base = mainMaterialQuantity * (CRAFTING_EXPERIENCE_PER_MATERIAL_BASE + CRAFTING_EXPERIENCE_PER_MATERIAL_PER_REQUIRED_LEVEL * recipe.requiredCraftLevel);
  const gapFactor = clamp(1 - CRAFTING_LEVEL_GAP_STEP * (crafterLevel - recipe.requiredCraftLevel), CRAFTING_LEVEL_GAP_FACTOR_MINIMUM, 1);
  return Math.max(1, Math.round(base * gapFactor));
}

// A young crafter (below the cap level) gains at most CRAFTING_MAXIMUM_LEVELS_PER_CRAFT levels from one craft, so the first big craft does not skip levels. The rest of the experience stays banked for the next craft.
export function applyCraftingExperience(progress: CrafterProgress, gainedExperience: number): CrafterProgress {
  let level = progress.level;
  let experience = progress.experience + gainedExperience;
  const levelCeiling = progress.level < CRAFTING_LEVELS_PER_CRAFT_CAP_BELOW_LEVEL ? progress.level + CRAFTING_MAXIMUM_LEVELS_PER_CRAFT : CRAFTING_MAXIMUM_LEVEL;
  while (level < CRAFTING_MAXIMUM_LEVEL && level < levelCeiling && experience >= craftingExperienceToNextLevel(level)) {
    experience -= craftingExperienceToNextLevel(level);
    level += 1;
  }
  return { level, experience: level === CRAFTING_MAXIMUM_LEVEL ? 0 : experience };
}

// Crafting takes time, longer for higher recipes. Each main material above or below the reference count changes the time by a fixed step, so 1 material takes 70% of the time of 2.
export function craftSeconds(recipe: Recipe): number {
  const materialFactor = 1 + CRAFT_SECONDS_FACTOR_PER_MATERIAL * (recipe.ingredients[0]!.quantity - CRAFT_SECONDS_REFERENCE_MATERIAL_COUNT);
  return Math.max(1, Math.round((CRAFT_SECONDS_BASE + CRAFT_SECONDS_PER_REQUIRED_LEVEL * recipe.requiredCraftLevel) * materialFactor));
}
