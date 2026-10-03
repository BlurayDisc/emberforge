import { sortBackpackEntries } from '../../systems/inventory';
import { CommandRejected, type Command } from '../gameStore';
import { backpackRowsOf } from '../storage';
import { hasBankUnlock } from './buyBankUnlock';

export function sortBackpackCommand(): Command {
  return (state) => {
    if (!hasBankUnlock(state, 'backpackSorting')) throw new CommandRejected('reject.featureLocked');
    const sorted = sortBackpackEntries(state.backpack, backpackRowsOf(state));
    if (sorted === null) throw new CommandRejected('reject.sortDidNotFit');
    return { ...state, backpack: sorted };
  };
}
