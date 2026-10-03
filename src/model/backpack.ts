import type { Item } from './item';

export type BackpackContent =
  | { kind: 'material'; materialId: string; quantity: number }
  | { kind: 'item'; item: Item };

export interface BackpackEntry {
  column: number;
  row: number;
  content: BackpackContent;
}
