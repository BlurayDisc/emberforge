import { CommandRejected, type Command } from '../gameStore';

// The goods are still in their cell, so cancelling never needs room in the backpack.
export function cancelSaleCommand(jobId: number): Command {
  return (state) => {
    const job = state.jobs.find((candidate) => candidate.id === jobId);
    if (!job || job.kind !== 'sell') throw new CommandRejected('reject.noSaleToCancel');
    return {
      ...state,
      backpack: state.backpack.map((entry) => {
        if (entry.saleJobId !== jobId) return entry;
        const { saleJobId, ...entryWithoutSaleMark } = entry;
        return entryWithoutSaleMark;
      }),
      jobs: state.jobs.filter((candidate) => candidate.id !== jobId),
    };
  };
}
