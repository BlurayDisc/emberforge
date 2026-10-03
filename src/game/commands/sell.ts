import { MERCHANT_SALE_SLOTS } from '../../content/balance/economy';
import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import type { BackpackEntry } from '../../model/backpack';
import { saleSeconds } from '../../systems/economy';
import { findEntryAt, removeEntryAt, type GridPosition } from '../../systems/inventory';
import { CommandRejected, type Command } from '../gameStore';

function valueOf(entry: BackpackEntry): number {
  if (entry.content.kind === 'item') return entry.content.item.sellValueCopper;
  return requireById(MATERIALS, entry.content.materialId).sellValueCopper * entry.content.quantity;
}

// The merchant takes the goods now and pays when the sale ends. The merchant has few sale slots.
export function sellBackpackEntryCommand(position: GridPosition, nowMs: number): Command {
  return (state) => {
    const entry = findEntryAt(state.backpack, position);
    if (!entry) throw new CommandRejected('reject.nothingToSell');
    const salesInProgress = state.jobs.filter((job) => job.kind === 'sell').length;
    if (salesInProgress >= MERCHANT_SALE_SLOTS) throw new CommandRejected('reject.merchantBusy', { slots: MERCHANT_SALE_SLOTS });
    const copper = valueOf(entry);
    const jobNumber = state.jobsStarted + 1;
    return {
      ...state,
      backpack: removeEntryAt(state.backpack, position),
      jobsStarted: jobNumber,
      jobs: [...state.jobs, { id: jobNumber, kind: 'sell', startedAtMs: nowMs, finishesAtMs: nowMs + saleSeconds(copper) * 1000, content: entry.content, copper }],
    };
  };
}
