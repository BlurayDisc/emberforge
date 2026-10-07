import { BASE_ITEMS } from '../../content/baseItems';
import { PROFESSION_IDS, type ProfessionId } from '../../content/baseItems';
import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import type { GameState } from '../../model/gameState';
import type { ClassId } from '../../model/hero';
import type { Item, ItemSlot } from '../../model/item';
import { craftSeconds, craftingExperienceToNextLevel, listRecipes, upgradeStepChance } from '../../systems/crafting';
import { isClassUnlocked } from '../classUnlocks';
import { classIdsThatCanUse, findEquipProblem, type EquipProblem } from '../../systems/equipment';
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
  // The material that names the item and tints its icon: the set material of a set piece, else the main material.
  resultMaterialId: string;
  setMaterialId: string | null;
  professionId: string;
  slot: ItemSlot;
  ingredients: IngredientView[];
  hasMaterials: boolean;
  requiredCraftLevel: number;
  feeCopper: number;
  canAffordFee: boolean;
  usableByClassIds: ClassId[];
  isUnlocked: boolean;
  craftSeconds: number;
  isCrafterBusy: boolean;
  itemLevel: number;
  statRanges: Record<string, [number, number]>;
  upgradeChance: number;
}

export interface CrafterView {
  professionId: ProfessionId;
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

// A recipe that only locked classes can use stays hidden, and the lists of classes only name hired or hireable classes. This keeps the early game short.
export function listWorkshopRecipes(state: GameState): WorkshopRecipeView[] {
  const tiers = Array.from({ length: highestUnlockedTier(state) }, (_, index) => index + 1);
  return tiers.flatMap((tier) =>
    listRecipes(tier).flatMap((recipe) => {
      const base = requireById(BASE_ITEMS, recipe.baseId);
      const usableByClassIds = classIdsThatCanUse(base).filter((classId) => isClassUnlocked(state, classId));
      if (usableByClassIds.length === 0) return [];
      const ingredients = recipe.ingredients.map((ingredient) => ({
        materialId: requireById(MATERIALS, ingredient.materialId).id,
        needed: ingredient.quantity,
        owned: countMaterial(state.backpack, ingredient.materialId),
      }));
      const crafterLevel = state.crafters[recipe.profession]?.level ?? 1;
      return [{
        baseId: recipe.baseId,
        tier,
        resultMaterialId: recipe.setMaterialId ?? recipe.ingredients[0]?.materialId ?? '',
        setMaterialId: recipe.setMaterialId,
        professionId: recipe.profession,
        slot: base.slot,
        ingredients,
        hasMaterials: ingredients.every((ingredient) => ingredient.owned >= ingredient.needed),
        requiredCraftLevel: recipe.requiredCraftLevel,
        feeCopper: recipe.feeCopper,
        canAffordFee: state.copper >= recipe.feeCopper,
        usableByClassIds,
        isUnlocked: crafterLevel >= recipe.requiredCraftLevel,
        craftSeconds: craftSeconds(recipe),
        isCrafterBusy: state.jobs.some((job) => job.kind === 'craft' && job.professionId === recipe.profession),
        upgradeChance: upgradeStepChance(1, crafterLevel - recipe.requiredCraftLevel),
        itemLevel: recipe.itemLevel,
        statRanges: previewBaseStatRanges(recipe.baseId, recipe.itemLevel),
      }];
    }),
  );
}

export function listEquipOptions(state: GameState, item: Item): EquipOption[] {
  return state.company.map((hero) => ({ heroId: hero.id, heroName: hero.name, problem: findEquipProblem(hero, item) }));
}
