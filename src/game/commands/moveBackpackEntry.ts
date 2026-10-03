import { backpackRowsOf } from '../storage';
import { moveEntry, type GridPosition } from '../../systems/inventory';
import { CommandRejected, type Command } from '../gameStore';

export function moveBackpackEntryCommand(from: GridPosition, to: GridPosition): Command {
  return (state) => {
    const moved = moveEntry(state.backpack, from, to, backpackRowsOf(state));
    if (moved === null) throw new CommandRejected('reject.cannotPlaceThere');
    return { ...state, backpack: moved };
  };
}
