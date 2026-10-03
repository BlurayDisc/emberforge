import {
  COPPER_DROP_BASE,
  COPPER_DROP_PER_LEVEL,
  COPPER_DROP_RANK_MULTIPLIER,
  COPPER_DROP_SPREAD_FRACTION,
} from '../../content/balance/economy';
import { requireById } from '../../content/lookup';
import { MONSTERS } from '../../content/monsters';
import type { Random } from '../../kernel/random';
import type { MaterialStack } from '../../model/material';

export interface LootRoll {
  copper: number;
  materials: MaterialStack[];
}

export function rollMonsterLoot(monsterId: string, monsterLevel: number, random: Random): LootRoll {
  const definition = requireById(MONSTERS, monsterId);
  const averageCopper =
    (COPPER_DROP_BASE + COPPER_DROP_PER_LEVEL * monsterLevel) * COPPER_DROP_RANK_MULTIPLIER[definition.rank];
  const spread = 1 + (random.nextFloat() * 2 - 1) * COPPER_DROP_SPREAD_FRACTION;
  const materials = definition.drops
    .filter((drop) => random.chance(drop.chance))
    .map((drop) => ({
      materialId: drop.materialId,
      quantity: random.nextInt(drop.minQuantity, drop.maxQuantity),
    }));
  return { copper: Math.max(1, Math.round(averageCopper * spread)), materials };
}
