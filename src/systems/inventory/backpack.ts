import { BACKPACK_COLUMNS, BACKPACK_ROWS, MATERIAL_STACK_LIMIT } from '../../content/balance/backpack';
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

function sizeOf(entry: BackpackEntry): { width: number; height: number } {
  if (entry.content.kind === 'item') return { width: entry.content.item.width, height: entry.content.item.height };
  return { width: 1, height: 1 };
}

function occupiedCellKeys(entries: readonly BackpackEntry[]): Set<string> {
  const keys = new Set<string>();
  for (const entry of entries) {
    const { width, height } = sizeOf(entry);
    for (let column = entry.column; column < entry.column + width; column++) {
      for (let row = entry.row; row < entry.row + height; row++) keys.add(`${column},${row}`);
    }
  }
  return keys;
}

export function findFreePosition(entries: readonly BackpackEntry[], width: number, height: number): GridPosition | null {
  const occupied = occupiedCellKeys(entries);
  for (let row = 0; row + height <= BACKPACK_ROWS; row++) {
    for (let column = 0; column + width <= BACKPACK_COLUMNS; column++) {
      const isFree = Array.from({ length: width * height }).every(
        (_, offset) => !occupied.has(`${column + (offset % width)},${row + Math.floor(offset / width)}`),
      );
      if (isFree) return { column, row };
    }
  }
  return null;
}

export function addMaterials(
  currentEntries: readonly BackpackEntry[],
  additions: readonly MaterialStack[],
): AddMaterialsResult {
  const entries = currentEntries.map((entry) => structuredClone(entry));
  const overflow: MaterialStack[] = [];

  for (const addition of additions) {
    let remaining = addition.quantity;
    for (const entry of entries) {
      const content = entry.content;
      if (remaining === 0) break;
      if (content.kind !== 'material' || content.materialId !== addition.materialId) continue;
      const moved = Math.min(remaining, MATERIAL_STACK_LIMIT - content.quantity);
      content.quantity += moved;
      remaining -= moved;
    }
    while (remaining > 0) {
      const position = findFreePosition(entries, 1, 1);
      if (position === null) break;
      const moved = Math.min(remaining, MATERIAL_STACK_LIMIT);
      entries.push({ ...position, content: { kind: 'material', materialId: addition.materialId, quantity: moved } });
      remaining -= moved;
    }
    if (remaining > 0) overflow.push({ materialId: addition.materialId, quantity: remaining });
  }
  return { entries, overflow };
}

export function addItem(entries: readonly BackpackEntry[], item: Item): BackpackEntry[] | null {
  const position = findFreePosition(entries, item.width, item.height);
  if (position === null) return null;
  return [...entries, { ...position, content: { kind: 'item', item } }];
}

export function findItem(entries: readonly BackpackEntry[], itemId: string): Item | undefined {
  for (const entry of entries) {
    if (entry.content.kind === 'item' && entry.content.item.id === itemId) return entry.content.item;
  }
  return undefined;
}

export function removeItem(entries: readonly BackpackEntry[], itemId: string): BackpackEntry[] {
  return entries.filter((entry) => !(entry.content.kind === 'item' && entry.content.item.id === itemId));
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
      entry.content.kind === 'material' && entry.content.materialId === materialId ? total + entry.content.quantity : total,
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
    if (content.kind !== 'material' || content.materialId !== materialId || remaining === 0) {
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
