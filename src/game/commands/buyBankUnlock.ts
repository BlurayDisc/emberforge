import { BANK_UNLOCK_COSTS_COPPER } from '../../content/balance/economy';
import type { BankUnlockId } from '../../model/bankUnlock';
import type { GameState } from '../../model/gameState';
import { CommandRejected, type Command } from '../gameStore';

export function hasBankUnlock(state: GameState, unlockId: BankUnlockId): boolean {
  return state.bankUnlockIds.includes(unlockId);
}

export function buyBankUnlockCommand(unlockId: BankUnlockId): Command {
  return (state) => {
    if (hasBankUnlock(state, unlockId)) throw new CommandRejected('reject.alreadyUnlocked');
    const cost = BANK_UNLOCK_COSTS_COPPER[unlockId];
    if (state.copper < cost) throw new CommandRejected('reject.notEnoughMoney');
    return { ...state, copper: state.copper - cost, bankUnlockIds: [...state.bankUnlockIds, unlockId] };
  };
}
