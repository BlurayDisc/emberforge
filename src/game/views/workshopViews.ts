import { BASE_ITEMS, PROFESSION_LABELS } from '../../content/baseItems';
import { CATALYST_MATERIAL_ID } from '../../content/balance/items';
import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import type { GameState } from '../../model/gameState';
import type { Item } from '../../model/item';
import { listRecipes } from '../../systems/crafting';
import { findEquipProblem } from '../../systems/equipment';
import { countMaterial } from '../../systems/inventory';
import { highestUnlockedTier } from '../unlockedTier';

export interface IngredientView {
  materialName: string;
  needed: number;
  owned: number;
}

export interface WorkshopRecipeView {
  baseId: string;
  tier: number;
  itemName: string;
  professionLabel: string;
  sizeText: string;
  ingredients: IngredientView[];
  canCraft: boolean;
}

export interface EquipOption {
  heroId: string;
  heroName: string;
  problem: string | null;
}

export function listWorkshopRecipes(state: GameState): WorkshopRecipeView[] {
  const tiers = Array.from({ length: highestUnlockedTier(state) }, (_, index) => index + 1);
  return tiers.flatMap((tier) =>
    listRecipes(tier).map((recipe) => {
      const base = requireById(BASE_ITEMS, recipe.baseId);
      const ingredients = recipe.ingredients.map((ingredient) => {
        const material = requireById(MATERIALS, ingredient.materialId);
        return {
          materialName: material.name,
          needed: ingredient.quantity,
          owned: countMaterial(state.backpack, ingredient.materialId),
        };
      });
      const mainMaterial = requireById(MATERIALS, recipe.ingredients[0]?.materialId ?? '');
      return {
        baseId: recipe.baseId,
        tier,
        itemName: `${mainMaterial.craftedItemPrefix ?? mainMaterial.name} ${base.name}`,
        professionLabel: PROFESSION_LABELS[base.profession],
        sizeText: `${base.width}×${base.height}`,
        ingredients,
        canCraft: ingredients.every((ingredient) => ingredient.owned >= ingredient.needed),
      };
    }),
  );
}

export function countCatalysts(state: GameState): number {
  return countMaterial(state.backpack, CATALYST_MATERIAL_ID);
}


export function listEquipOptions(state: GameState, item: Item): EquipOption[] {
  return state.company.map((hero) => ({
    heroId: hero.id,
    heroName: hero.name,
    problem: findEquipProblem(hero, item),
  }));
}
