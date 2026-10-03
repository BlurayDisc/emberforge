import { addMaterials } from '../../systems/inventory';
import { isMillFull } from '../../systems/mill';
import { CommandRejected, type Command } from '../gameStore';
import { backpackRowsOf } from '../storage';

// Whatever fits goes to the backpack. The rest stays at the Mill. A Mill that was full starts its clock again.
export function collectMillMaterialsCommand(): Command {
  return (state) => {
    if (state.mill.storedMaterials.length === 0) throw new CommandRejected('reject.nothingToCollect');
    const added = addMaterials(state.backpack, state.mill.storedMaterials, backpackRowsOf(state));
    const takenCount = state.mill.storedMaterials.reduce((total, stack) => total + stack.quantity, 0) - added.overflow.reduce((total, stack) => total + stack.quantity, 0);
    if (takenCount === 0) throw new CommandRejected('reject.backpackFullForLoot');
    const mill = { ...state.mill, storedMaterials: added.overflow };
    return { ...state, backpack: added.entries, mill: isMillFull(state.mill) && !isMillFull(mill) ? { ...mill, productionClockStartedAtMs: null } : mill };
  };
}
