import type { GameState } from '../../model/gameState';
import type { MaterialStack } from '../../model/material';
import { isMillFull, nextMillProductionAtMs, storedMillMaterialCount } from '../../systems/mill';
import { millSettingsOf } from '../millSettings';

export interface MillView {
  storedMaterials: MaterialStack[];
  storedCount: number;
  capacity: number;
  isFull: boolean;
  nextProductionAtMs: number | null;
}

export function describeMill(state: GameState): MillView {
  const settings = millSettingsOf(state);
  return {
    storedMaterials: state.mill.storedMaterials,
    storedCount: storedMillMaterialCount(state.mill),
    capacity: settings.storageCapacity,
    isFull: isMillFull(state.mill, settings),
    nextProductionAtMs: nextMillProductionAtMs(state.mill, settings),
  };
}
