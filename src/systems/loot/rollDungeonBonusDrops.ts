import type { DungeonDefinition } from '../../content/dungeons';
import type { Random } from '../../kernel/random';
import type { MaterialStack } from '../../model/material';

// The drops of the dungeon itself, on top of the monster drops: each entry rolls its chance once for each won fight.
export function rollDungeonBonusDrops(dungeon: DungeonDefinition, random: Random): MaterialStack[] {
  const dropped: MaterialStack[] = [];
  for (const bonusDrop of dungeon.bonusDrops) {
    if (!random.chance(bonusDrop.chance)) continue;
    dropped.push({ materialId: random.pick(bonusDrop.materialIds), quantity: bonusDrop.quantity });
  }
  return dropped;
}
