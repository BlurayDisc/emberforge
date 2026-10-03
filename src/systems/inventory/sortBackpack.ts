import type { BackpackEntry } from '../../model/backpack';
import type { Item, ItemQuality, ItemSlot } from '../../model/item';
import { findFreePosition, sizeOfContent } from './backpack';

const SLOT_ORDER: readonly ItemSlot[] = ['mainHand', 'offHand', 'helm', 'armour', 'gloves', 'boots', 'belt', 'amulet', 'ring'];
const QUALITY_ORDER: readonly ItemQuality[] = ['unique', 'rare', 'magic', 'common'];

function compareItems(first: Item, second: Item): number {
  return SLOT_ORDER.indexOf(first.slot) - SLOT_ORDER.indexOf(second.slot)
    || QUALITY_ORDER.indexOf(first.quality) - QUALITY_ORDER.indexOf(second.quality)
    || second.itemLevel - first.itemLevel
    || first.baseId.localeCompare(second.baseId)
    || first.id.localeCompare(second.id);
}

// Items come first, then materials grouped by tier, category and id.
function compareEntries(first: BackpackEntry, second: BackpackEntry): number {
  const firstContent = first.content;
  const secondContent = second.content;
  if (firstContent.kind === 'item' && secondContent.kind === 'item') return compareItems(firstContent.item, secondContent.item);
  if (firstContent.kind === 'item') return -1;
  if (secondContent.kind === 'item') return 1;
  return firstContent.materialId.localeCompare(secondContent.materialId);
}

function packFirstFit(orderedEntries: readonly BackpackEntry[], rowCount: number): BackpackEntry[] | null {
  const packed: BackpackEntry[] = [];
  for (const entry of orderedEntries) {
    const { width, height } = sizeOfContent(entry.content);
    const position = findFreePosition(packed, width, height, rowCount);
    if (position === null) return null;
    packed.push({ ...entry, ...position });
  }
  return packed;
}

const cellsOf = (entry: BackpackEntry): number => {
  const { width, height } = sizeOfContent(entry.content);
  return width * height;
};

// Tries the readable order first. When that order wastes too much room, it tries big entries first.
// Returns null when neither order fits, so the backpack stays as it is.
export function sortBackpackEntries(entries: readonly BackpackEntry[], rowCount: number): BackpackEntry[] | null {
  const readableOrder = [...entries].sort(compareEntries);
  const bigFirstOrder = [...readableOrder].sort((first, second) => cellsOf(second) - cellsOf(first));
  return packFirstFit(readableOrder, rowCount) ?? packFirstFit(bigFirstOrder, rowCount);
}
