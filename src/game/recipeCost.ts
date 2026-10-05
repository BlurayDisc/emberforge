import { requireById } from '../content/lookup';
import { MATERIALS } from '../content/materials';
import type { Recipe } from '../systems/crafting';

export function ingredientCountOf(recipe: Recipe): number {
  return recipe.ingredients.reduce((total, ingredient) => total + ingredient.quantity, 0);
}

// The materials at their sell value plus the crafter fee. A crafted or dropped item is priced from it.
export function craftingCostCopperOf(recipe: Recipe): number {
  const ingredientValueCopper = recipe.ingredients.reduce((total, ingredient) => total + requireById(MATERIALS, ingredient.materialId).sellValueCopper * ingredient.quantity, 0);
  return ingredientValueCopper + recipe.feeCopper;
}
