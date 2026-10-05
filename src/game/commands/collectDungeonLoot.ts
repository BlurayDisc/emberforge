import type { Item } from '../../model/item';
import { addItem, addMaterials } from '../../systems/inventory';
import { CommandRejected, type Command } from '../gameStore';
import { backpackRowsOf } from '../storage';

// The player empties the backpack, then comes back. Whatever fits is taken. The rest keeps waiting.
export function collectDungeonLootCommand(dungeonId: string): Command {
  return (state) => {
    const waiting = state.pendingLoot[dungeonId] ?? [];
    const waitingItems = state.pendingItems[dungeonId] ?? [];
    if (waiting.length === 0 && waitingItems.length === 0) throw new CommandRejected('reject.nothingToCollect');
    const addedMaterials = addMaterials(state.backpack, waiting, backpackRowsOf(state));
    let backpackEntries = addedMaterials.entries;
    const itemsStillWaiting: Item[] = [];
    for (const item of waitingItems) {
      const withItem = addItem(backpackEntries, item, backpackRowsOf(state));
      if (withItem === null) itemsStillWaiting.push(item);
      else backpackEntries = withItem;
    }
    const waitingCount = waiting.reduce((total, stack) => total + stack.quantity, 0) + waitingItems.length;
    const overflowCount = addedMaterials.overflow.reduce((total, stack) => total + stack.quantity, 0) + itemsStillWaiting.length;
    if (overflowCount === waitingCount) throw new CommandRejected('reject.backpackFullForLoot');
    const { [dungeonId]: _collectedMaterials, ...otherDungeons } = state.pendingLoot;
    const { [dungeonId]: _collectedItems, ...otherDungeonItems } = state.pendingItems;
    return {
      ...state,
      backpack: backpackEntries,
      pendingLoot: addedMaterials.overflow.length > 0 ? { ...otherDungeons, [dungeonId]: addedMaterials.overflow } : otherDungeons,
      pendingItems: itemsStillWaiting.length > 0 ? { ...otherDungeonItems, [dungeonId]: itemsStillWaiting } : otherDungeonItems,
    };
  };
}
