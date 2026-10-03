import { BACKPACK_BASE_ROWS, BACKPACK_ROWS_PER_EXPANSION } from '../../content/balance/backpack';
import type { BackpackEntry } from '../../model/backpack';
import { packAll, sizeOf } from './migrateUnstackedMaterials';

// Version 13: the backpack is a narrow grid that grows one row for each Bank purchase. Old positions were
// made for a wider grid, so everything is packed again, big pieces first. The backpack grows by whole
// expansions until all of it fits, so a save never loses an item or a material.
export function migrateBackpackGrid(save: Record<string, unknown>): Record<string, unknown> {
  const area = (content: BackpackEntry['content']): number => sizeOf(content).width * sizeOf(content).height;
  const contents = ((save.backpack ?? []) as BackpackEntry[]).map((entry) => entry.content).sort((first, second) => area(second) - area(first));
  for (let expansions = 0; ; expansions++) {
    const packed = packAll(contents, BACKPACK_BASE_ROWS + BACKPACK_ROWS_PER_EXPANSION * expansions);
    if (packed) return { ...save, backpack: packed, backpackExpansions: expansions };
  }
}
