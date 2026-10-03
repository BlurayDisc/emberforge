import { MILL_STORAGE_CAPACITY } from '../../content/balance/mill';
import type { GameState } from '../../model/gameState';
import type { MaterialStack } from '../../model/material';
import { isMillFull, nextMillProductionAtMs, storedMillMaterialCount } from '../../systems/mill';

export interface MillView {
  storedMaterials: MaterialStack[];
  storedCount: number;
  capacity: number;
  isFull: boolean;
  nextProductionAtMs: number | null;
}

export function describeMill(state: GameState): MillView {
  return {
    storedMaterials: state.mill.storedMaterials,
    storedCount: storedMillMaterialCount(state.mill),
    capacity: MILL_STORAGE_CAPACITY,
    isFull: isMillFull(state.mill),
    nextProductionAtMs: nextMillProductionAtMs(state.mill),
  };
}
