import { BASE_ITEMS } from '../../../src/content/baseItems';
import { LEVELS_PER_BRACKET } from '../../../src/content/balance/items';
import { requireById } from '../../../src/content/lookup';
import type { Random } from '../../../src/kernel/random';
import type { Hero } from '../../../src/model/hero';
import type { ItemSlot } from '../../../src/model/item';
import { listRecipes, type Recipe } from '../../../src/systems/crafting';
import { classIdsThatCanUse, equipItem, findEquipProblem } from '../../../src/systems/equipment';
import { generateCraftedItem } from '../../../src/systems/items';

// A hero wears one item for each of these. A ring fills two slots.
const SLOT_ORDER: readonly ItemSlot[] = ['mainHand', 'offHand', 'helm', 'armour', 'gloves', 'boots', 'belt', 'amulet', 'ring', 'ring'];

function recipeSlot(recipe: Recipe): ItemSlot {
  return requireById(BASE_ITEMS, recipe.baseId).slot;
}

// For each slot the hero takes the recipe with the highest item level that its class can use and its level can equip.
// The craft rolls quality and affixes as in the game. Set recipes are left out, so the result is the plain best gear.
export function equipBestGear(hero: Hero, random: Random): Hero {
  const tier = Math.ceil(hero.level / LEVELS_PER_BRACKET);
  const plainRecipes = listRecipes(tier).filter((recipe) => recipe.setMaterialId === null && recipe.itemLevel <= hero.level);
  return SLOT_ORDER.reduce((equippedHero, slot, index) => {
    const bestRecipe = plainRecipes
      .filter((recipe) => recipeSlot(recipe) === slot && classIdsThatCanUse(requireById(BASE_ITEMS, recipe.baseId)).includes(hero.classId))
      .reduce<Recipe | null>((best, recipe) => (best === null || recipe.itemLevel > best.itemLevel ? recipe : best), null);
    if (bestRecipe === null) return equippedHero;
    const item = generateCraftedItem(
      { itemId: `best-${hero.id}-${index}`, baseId: bestRecipe.baseId, tier, setMaterialId: null, itemLevel: bestRecipe.itemLevel, upgradeLevel: 0, craftingCostCopper: 10 },
      random.fork(`best-gear-${index}`),
    );
    if (findEquipProblem(equippedHero, item) !== null) throw new Error(`${bestRecipe.baseId} does not fit a level ${hero.level} ${hero.classId}`);
    return equipItem(equippedHero, item).hero;
  }, hero);
}
