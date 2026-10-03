import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import type { BackpackEntry } from '../../model/backpack';
import { findEntryAt, removeEntryAt, type GridPosition } from '../../systems/inventory';
import { CommandRejected, type Command } from '../gameStore';

function valueOf(entry: BackpackEntry): number {
  if (entry.content.kind === 'item') return entry.content.item.sellValueCopper;
  return requireById(MATERIALS, entry.content.materialId).sellValueCopper * entry.content.quantity;
}

export function sellBackpackEntryCommand(position: GridPosition): Command {
  return (state) => {
    const entry = findEntryAt(state.backpack, position);
    if (!entry) throw new CommandRejected('There is nothing to sell there.');
    return { ...state, copper: state.copper + valueOf(entry), backpack: removeEntryAt(state.backpack, position) };
  };
}

export function sellAllMaterialsCommand(): Command {
  return (state) => {
    const materialEntries = state.backpack.filter((entry) => entry.content.kind === 'material');
    if (materialEntries.length === 0) throw new CommandRejected('You have no materials to sell.');
    const total = materialEntries.reduce((sum, entry) => sum + valueOf(entry), 0);
    return { ...state, copper: state.copper + total, backpack: state.backpack.filter((entry) => entry.content.kind === 'item') };
  };
}
