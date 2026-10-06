import { GUARANTEED_MATERIAL_DROPS } from '../../content/balance/dungeonRun';
import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import { MONSTERS, type DropEntry, type ItemDropEntry } from '../../content/monsters';
import type { Random } from '../../kernel/random';
import type { MaterialStack } from '../../model/material';

export interface LootRoll {
  materials: MaterialStack[];
  // Ready items. The game layer builds them, because a system never imports another system.
  items: Array<Omit<ItemDropEntry, 'chance'>>;
}

const NON_CRAFTING_CATEGORIES = ['essence', 'catalyst'];

function isCraftingMaterialDrop(drop: DropEntry): boolean {
  return !NON_CRAFTING_CATEGORIES.includes(requireById(MATERIALS, drop.materialId).category);
}

function rollQuantity(drop: DropEntry, random: Random): MaterialStack {
  const quantity = drop.maxQuantityChance === undefined ? random.nextInt(drop.minQuantity, drop.maxQuantity) : random.chance(drop.maxQuantityChance) ? drop.maxQuantity : drop.minQuantity;
  return { materialId: drop.materialId, quantity };
}

// A fight always gives crafting material: the guaranteed drops are picked by the drop chances
// as weights. Then every other drop rolls its own chance, so a lucky fight gives more.
// A drop that was guaranteed does not roll again, so no drop gives more than its maximum quantity.
export function rollMonsterLoot(monsterId: string, random: Random): LootRoll {
  const definition = requireById(MONSTERS, monsterId);
  const craftingDrops = definition.drops.filter(isCraftingMaterialDrop);
  const guaranteed: MaterialStack[] = [];
  const guaranteedDrops = new Set<DropEntry>();
  for (let pick = 0; pick < GUARANTEED_MATERIAL_DROPS && craftingDrops.length > 0; pick++) {
    const pickedDrop = random.pickWeighted(craftingDrops, (drop) => drop.chance);
    guaranteedDrops.add(pickedDrop);
    guaranteed.push(rollQuantity(pickedDrop, random));
  }
  const bonus = definition.drops
    .filter((drop) => !guaranteedDrops.has(drop) && random.chance(drop.chance))
    .map((drop) => rollQuantity(drop, random));
  const items = (definition.itemDrops ?? []).filter((drop) => random.chance(drop.chance)).map(({ chance: _chance, ...item }) => item);
  return { materials: [...guaranteed, ...bonus], items };
}
