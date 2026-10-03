import { BASE_ITEMS } from '../../content/baseItems';
import { CATALYST_MATERIAL_ID } from '../../content/balance/items';
import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import type { GameState } from '../../model/gameState';
import type { Item } from '../../model/item';
import { listRecipes } from '../../systems/crafting';
import { findEquipProblem, type EquipProblem } from '../../systems/equipment';
import { countMaterial } from '../../systems/inventory';
import { highestUnlockedTier } from '../unlockedTier';

export interface IngredientView {
  materialId: string;
  needed: number;
  owned: number;
}

export interface WorkshopRecipeView {
  baseId: string;
  tier: number;
  mainMaterialId: string;
  professionId: string;
  sizeText: string;
  ingredients: IngredientView[];
  canCraft: boolean;
}

export interface EquipOption {
  heroId: string;
  heroName: string;
  problem: EquipProblem | null;
}

export function listWorkshopRecipes(state: GameState): WorkshopRecipeView[] {
  const tiers = Array.from({ length: highestUnlockedTier(state) }, (_, index) => index + 1);
  return tiers.flatMap((tier) =>
    listRecipes(tier).map((recipe) => {
      const base = requireById(BASE_ITEMS, recipe.baseId);
      const ingredients = recipe.ingredients.map((ingredient) => {
        const material = requireById(MATERIALS, ingredient.materialId);
        return {
          materialId: material.id,
          needed: ingredient.quantity,
          owned: countMaterial(state.backpack, ingredient.materialId),
        };
      });
      return {
        baseId: recipe.baseId,
        tier,
        mainMaterialId: recipe.ingredients[0]?.materialId ?? '',
        professionId: base.profession,
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

export interface BackpackItemOption {
  item: Item;
  problem: EquipProblem | null;
}

export function listBackpackItemsForHero(state: GameState, heroId: string): BackpackItemOption[] {
  const hero = state.company.find((candidate) => candidate.id === heroId);
  if (!hero) return [];
  const options = state.backpack.flatMap((entry) =>
    entry.content.kind === 'item' ? [{ item: entry.content.item, problem: findEquipProblem(hero, entry.content.item) }] : [],
  );
  return options.sort((first, second) => Number(first.problem !== null) - Number(second.problem !== null));
}
