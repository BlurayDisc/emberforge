import type { GameState } from '../../model/gameState';
import type { BackpackEntry } from '../../model/backpack';
import { findMoveAnchor, sizeOfContent, usedCellCount, type GridPosition } from '../../systems/inventory';
import { BACKPACK_COLUMNS, BACKPACK_URGENT_FILL_FRACTION, BACKPACK_WARNING_FILL_FRACTION } from '../../content/balance/backpack';
import { nextStorageUpgradeCostCopper } from '../commands/buyStorageUpgrade';
import { millSettingsOf } from '../millSettings';
import { MILL_PRODUCTION_INTERVAL_SECONDS_BY_SPEED_UPGRADE } from '../../content/balance/mill';
import { backpackRowsOf, merchantSaleSlotsOf } from '../storage';

export interface StorageView {
  usedCells: number;
  totalCells: number;
  backpackUpgradeCostCopper: number | null;
  merchantSaleSlots: number;
  merchantSlotCostCopper: number | null;
  millStorageCapacity: number;
  millCapacityCostCopper: number | null;
  millProductionIntervalSeconds: number;
  millSpeedCostCopper: number | null;
  millNextProductionIntervalSeconds: number | null;
}

export function sizeOfBackpackEntry(entry: BackpackEntry): { width: number; height: number } {
  return sizeOfContent(entry.content);
}

export function describeStorage(state: GameState): StorageView {
  const mill = millSettingsOf(state);
  return {
    usedCells: usedCellCount(state.backpack),
    totalCells: BACKPACK_COLUMNS * backpackRowsOf(state),
    backpackUpgradeCostCopper: nextStorageUpgradeCostCopper(state, 'backpack'),
    merchantSaleSlots: merchantSaleSlotsOf(state),
    merchantSlotCostCopper: nextStorageUpgradeCostCopper(state, 'merchantSlot'),
    millStorageCapacity: mill.storageCapacity,
    millCapacityCostCopper: nextStorageUpgradeCostCopper(state, 'millCapacity'),
    millProductionIntervalSeconds: mill.productionIntervalSeconds,
    millSpeedCostCopper: nextStorageUpgradeCostCopper(state, 'millSpeed'),
    millNextProductionIntervalSeconds: MILL_PRODUCTION_INTERVAL_SECONDS_BY_SPEED_UPGRADE[state.millSpeedUpgrades + 1] ?? null,
  };
}

// Where the entry's top-left corner goes when the player taps an empty cell. Null when the entry fits nowhere around that cell.
export function findBackpackMoveAnchor(state: GameState, from: GridPosition, tapped: GridPosition): GridPosition | null {
  return findMoveAnchor(state.backpack, from, tapped, backpackRowsOf(state));
}

export type BackpackPressure = 'none' | 'warning' | 'urgent';

// Urgent also covers dungeon drops that found no room and wait (pendingLoot).
export function backpackPressureOf(state: GameState): BackpackPressure {
  const { usedCells, totalCells } = describeStorage(state);
  const hasItemsWaitingForSpace = Object.values(state.pendingLoot).some((stacks) => stacks.length > 0);
  const fillFraction = usedCells / totalCells;
  if (hasItemsWaitingForSpace || fillFraction >= BACKPACK_URGENT_FILL_FRACTION) return 'urgent';
  return fillFraction >= BACKPACK_WARNING_FILL_FRACTION ? 'warning' : 'none';
}
