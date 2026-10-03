import { BASE_ITEMS, type BaseItemDefinition, type ProfessionId } from '../../content/baseItems';
import {
  LARGE_ITEM_CELL_THRESHOLD,
  LEVELS_PER_BRACKET,
  MAIN_INGREDIENT_CELLS_PER_UNIT,
  SECONDARY_INGREDIENT_LARGE_ITEM,
  SECONDARY_INGREDIENT_SMALL_ITEM,
} from '../../content/balance/items';
import { MATERIALS, type MaterialDefinition } from '../../content/materials';
import type { MaterialCategory } from '../../model/material';

export interface RecipeIngredient {
  materialId: string;
  quantity: number;
}

export interface Recipe {
  baseId: string;
  tier: number;
  profession: ProfessionId;
  requiredCraftLevel: number;
  ingredients: RecipeIngredient[];
}

function materialOfTier(tier: number, category: MaterialCategory): MaterialDefinition | undefined {
  return MATERIALS.find((material) => material.tier === tier && material.category === category);
}

function createRecipe(base: BaseItemDefinition, tier: number): Recipe | null {
  const mainMaterial = materialOfTier(tier, base.mainCategory);
  const secondaryMaterial = materialOfTier(tier, base.secondaryCategory);
  if (!mainMaterial || !secondaryMaterial) return null;

  const cells = base.width * base.height;
  const mainQuantity = Math.max(1, Math.ceil(cells / MAIN_INGREDIENT_CELLS_PER_UNIT));
  const secondaryQuantity =
    cells >= LARGE_ITEM_CELL_THRESHOLD ? SECONDARY_INGREDIENT_LARGE_ITEM : SECONDARY_INGREDIENT_SMALL_ITEM;
  return {
    baseId: base.id,
    tier,
    profession: base.profession,
    requiredCraftLevel: (tier - 1) * LEVELS_PER_BRACKET + base.craftLevelOffset,
    ingredients: [
      { materialId: mainMaterial.id, quantity: mainQuantity },
      { materialId: secondaryMaterial.id, quantity: secondaryQuantity },
    ],
  };
}

export function listRecipes(tier: number): Recipe[] {
  return BASE_ITEMS.flatMap((base) => {
    const recipe = createRecipe(base, tier);
    return recipe ? [recipe] : [];
  });
}

export function findRecipe(baseId: string, tier: number): Recipe | undefined {
  return listRecipes(tier).find((recipe) => recipe.baseId === baseId);
}
