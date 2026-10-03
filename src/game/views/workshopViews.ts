import { BASE_ITEMS } from '../../content/baseItems';
import { CATALYST_MATERIAL_ID, ITEM_LEVEL_ABOVE_HIGHEST_HERO } from '../../content/balance/items';
import { PROFESSION_IDS } from '../../content/baseItems';
import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import type { GameState } from '../../model/gameState';
import type { Item } from '../../model/item';
import { craftingExperienceToNextLevel, listRecipes } from '../../systems/crafting';
import { findEquipProblem, type EquipProblem } from '../../systems/equipment';
import { countMaterial } from '../../systems/inventory';
import { previewBaseStatRanges } from '../../systems/items';
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
  hasMaterials: boolean;
  requiredCraftLevel: number;
  isUnlocked: boolean;
  statRanges: Record<string, [number, number]>;
}

export interface CrafterView {
  professionId: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
}

export interface EquipOption {
  heroId: string;
  heroName: string;
  problem: EquipProblem | null;
}

export function listCrafters(state: GameState): CrafterView[] {
  return PROFESSION_IDS.map((professionId) => {
    const progress = state.crafters[professionId] ?? { level: 1, experience: 0 };
    return { professionId, level: progress.level, experience: progress.experience, experienceToNextLevel: craftingExperienceToNextLevel(progress.level) };
  });
}

export function listWorkshopRecipes(state: GameState): WorkshopRecipeView[] {
  const tiers = Array.from({ length: highestUnlockedTier(state) }, (_, index) => index + 1);
  const highestHeroLevel = state.company.reduce((highest, hero) => Math.max(highest, hero.level), 1);
  return tiers.flatMap((tier) =>
    listRecipes(tier).map((recipe) => {
      const base = requireById(BASE_ITEMS, recipe.baseId);
      const ingredients = recipe.ingredients.map((ingredient) => ({
        materialId: requireById(MATERIALS, ingredient.materialId).id,
        needed: ingredient.quantity,
        owned: countMaterial(state.backpack, ingredient.materialId),
      }));
      const crafterLevel = state.crafters[recipe.profession]?.level ?? 1;
      return {
        baseId: recipe.baseId,
        tier,
        mainMaterialId: recipe.ingredients[0]?.materialId ?? '',
        professionId: recipe.profession,
        sizeText: `${base.width}x${base.height}`,
        ingredients,
        hasMaterials: ingredients.every((ingredient) => ingredient.owned >= ingredient.needed),
        requiredCraftLevel: recipe.requiredCraftLevel,
        isUnlocked: crafterLevel >= recipe.requiredCraftLevel,
        statRanges: previewBaseStatRanges(recipe.baseId, tier, highestHeroLevel + ITEM_LEVEL_ABOVE_HIGHEST_HERO),
      };
    }),
  );
}

export function countCatalysts(state: GameState): number {
  return countMaterial(state.backpack, CATALYST_MATERIAL_ID);
}

export function listEquipOptions(state: GameState, item: Item): EquipOption[] {
  return state.company.map((hero) => ({ heroId: hero.id, heroName: hero.name, problem: findEquipProblem(hero, item) }));
}
