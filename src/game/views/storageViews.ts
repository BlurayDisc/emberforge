import type { GameState } from '../../model/gameState';
import type { BackpackEntry } from '../../model/backpack';
import { sizeOfContent, usedCellCount } from '../../systems/inventory';
import { BACKPACK_COLUMNS } from '../../content/balance/backpack';
import { nextStorageUpgradeCostCopper } from '../commands/buyStorageUpgrade';
import { backpackRowsOf, merchantSaleSlotsOf } from '../storage';

export interface StorageView {
  usedCells: number;
  totalCells: number;
  backpackUpgradeCostCopper: number | null;
  merchantSaleSlots: number;
  merchantSlotCostCopper: number | null;
}

export function sizeOfBackpackEntry(entry: BackpackEntry): { width: number; height: number } {
  return sizeOfContent(entry.content);
}

export function describeStorage(state: GameState): StorageView {
  return {
    usedCells: usedCellCount(state.backpack),
    totalCells: BACKPACK_COLUMNS * backpackRowsOf(state),
    backpackUpgradeCostCopper: nextStorageUpgradeCostCopper(state, 'backpack'),
    merchantSaleSlots: merchantSaleSlotsOf(state),
    merchantSlotCostCopper: nextStorageUpgradeCostCopper(state, 'merchantSlot'),
  };
}
