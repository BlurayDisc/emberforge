import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import type { BackpackEntry } from '../../model/backpack';
import { saleSeconds } from '../../systems/economy';
import { findEntryAt, isOnSale, type GridPosition } from '../../systems/inventory';
import { CommandRejected, type Command } from '../gameStore';
import { merchantSaleSlotsOf } from '../storage';

function valueOf(entry: BackpackEntry): number {
  if (entry.content.kind === 'item') return entry.content.item.sellValueCopper;
  return requireById(MATERIALS, entry.content.materialId).sellValueCopper * entry.content.quantity;
}

// The goods stay in their cell, marked as on sale. The merchant pays when the sale ends. The merchant has few sale slots.
export function sellBackpackEntryCommand(position: GridPosition, nowMs: number): Command {
  return (state) => {
    const entry = findEntryAt(state.backpack, position);
    if (!entry) throw new CommandRejected('reject.nothingToSell');
    if (isOnSale(entry)) throw new CommandRejected('reject.alreadyOnSale');
    const salesInProgress = state.jobs.filter((job) => job.kind === 'sell').length;
    const saleSlots = merchantSaleSlotsOf(state);
    if (salesInProgress >= saleSlots) throw new CommandRejected('reject.merchantBusy', { slots: saleSlots });
    const copper = valueOf(entry);
    const jobNumber = state.jobsStarted + 1;
    return {
      ...state,
      backpack: state.backpack.map((candidate) => (candidate === entry ? { ...candidate, saleJobId: jobNumber } : candidate)),
      jobsStarted: jobNumber,
      jobs: [...state.jobs, { id: jobNumber, kind: 'sell', startedAtMs: nowMs, finishesAtMs: nowMs + saleSeconds(copper) * 1000, copper }],
    };
  };
}
