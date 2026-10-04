import { LEVELS_PER_BRACKET, QUALITY_WEIGHTS, SELL_GROWTH_PER_ITEM_LEVEL, SELL_QUALITY_FACTOR } from '../../src/content/balance/items';
import { requireById } from '../../src/content/lookup';
import { MATERIALS } from '../../src/content/materials';
import { listRecipes, type Recipe } from '../../src/systems/crafting';

export interface CraftedSales {
  itemsCrafted: number;
  // Copper from selling the items, minus the crafter fees, plus the leftover materials that no basic recipe uses (set materials and essence), sold as they are.
  // Quality is the average of the quality odds, not a roll.
  netCopper: number;
}

function expectedQualityFactor(): number {
  const weights = Object.entries(QUALITY_WEIGHTS) as Array<[keyof typeof QUALITY_WEIGHTS, number]>;
  const totalWeight = weights.reduce((sum, [, weight]) => sum + weight, 0);
  return weights.reduce((sum, [quality, weight]) => sum + (weight / totalWeight) * SELL_QUALITY_FACTOR[quality], 0);
}

function netCopperOfCraft(recipe: Recipe): number {
  const ingredientCopper = recipe.ingredients.reduce((sum, ingredient) => sum + requireById(MATERIALS, ingredient.materialId).sellValueCopper * ingredient.quantity, 0);
  const levelFactor = 1 + SELL_GROWTH_PER_ITEM_LEVEL * (recipe.itemLevel - 1);
  return (ingredientCopper + recipe.feeCopper) * expectedQualityFactor() * levelFactor - recipe.feeCopper;
}

// The player turns held materials into the most profitable basic recipes it can make, and sells every item and every leftover material.
// The crafter level is the hero level, so a recipe is open when its crafter level is at most the hero level.
export function craftAndSellAll(materialsHeld: Readonly<Record<string, number>>, heroLevel: number): CraftedSales {
  const tier = Math.ceil(heroLevel / LEVELS_PER_BRACKET);
  const recipes = listRecipes(tier).filter((recipe) => recipe.setMaterialId === null && recipe.requiredCraftLevel <= heroLevel);
  const remaining = { ...materialsHeld };
  const canCraft = (recipe: Recipe): boolean => recipe.ingredients.every((ingredient) => (remaining[ingredient.materialId] ?? 0) >= ingredient.quantity);
  let itemsCrafted = 0;
  let netCopper = 0;
  for (;;) {
    const affordable = recipes.filter(canCraft);
    if (affordable.length === 0) {
      const leftoverCopper = Object.entries(remaining).reduce((sum, [materialId, quantity]) => sum + requireById(MATERIALS, materialId).sellValueCopper * quantity, 0);
      return { itemsCrafted, netCopper: netCopper + leftoverCopper };
    }
    const best = affordable.reduce((top, recipe) => (netCopperOfCraft(recipe) > netCopperOfCraft(top) ? recipe : top));
    for (const ingredient of best.ingredients) remaining[ingredient.materialId] = (remaining[ingredient.materialId] ?? 0) - ingredient.quantity;
    itemsCrafted += 1;
    netCopper += netCopperOfCraft(best);
  }
}
