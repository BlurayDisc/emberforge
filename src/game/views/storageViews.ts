import type { GameState } from '../../model/gameState';
import type { BackpackEntry } from '../../model/backpack';
import { addItem, addMaterials, findMoveAnchor, sizeOfContent, usedCellCount, type GridPosition } from '../../systems/inventory';
import { BACKPACK_COLUMNS, BACKPACK_FULL_FILL_FRACTION } from '../../content/balance/backpack';
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

// Dungeon drops that found no room wait at the dungeon. They count only while they still do not fit,
// so the warning ends as soon as the player makes room, without a trip to the dungeon.
function hasWaitingLootThatDoesNotFit(state: GameState): boolean {
  const rows = backpackRowsOf(state);
  const materialsDoNotFit = Object.values(state.pendingLoot).some((stacks) => stacks.length > 0 && addMaterials(state.backpack, stacks, rows).overflow.length > 0);
  const itemsDoNotFit = Object.values(state.pendingItems).some((items) => items.some((item) => addItem(state.backpack, item, rows) === null));
  return materialsDoNotFit || itemsDoNotFit;
}

// One level only: the Inventory button turns red when the backpack is nearly full, or loot cannot fit.
export function isBackpackFull(state: GameState): boolean {
  const { usedCells, totalCells } = describeStorage(state);
  return usedCells / totalCells >= BACKPACK_FULL_FILL_FRACTION || hasWaitingLootThatDoesNotFit(state);
}
