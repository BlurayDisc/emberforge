import type { BackpackContent } from './backpack';
import type { Item } from './item';

// Selling and crafting both take time. A job holds the work until finishesAtMs.
interface JobBase {
  id: number;
  startedAtMs: number;
  finishesAtMs: number;
}

export interface SaleJob extends JobBase {
  kind: 'sell';
  content: BackpackContent;
  copper: number;
}

export interface CraftJob extends JobBase {
  kind: 'craft';
  professionId: string;
  item: Item;
  crafterExperience: number;
}

export type TimedJob = SaleJob | CraftJob;
