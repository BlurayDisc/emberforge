import { BASE_ITEMS } from '../../../src/content/baseItems';
import { LEVELS_PER_BRACKET } from '../../../src/content/balance/items';
import { requireById } from '../../../src/content/lookup';
import type { Random } from '../../../src/kernel/random';
import type { Hero } from '../../../src/model/hero';
import type { ItemSlot } from '../../../src/model/item';
import { listRecipes, type Recipe } from '../../../src/systems/crafting';
import { classIdsThatCanUse, equipItem, findEquipProblem } from '../../../src/systems/equipment';
import { generateCraftedItem } from '../../../src/systems/items';
import type { Item } from '../../../src/model/item';

// Floor gear: every slot is Common, except the first slots in SLOT_ORDER, which hold an item with at least one prefix.
export interface GearFloorProfile {
  prefixedItemsPerHero: number;
}

// A hero wears one item for each of these. A ring fills two slots.
const SLOT_ORDER: readonly ItemSlot[] = ['mainHand', 'offHand', 'helm', 'armour', 'gloves', 'legs', 'boots', 'belt', 'amulet', 'ring', 'ring'];

function recipeSlot(recipe: Recipe): ItemSlot {
  return requireById(BASE_ITEMS, recipe.baseId).slot;
}

// For each slot the hero takes the recipe with the highest item level that its class can use and its level can equip.
// The craft rolls quality and affixes as in the game. Set recipes are left out, so the result is the plain best gear.
// A floor profile re-rolls the craft with a new fork until the item has the wanted quality, so the result stays deterministic.
export interface GearRule {
  slots: readonly ItemSlot[];
  quality: 'common' | 'uncommon' | 'magic' | 'rare' | null;
}

export function equipBestGear(hero: Hero, random: Random, floorProfile: GearFloorProfile | null = null, gearRule: GearRule | null = null): Hero {
  const tier = Math.ceil(hero.level / LEVELS_PER_BRACKET);
  const plainRecipes = listRecipes(tier).filter((recipe) => recipe.setMaterialId === null && recipe.itemLevel <= hero.level);
  const slotOrder = gearRule === null ? SLOT_ORDER : SLOT_ORDER.filter((slot) => gearRule.slots.includes(slot));
  return slotOrder.reduce((equippedHero, slot, index) => {
    const bestRecipe = plainRecipes
      .filter((recipe) => recipeSlot(recipe) === slot && classIdsThatCanUse(requireById(BASE_ITEMS, recipe.baseId)).includes(hero.classId))
      .reduce<Recipe | null>((best, recipe) => (best === null || recipe.itemLevel > best.itemLevel ? recipe : best), null);
    if (bestRecipe === null) return equippedHero;
    const craft = (attempt: number): Item =>
      generateCraftedItem(
        { itemId: `best-${hero.id}-${index}`, baseId: bestRecipe.baseId, tier, setMaterialId: null, itemLevel: bestRecipe.itemLevel, upgradeLevel: 0, craftingCostCopper: 10, ingredientCount: 1, ...(gearRule?.quality ? { quality: gearRule.quality } : {}) },
        random.fork(attempt === 0 ? `best-gear-${index}` : `best-gear-${index}-attempt-${attempt}`),
      );
    const item = floorProfile === null ? craft(0) : craftMatchingFloor(craft, index < floorProfile.prefixedItemsPerHero);
    if (findEquipProblem(equippedHero, item) !== null) throw new Error(`${bestRecipe.baseId} does not fit a level ${hero.level} ${hero.classId}`);
    return equipItem(equippedHero, item).hero;
  }, hero);
}

function craftMatchingFloor(craft: (attempt: number) => Item, mustHavePrefix: boolean): Item {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const item = craft(attempt);
    const matches = mustHavePrefix ? item.affixes.some((affix) => affix.kind === 'prefix') : item.quality === 'common';
    if (matches) return item;
  }
  throw new Error('No craft matched the gear floor profile');
}
