import { MERCHANT_BASE_SALE_SLOTS } from '../content/balance/economy';
import type { GameState } from '../model/gameState';
import { backpackRowCount } from '../systems/inventory';

export function backpackRowsOf(state: GameState): number {
  return backpackRowCount(state.backpackExpansions);
}

export function merchantSaleSlotsOf(state: GameState): number {
  return MERCHANT_BASE_SALE_SLOTS + state.merchantExtraSlots;
}
