import { CATALYST_MATERIAL_ID, ITEM_LEVEL_ABOVE_HIGHEST_HERO } from '../../content/balance/items';
import { BASE_ITEMS } from '../../content/baseItems';
import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import { createRandom } from '../../kernel/random';
import type { BackpackEntry } from '../../model/backpack';
import { applyCraftingExperience, craftingExperienceForCraft, findRecipe, type Recipe } from '../../systems/crafting';
import { addItem, countMaterial, removeMaterials } from '../../systems/inventory';
import { generateCraftedItem } from '../../systems/items';
import { CommandRejected, type Command } from '../gameStore';
import { highestUnlockedTier } from '../unlockedTier';

function consumeIngredients(entries: readonly BackpackEntry[], recipe: Recipe, usesCatalyst: boolean): BackpackEntry[] {
  const required = usesCatalyst
    ? [...recipe.ingredients, { materialId: CATALYST_MATERIAL_ID, quantity: 1 }]
    : recipe.ingredients;
  let remaining: BackpackEntry[] | null = [...entries];
  for (const ingredient of required) {
    remaining = removeMaterials(remaining, ingredient.materialId, ingredient.quantity);
    if (remaining === null) throw new CommandRejected('reject.missingMaterials');
  }
  return remaining;
}

export function craftItemCommand(baseId: string, tier: number, usesCatalyst: boolean): Command {
  return (state) => {
    const recipe = findRecipe(baseId, tier);
    if (!recipe) throw new CommandRejected('reject.noRecipe');
    if (tier > highestUnlockedTier(state)) throw new CommandRejected('reject.recipeLocked');
    const crafter = state.crafters[recipe.profession] ?? { level: 1, experience: 0 };
    if (crafter.level < recipe.requiredCraftLevel) {
      throw new CommandRejected('reject.craftLevelTooLow', { profession: recipe.profession, level: recipe.requiredCraftLevel });
    }
    if (usesCatalyst && countMaterial(state.backpack, CATALYST_MATERIAL_ID) < 1) {
      throw new CommandRejected('reject.noCatalyst');
    }

    const backpackAfterPayment = consumeIngredients(state.backpack, recipe, usesCatalyst);
    const ingredientValueCopper = recipe.ingredients.reduce(
      (total, ingredient) => total + requireById(MATERIALS, ingredient.materialId).sellValueCopper * ingredient.quantity,
      0,
    );
    const highestHeroLevel = state.company.reduce((highest, hero) => Math.max(highest, hero.level), 1);
    const itemNumber = state.itemsCrafted + 1;

    const item = generateCraftedItem(
      {
        itemId: `item-${itemNumber}`,
        baseId: requireById(BASE_ITEMS, baseId).id,
        tier,
        maximumItemLevel: highestHeroLevel + ITEM_LEVEL_ABOVE_HIGHEST_HERO,
        usesCatalyst,
        ingredientValueCopper,
      },
      createRandom(state.seed).fork(`craft-${itemNumber}`),
    );
    const backpackWithItem = addItem(backpackAfterPayment, item);
    if (backpackWithItem === null) throw new CommandRejected('reject.backpackFullForItem');
    const gainedExperience = craftingExperienceForCraft(recipe.requiredCraftLevel, crafter.level);
    return {
      ...state,
      backpack: backpackWithItem,
      itemsCrafted: itemNumber,
      crafters: { ...state.crafters, [recipe.profession]: applyCraftingExperience(crafter, gainedExperience) },
    };
  };
}
