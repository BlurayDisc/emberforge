import { BACKPACK_EXPANSION_COSTS_COPPER } from '../../content/balance/backpack';
import { MERCHANT_EXTRA_SLOT_COSTS_COPPER } from '../../content/balance/economy';
import type { GameState } from '../../model/gameState';
import { CommandRejected, type Command } from '../gameStore';

export type StorageUpgradeKind = 'backpack' | 'merchantSlot';

interface UpgradeRule {
  costsCopper: readonly number[];
  countOf: (state: GameState) => number;
  withOneMore: (state: GameState) => GameState;
}

const UPGRADE_RULES: Record<StorageUpgradeKind, UpgradeRule> = {
  backpack: {
    costsCopper: BACKPACK_EXPANSION_COSTS_COPPER,
    countOf: (state) => state.backpackExpansions,
    withOneMore: (state) => ({ ...state, backpackExpansions: state.backpackExpansions + 1 }),
  },
  merchantSlot: {
    costsCopper: MERCHANT_EXTRA_SLOT_COSTS_COPPER,
    countOf: (state) => state.merchantExtraSlots,
    withOneMore: (state) => ({ ...state, merchantExtraSlots: state.merchantExtraSlots + 1 }),
  },
};

// The price of the next upgrade, or null when the player has bought them all.
export function nextStorageUpgradeCostCopper(state: GameState, kind: StorageUpgradeKind): number | null {
  const rule = UPGRADE_RULES[kind];
  return rule.costsCopper[rule.countOf(state)] ?? null;
}

export function buyStorageUpgradeCommand(kind: StorageUpgradeKind): Command {
  return (state) => {
    const cost = nextStorageUpgradeCostCopper(state, kind);
    if (cost === null) throw new CommandRejected('reject.upgradeSoldOut');
    if (state.copper < cost) throw new CommandRejected('reject.notEnoughMoney');
    return { ...UPGRADE_RULES[kind].withOneMore(state), copper: state.copper - cost };
  };
}
