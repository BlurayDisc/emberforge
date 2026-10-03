import { addMaterials } from '../../systems/inventory';
import { CommandRejected, type Command } from '../gameStore';
import { backpackRowsOf } from '../storage';

// The player empties the backpack, then comes back. Whatever fits is taken. The rest keeps waiting.
export function collectDungeonLootCommand(dungeonId: string): Command {
  return (state) => {
    const waiting = state.pendingLoot[dungeonId] ?? [];
    if (waiting.length === 0) throw new CommandRejected('reject.nothingToCollect');
    const added = addMaterials(state.backpack, waiting, backpackRowsOf(state));
    const waitingCount = waiting.reduce((total, stack) => total + stack.quantity, 0);
    const overflowCount = added.overflow.reduce((total, stack) => total + stack.quantity, 0);
    if (overflowCount === waitingCount) throw new CommandRejected('reject.backpackFullForLoot');
    const { [dungeonId]: _collected, ...otherDungeons } = state.pendingLoot;
    return { ...state, backpack: added.entries, pendingLoot: added.overflow.length > 0 ? { ...otherDungeons, [dungeonId]: added.overflow } : otherDungeons };
  };
}
