import type { MaterialStack } from './material';

export interface MillState {
  // Null while the Mill is full or has not started. The next clock check starts it.
  productionClockStartedAtMs: number | null;
  productionsMade: number;
  storedMaterials: MaterialStack[];
}
