import {
  UPGRADE_CHANCE_AT_RECIPE_LEVEL,
  UPGRADE_CHANCE_FAR_ABOVE_RECIPE,
  UPGRADE_FAR_ABOVE_LEVELS,
  UPGRADE_MAXIMUM_LEVEL,
} from '../../content/balance/crafting';
import { clamp } from '../../kernel/math';
import type { Random } from '../../kernel/random';

// The chance to reach at least +level. It runs in a straight line from the value at the recipe level
// to the value for a crafter far above the recipe. A far higher crafter gains nothing more.
export function upgradeReachChance(level: number, crafterLevelsAboveRecipe: number): number {
  if (level <= 0) return 1;
  const closeness = clamp(crafterLevelsAboveRecipe / UPGRADE_FAR_ABOVE_LEVELS, 0, 1);
  const atRecipeLevel = UPGRADE_CHANCE_AT_RECIPE_LEVEL[level - 1] ?? 0;
  const farAbove = UPGRADE_CHANCE_FAR_ABOVE_RECIPE[level - 1] ?? 0;
  return atRecipeLevel + (farAbove - atRecipeLevel) * closeness;
}

// The chance to climb from step - 1 to step, given that the item reached step - 1.
export function upgradeStepChance(step: number, crafterLevelsAboveRecipe: number): number {
  return upgradeReachChance(step, crafterLevelsAboveRecipe) / upgradeReachChance(step - 1, crafterLevelsAboveRecipe);
}

// The roll stops at the first failed step, so +N needs N successes in a row.
export function rollUpgradeLevel(crafterLevelsAboveRecipe: number, random: Random): number {
  let upgradeLevel = 0;
  while (upgradeLevel < UPGRADE_MAXIMUM_LEVEL && random.chance(upgradeStepChance(upgradeLevel + 1, crafterLevelsAboveRecipe))) {
    upgradeLevel += 1;
  }
  return upgradeLevel;
}
