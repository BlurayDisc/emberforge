import { BACKPACK_BASE_ROWS, BACKPACK_COLUMNS, BACKPACK_ROWS_PER_EXPANSION } from '../../../content/balance/backpack';
import { MATERIALS } from '../../../content/materials';
import type { BackpackContent, BackpackEntry } from '../../../model/backpack';
import type { MaterialStack } from '../../../model/material';
import { readEach, readRecord, readWholeNumber, type SalvageTally } from './lenientReaders';
import { salvageItem } from './salvageItem';

export function salvageMaterialStack(value: unknown): MaterialStack | null {
  const record = readRecord(value);
  const material = MATERIALS.find((candidate) => candidate.id === record?.materialId);
  const quantity = readWholeNumber(record?.quantity, 1, Number.MAX_SAFE_INTEGER, 0);
  return material && quantity > 0 ? { materialId: material.id, quantity } : null;
}

export function salvageBackpackContent(value: unknown, tally: SalvageTally): BackpackContent | null {
  const record = readRecord(value);
  if (record?.kind === 'item') {
    const item = salvageItem(record.item, tally);
    return item ? { kind: 'item', item } : null;
  }
  const stack = record?.kind === 'material' ? salvageMaterialStack(record) : null;
  return stack ? { kind: 'material', ...stack } : null;
}

function sizeOf(content: BackpackContent): { width: number; height: number } {
  if (content.kind === 'item') return { width: content.item.width, height: content.item.height };
  const material = MATERIALS.find((candidate) => candidate.id === content.materialId);
  return { width: material?.width ?? 1, height: material?.height ?? 1 };
}

// An entry that sits outside the grid, or on top of an entry that was kept before it, is dropped.
export function salvageBackpack(value: unknown, expansionsBought: number, tally: SalvageTally): BackpackEntry[] {
  const rowCount = BACKPACK_BASE_ROWS + BACKPACK_ROWS_PER_EXPANSION * expansionsBought;
  const occupiedCells = new Set<string>();
  return readEach(value, (entry) => {
    const record = readRecord(entry);
    const content = salvageBackpackContent(record?.content, tally);
    const column = readWholeNumber(record?.column, 0, BACKPACK_COLUMNS - 1, -1);
    const row = readWholeNumber(record?.row, 0, rowCount - 1, -1);
    if (!content || column < 0 || row < 0) return null;
    const { width, height } = sizeOf(content);
    const cells = Array.from({ length: width * height }, (_, index) => `${column + (index % width)},${row + Math.floor(index / width)}`);
    if (column + width > BACKPACK_COLUMNS || row + height > rowCount || cells.some((cell) => occupiedCells.has(cell))) return null;
    cells.forEach((cell) => occupiedCells.add(cell));
    return { column, row, content };
  }, tally);
}
