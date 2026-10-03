import {
  COPPER_DROP_BASE,
  COPPER_DROP_PER_LEVEL,
  COPPER_DROP_RANK_MULTIPLIER,
  COPPER_DROP_SPREAD_FRACTION,
} from '../../content/balance/economy';
import { GUARANTEED_MATERIAL_DROPS } from '../../content/balance/dungeonRun';
import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import { MONSTERS, type DropEntry } from '../../content/monsters';
import type { Random } from '../../kernel/random';
import type { MaterialStack } from '../../model/material';

export interface LootRoll {
  copper: number;
  materials: MaterialStack[];
}

const NON_CRAFTING_CATEGORIES = ['essence', 'catalyst'];

function isCraftingMaterialDrop(drop: DropEntry): boolean {
  return !NON_CRAFTING_CATEGORIES.includes(requireById(MATERIALS, drop.materialId).category);
}

function rollQuantity(drop: DropEntry, random: Random): MaterialStack {
  return { materialId: drop.materialId, quantity: random.nextInt(drop.minQuantity, drop.maxQuantity) };
}

// A fight always gives crafting material: the guaranteed drops are picked by the drop chances
// as weights. Then every drop rolls its own chance, so a lucky fight gives more.
export function rollMonsterLoot(monsterId: string, monsterLevel: number, random: Random): LootRoll {
  const definition = requireById(MONSTERS, monsterId);
  const averageCopper =
    (COPPER_DROP_BASE + COPPER_DROP_PER_LEVEL * monsterLevel) * COPPER_DROP_RANK_MULTIPLIER[definition.rank];
  const spread = 1 + (random.nextFloat() * 2 - 1) * COPPER_DROP_SPREAD_FRACTION;

  const craftingDrops = definition.drops.filter(isCraftingMaterialDrop);
  const guaranteed: MaterialStack[] = [];
  for (let pick = 0; pick < GUARANTEED_MATERIAL_DROPS && craftingDrops.length > 0; pick++) {
    guaranteed.push(rollQuantity(random.pickWeighted(craftingDrops, (drop) => drop.chance), random));
  }
  const bonus = definition.drops.filter((drop) => random.chance(drop.chance)).map((drop) => rollQuantity(drop, random));
  return { copper: Math.max(1, Math.round(averageCopper * spread)), materials: [...guaranteed, ...bonus] };
}
