import { BACKPACK_BASE_ROWS, BACKPACK_COLUMNS, BACKPACK_ROWS_PER_EXPANSION } from '../../content/balance/backpack';
import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import { findFreeGridSpot } from '../../kernel/gridPacking';
import type { BackpackEntry } from '../../model/backpack';

type SavedEntry = BackpackEntry;

export function sizeOf(content: SavedEntry['content']): { width: number; height: number } {
  if (content.kind === 'item') return { width: content.item.width, height: content.item.height };
  return requireById(MATERIALS, content.materialId);
}

function splitStacks(entries: readonly SavedEntry[]): SavedEntry['content'][] {
  return entries.flatMap((entry): SavedEntry['content'][] => {
    const { content } = entry;
    if (content.kind === 'item') return [content];
    return Array.from({ length: content.quantity }, () => ({ ...content, quantity: 1 }));
  });
}

export function packAll(contents: readonly SavedEntry['content'][], rowCount: number): SavedEntry[] | null {
  const packed: SavedEntry[] = [];
  for (const content of contents) {
    const { width, height } = sizeOf(content);
    const spot = findFreeGridSpot(packed.map((entry) => ({ column: entry.column, row: entry.row, ...sizeOf(entry.content) })), width, height, BACKPACK_COLUMNS, rowCount);
    if (spot === null) return null;
    packed.push({ ...spot, content });
  }
  return packed;
}

// Version 8 stacked materials. Version 9 gives every unit its own place. The old stacks are split and the
// backpack is packed again, big pieces first. The backpack grows by whole expansions until all of it fits,
// so a save never loses an item or a material.
export function migrateUnstackedMaterials(save: Record<string, unknown>): Record<string, unknown> {
  const contents = splitStacks((save.backpack ?? []) as SavedEntry[]).sort((first, second) => sizeOf(second).width * sizeOf(second).height - sizeOf(first).width * sizeOf(first).height);
  for (let expansions = 0; ; expansions++) {
    const packed = packAll(contents, BACKPACK_BASE_ROWS + BACKPACK_ROWS_PER_EXPANSION * expansions);
    if (packed) return { ...save, backpack: packed, backpackExpansions: expansions, merchantExtraSlots: 0 };
  }
}
