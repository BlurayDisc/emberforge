import { addItem, addMaterials } from '../../systems/inventory';
import { CommandRejected, type Command } from '../gameStore';
import { backpackRowsOf } from '../storage';

// The merchant gives the goods back. If the backpack has no room, the sale goes on.
export function cancelSaleCommand(jobId: number): Command {
  return (state) => {
    const job = state.jobs.find((candidate) => candidate.id === jobId);
    if (!job || job.kind !== 'sell') throw new CommandRejected('reject.noSaleToCancel');
    const remainingJobs = state.jobs.filter((candidate) => candidate.id !== jobId);
    if (job.content.kind === 'item') {
      const backpack = addItem(state.backpack, job.content.item, backpackRowsOf(state));
      if (backpack === null) throw new CommandRejected('reject.backpackFullForItem');
      return { ...state, backpack, jobs: remainingJobs };
    }
    const added = addMaterials(state.backpack, [{ materialId: job.content.materialId, quantity: job.content.quantity }], backpackRowsOf(state));
    if (added.overflow.length > 0) throw new CommandRejected('reject.backpackFullForItem');
    return { ...state, backpack: added.entries, jobs: remainingJobs };
  };
}
