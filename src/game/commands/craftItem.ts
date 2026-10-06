import { BASE_ITEMS } from '../../content/baseItems';
import { requireById } from '../../content/lookup';
import { createRandom } from '../../kernel/random';
import type { BackpackEntry } from '../../model/backpack';
import { craftSeconds, craftingExperienceForCraft, findRecipe, rollUpgradeLevel, type Recipe } from '../../systems/crafting';
import { removeMaterials } from '../../systems/inventory';
import { generateCraftedItem } from '../../systems/items';
import { craftingCostCopperOf, ingredientCountOf } from '../recipeCost';
import { CommandRejected, type Command } from '../gameStore';
import { highestUnlockedTier } from '../unlockedTier';

function consumeIngredients(entries: readonly BackpackEntry[], recipe: Recipe): BackpackEntry[] {
  let remaining: BackpackEntry[] | null = [...entries];
  for (const ingredient of recipe.ingredients) {
    remaining = removeMaterials(remaining, ingredient.materialId, ingredient.quantity);
    if (remaining === null) throw new CommandRejected('reject.missingMaterials');
  }
  return remaining;
}

export function craftItemCommand(baseId: string, tier: number, setMaterialId: string | null, nowMs: number): Command {
  return (state) => {
    const recipe = findRecipe(baseId, tier, setMaterialId);
    if (!recipe) throw new CommandRejected('reject.noRecipe');
    if (tier > highestUnlockedTier(state)) throw new CommandRejected('reject.recipeLocked');
    const crafter = state.crafters[recipe.profession] ?? { level: 1, experience: 0 };
    if (crafter.level < recipe.requiredCraftLevel) {
      throw new CommandRejected('reject.craftLevelTooLow', { profession: recipe.profession, level: recipe.requiredCraftLevel });
    }
    if (state.jobs.some((job) => job.kind === 'craft' && job.professionId === recipe.profession)) {
      throw new CommandRejected('reject.crafterBusy', { profession: recipe.profession });
    }
    if (state.copper < recipe.feeCopper) throw new CommandRejected('reject.notEnoughMoney');

    const backpackAfterPayment = consumeIngredients(state.backpack, recipe);
    const craftingCostCopper = craftingCostCopperOf(recipe);
    const base = requireById(BASE_ITEMS, baseId);
    const itemNumber = state.itemsCrafted + 1;

    const upgradeLevel = rollUpgradeLevel(crafter.level - recipe.requiredCraftLevel, createRandom(state.seed).fork(`craft-${itemNumber}-upgrade`));
    const item = generateCraftedItem(
      {
        itemId: `item-${itemNumber}`,
        baseId: base.id,
        tier,
        setMaterialId,
        itemLevel: recipe.itemLevel,
        upgradeLevel,
        craftingCostCopper,
        ingredientCount: ingredientCountOf(recipe),
      },
      createRandom(state.seed).fork(`craft-${itemNumber}`),
    );
    // The item is made now, from the seed, and handed over when the job ends (see collectJobs).
    const jobNumber = state.jobsStarted + 1;
    return {
      ...state,
      copper: state.copper - recipe.feeCopper,
      backpack: backpackAfterPayment,
      itemsCrafted: itemNumber,
      jobsStarted: jobNumber,
      jobs: [
        ...state.jobs,
        {
          id: jobNumber,
          kind: 'craft',
          startedAtMs: nowMs,
          finishesAtMs: nowMs + craftSeconds(recipe) * 1000,
          professionId: recipe.profession,
          item,
          crafterExperience: craftingExperienceForCraft(recipe, crafter.level),
          isWaitingForCollection: false,
        },
      ],
    };
  };
}
