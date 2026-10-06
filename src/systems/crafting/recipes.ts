import { BASE_ITEMS, type BaseItemDefinition, type ProfessionId } from '../../content/baseItems';
import { CRAFT_FEE_BASE_COPPER, CRAFT_FEE_PER_REQUIRED_LEVEL_COPPER } from '../../content/balance/crafting';
import {
  LARGE_ITEM_CELL_THRESHOLD,
  LEVELS_PER_BRACKET,
  SET_MATERIAL_LARGE_ITEM,
  SET_MATERIAL_SMALL_ITEM,
  SET_RECIPE_FIRST_BASE_CRAFT_LEVEL_OFFSET,
  SET_RECIPE_SLOTS,
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
  // Set when the recipe makes a set piece. The set material gives the piece its fixed bonus.
  setMaterialId: string | null;
  profession: ProfessionId;
  requiredCraftLevel: number;
  // The hero level that equips the item. It equals the recipe level, and never goes above the end of the tier.
  itemLevel: number;
  feeCopper: number;
  ingredients: RecipeIngredient[];
}

function materialOfTier(tier: number, category: MaterialCategory): MaterialDefinition | undefined {
  return MATERIALS.find((material) => material.tier === tier && material.category === category);
}

// The crafter takes a fee in copper for every item. It grows with the level the recipe needs.
export function craftFeeCopper(requiredCraftLevel: number): number {
  return Math.round(CRAFT_FEE_BASE_COPPER + CRAFT_FEE_PER_REQUIRED_LEVEL_COPPER * requiredCraftLevel);
}

function createRecipe(base: BaseItemDefinition, tier: number, setMaterial: MaterialDefinition | null): Recipe | null {
  const mainMaterial = materialOfTier(tier, base.mainCategory);
  if (!mainMaterial) return null;

  const cells = base.width * base.height;
  // Every set recipe of a base item opens with its basic recipe, even when the player does not own the set material yet.
  const requiredCraftLevel = (tier - 1) * LEVELS_PER_BRACKET + base.craftLevelOffset;
  const setMaterialQuantity = cells >= LARGE_ITEM_CELL_THRESHOLD ? SET_MATERIAL_LARGE_ITEM : SET_MATERIAL_SMALL_ITEM;
  return {
    baseId: base.id,
    tier,
    setMaterialId: setMaterial?.id ?? null,
    profession: base.profession,
    requiredCraftLevel,
    itemLevel: Math.min(requiredCraftLevel, tier * LEVELS_PER_BRACKET),
    feeCopper: craftFeeCopper(requiredCraftLevel),
    ingredients: [
      { materialId: mainMaterial.id, quantity: base.mainIngredientQuantity },
      ...(setMaterial ? [{ materialId: setMaterial.id, quantity: setMaterialQuantity }] : []),
    ],
  };
}

export function listRecipes(tier: number): Recipe[] {
  const setMaterials = MATERIALS.filter((material) => material.tier === tier && material.setBonus !== undefined);
  return BASE_ITEMS.flatMap((base) => {
    const canMakeSetPieces = SET_RECIPE_SLOTS.includes(base.slot) && base.craftLevelOffset >= SET_RECIPE_FIRST_BASE_CRAFT_LEVEL_OFFSET;
    const variants = [null, ...(canMakeSetPieces ? setMaterials : [])];
    return variants.flatMap((setMaterial) => {
      const recipe = createRecipe(base, tier, setMaterial);
      return recipe ? [recipe] : [];
    });
  });
}

export function findRecipe(baseId: string, tier: number, setMaterialId: string | null = null): Recipe | undefined {
  return listRecipes(tier).find((recipe) => recipe.baseId === baseId && recipe.setMaterialId === setMaterialId);
}
