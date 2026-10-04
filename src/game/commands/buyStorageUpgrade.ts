import { MERCHANT_EXTRA_SLOT_COSTS_COPPER } from '../../content/balance/economy';
import { MILL_SPEED_UPGRADE_COSTS_COPPER, MILL_STORAGE_CAPACITY_UPGRADE_COSTS_COPPER } from '../../content/balance/mill';
import type { GameState } from '../../model/gameState';
import { backpackExpansionCostCopper } from '../../systems/inventory';
import { CommandRejected, type Command } from '../gameStore';

export type StorageUpgradeKind = 'backpack' | 'merchantSlot' | 'millCapacity' | 'millSpeed';

interface UpgradeRule {
  nextCostCopper: (state: GameState) => number | null;
  withOneMore: (state: GameState) => GameState;
}

const UPGRADE_RULES: Record<StorageUpgradeKind, UpgradeRule> = {
  backpack: {
    nextCostCopper: (state) => backpackExpansionCostCopper(state.backpackExpansions),
    withOneMore: (state) => ({ ...state, backpackExpansions: state.backpackExpansions + 1 }),
  },
  merchantSlot: {
    nextCostCopper: (state) => MERCHANT_EXTRA_SLOT_COSTS_COPPER[state.merchantExtraSlots] ?? null,
    withOneMore: (state) => ({ ...state, merchantExtraSlots: state.merchantExtraSlots + 1 }),
  },
  millCapacity: {
    nextCostCopper: (state) => MILL_STORAGE_CAPACITY_UPGRADE_COSTS_COPPER[state.millCapacityUpgrades] ?? null,
    withOneMore: (state) => ({ ...state, millCapacityUpgrades: state.millCapacityUpgrades + 1 }),
  },
  millSpeed: {
    nextCostCopper: (state) => MILL_SPEED_UPGRADE_COSTS_COPPER[state.millSpeedUpgrades] ?? null,
    withOneMore: (state) => ({ ...state, millSpeedUpgrades: state.millSpeedUpgrades + 1 }),
  },
};

// The price of the next upgrade, or null when the player has bought them all.
export function nextStorageUpgradeCostCopper(state: GameState, kind: StorageUpgradeKind): number | null {
  return UPGRADE_RULES[kind].nextCostCopper(state);
}

export function buyStorageUpgradeCommand(kind: StorageUpgradeKind): Command {
  return (state) => {
    const cost = nextStorageUpgradeCostCopper(state, kind);
    if (cost === null) throw new CommandRejected('reject.upgradeSoldOut');
    if (state.copper < cost) throw new CommandRejected('reject.notEnoughMoney');
    return { ...UPGRADE_RULES[kind].withOneMore(state), copper: state.copper - cost };
  };
}
