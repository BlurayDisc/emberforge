import type { Item } from './item';

// Selling and crafting both take time. A job holds the work until finishesAtMs.
interface JobBase {
  id: number;
  startedAtMs: number;
  finishesAtMs: number;
}

export interface SaleJob extends JobBase {
  kind: 'sell';
  copper: number;
}

export interface CraftJob extends JobBase {
  kind: 'craft';
  professionId: string;
  item: Item;
  crafterExperience: number;
  // A finished craft waits at the crafter until the player clicks the crafter and collects it.
  isWaitingForCollection: boolean;
}

export type TimedJob = SaleJob | CraftJob;
