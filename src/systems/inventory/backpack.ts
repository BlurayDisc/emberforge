import { findFreeGridSpot, isGridSpotFree } from '../../kernel/gridPacking';
import {
  BACKPACK_BASE_ROWS,
  BACKPACK_COLUMNS,
  BACKPACK_EXPANSION_BASE_COST_COPPER,
  BACKPACK_EXPANSION_COST_GROWTH,
  BACKPACK_MAXIMUM_EXPANSIONS,
  BACKPACK_ROWS_PER_EXPANSION,
} from '../../content/balance/backpack';
import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import type { BackpackEntry } from '../../model/backpack';
import type { Item } from '../../model/item';
import type { MaterialStack } from '../../model/material';

export interface GridPosition {
  column: number;
  row: number;
}

export interface AddMaterialsResult {
  entries: BackpackEntry[];
  overflow: MaterialStack[];
}

export function backpackRowCount(expansionsBought: number): number {
  return BACKPACK_BASE_ROWS + BACKPACK_ROWS_PER_EXPANSION * expansionsBought;
}

// Each purchase costs more than the one before: a fixed growth factor, so the price rises exponentially.
export function backpackExpansionCostCopper(expansionsBought: number): number | null {
  if (expansionsBought >= BACKPACK_MAXIMUM_EXPANSIONS) return null;
  return Math.round(BACKPACK_EXPANSION_BASE_COST_COPPER * BACKPACK_EXPANSION_COST_GROWTH ** expansionsBought);
}

export function sizeOfContent(content: BackpackEntry['content']): { width: number; height: number } {
  if (content.kind === 'item') return { width: content.item.width, height: content.item.height };
  const { width, height } = requireById(MATERIALS, content.materialId);
  return { width, height };
}

// Goods on sale are promised to the merchant: crafting and equipping cannot use them.
export function isOnSale(entry: BackpackEntry): boolean {
  return entry.saleJobId !== undefined;
}

export function usedCellCount(entries: readonly BackpackEntry[]): number {
  return entries.reduce((total, entry) => {
    const { width, height } = sizeOfContent(entry.content);
    return total + width * height;
  }, 0);
}

export function findFreePosition(entries: readonly BackpackEntry[], width: number, height: number, rowCount: number): GridPosition | null {
  const placed = entries.map((entry) => ({ column: entry.column, row: entry.row, ...sizeOfContent(entry.content) }));
  return findFreeGridSpot(placed, width, height, BACKPACK_COLUMNS, rowCount);
}

// The entry keeps its content. Its top-left corner goes to the new spot. It may overlap its own old place.
export function moveEntry(entries: readonly BackpackEntry[], from: GridPosition, to: GridPosition, rowCount: number): BackpackEntry[] | null {
  const moving = findEntryAt(entries, from);
  if (!moving) return null;
  const others = entries.filter((entry) => entry !== moving);
  const placed = others.map((entry) => ({ column: entry.column, row: entry.row, ...sizeOfContent(entry.content) }));
  if (!isGridSpotFree(placed, { column: to.column, row: to.row, ...sizeOfContent(moving.content) }, BACKPACK_COLUMNS, rowCount)) return null;
  return [...others, { ...moving, column: to.column, row: to.row }];
}

// A tap on a cell of the free area means "put the entry here". The top-left corner is tried first.
// Then the corner moves up and left, so a tap on the bottom cell of a tall entry still works.
export function findMoveAnchor(entries: readonly BackpackEntry[], from: GridPosition, tapped: GridPosition, rowCount: number): GridPosition | null {
  const moving = findEntryAt(entries, from);
  if (!moving) return null;
  const { width, height } = sizeOfContent(moving.content);
  for (let rowShift = 0; rowShift < height; rowShift++) {
    for (let columnShift = 0; columnShift < width; columnShift++) {
      const anchor = { column: tapped.column - columnShift, row: tapped.row - rowShift };
      if (anchor.column >= 0 && anchor.row >= 0 && moveEntry(entries, from, anchor, rowCount) !== null) return anchor;
    }
  }
  return null;
}

// Materials do not stack: every unit takes its own place in the backpack. A unit that finds no room is returned as overflow.
export function addMaterials(
  currentEntries: readonly BackpackEntry[],
  additions: readonly MaterialStack[],
  rowCount: number,
): AddMaterialsResult {
  const entries = currentEntries.map((entry) => structuredClone(entry));
  const overflow: MaterialStack[] = [];

  for (const addition of additions) {
    const { width, height } = requireById(MATERIALS, addition.materialId);
    let remaining = addition.quantity;
    while (remaining > 0) {
      const position = findFreePosition(entries, width, height, rowCount);
      if (position === null) break;
      entries.push({ ...position, content: { kind: 'material', materialId: addition.materialId, quantity: 1 } });
      remaining -= 1;
    }
    if (remaining > 0) overflow.push({ materialId: addition.materialId, quantity: remaining });
  }
  return { entries, overflow };
}

export function addItem(entries: readonly BackpackEntry[], item: Item, rowCount: number): BackpackEntry[] | null {
  const position = findFreePosition(entries, item.width, item.height, rowCount);
  if (position === null) return null;
  return [...entries, { ...position, content: { kind: 'item', item } }];
}

export function findItem(entries: readonly BackpackEntry[], itemId: string): Item | undefined {
  for (const entry of entries) {
    if (!isOnSale(entry) && entry.content.kind === 'item' && entry.content.item.id === itemId) return entry.content.item;
  }
  return undefined;
}

export function removeItem(entries: readonly BackpackEntry[], itemId: string): BackpackEntry[] {
  return entries.filter((entry) => isOnSale(entry) || !(entry.content.kind === 'item' && entry.content.item.id === itemId));
}

export function findEntryAt(entries: readonly BackpackEntry[], position: GridPosition): BackpackEntry | undefined {
  return entries.find((entry) => entry.column === position.column && entry.row === position.row);
}

export function removeEntryAt(entries: readonly BackpackEntry[], position: GridPosition): BackpackEntry[] {
  return entries.filter((entry) => !(entry.column === position.column && entry.row === position.row));
}

export function countMaterial(entries: readonly BackpackEntry[], materialId: string): number {
  return entries.reduce(
    (total, entry) =>
      !isOnSale(entry) && entry.content.kind === 'material' && entry.content.materialId === materialId ? total + entry.content.quantity : total,
    0,
  );
}

export function removeMaterials(
  currentEntries: readonly BackpackEntry[],
  materialId: string,
  quantity: number,
): BackpackEntry[] | null {
  if (countMaterial(currentEntries, materialId) < quantity) return null;
  let remaining = quantity;
  const entries: BackpackEntry[] = [];
  for (const entry of currentEntries) {
    const content = entry.content;
    if (isOnSale(entry) || content.kind !== 'material' || content.materialId !== materialId || remaining === 0) {
      entries.push(entry);
      continue;
    }
    const taken = Math.min(remaining, content.quantity);
    remaining -= taken;
    if (content.quantity > taken) {
      entries.push({ ...entry, content: { ...content, quantity: content.quantity - taken } });
    }
  }
  return entries;
}

export function combineMaterialQuantities(
  totals: readonly MaterialStack[],
  additions: readonly MaterialStack[],
): MaterialStack[] {
  const combined = totals.map((stack) => ({ ...stack }));
  for (const addition of additions) {
    const existing = combined.find((stack) => stack.materialId === addition.materialId);
    if (existing) existing.quantity += addition.quantity;
    else combined.push({ ...addition });
  }
  return combined;
}
