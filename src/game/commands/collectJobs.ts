import type { GameState } from '../../model/gameState';
import type { CraftJob, TimedJob } from '../../model/timedJob';
import { applyCraftingExperience } from '../../systems/crafting';
import { addItem } from '../../systems/inventory';
import { CommandRejected, type Command } from '../gameStore';
import { backpackRowsOf } from '../storage';

// A craft that already found no room is not tried again by the clock. The player collects it.
export function findFinishedJobs(state: GameState, nowMs: number): TimedJob[] {
  return state.jobs.filter((job) => job.finishesAtMs <= nowMs && !(job.kind === 'craft' && job.isWaitingForCollection));
}

function deliverCraft(state: GameState, job: CraftJob): GameState | null {
  const backpack = addItem(state.backpack, job.item, backpackRowsOf(state));
  if (backpack === null) return null;
  const crafter = state.crafters[job.professionId] ?? { level: 1, experience: 0 };
  return {
    ...state,
    backpack,
    jobs: state.jobs.filter((candidate) => candidate.id !== job.id),
    crafters: { ...state.crafters, [job.professionId]: applyCraftingExperience(crafter, job.crafterExperience) },
  };
}

// A finished sale pays at once. A finished craft needs backpack room. Without room, the item stays at
// the crafter, marked as waiting, so no item is ever lost and the crafter stays busy until it is collected.
function finishJob(state: GameState, job: TimedJob): GameState {
  if (job.kind === 'sell') return { ...state, backpack: state.backpack.filter((entry) => entry.saleJobId !== job.id), jobs: state.jobs.filter((candidate) => candidate.id !== job.id), copper: state.copper + job.copper };
  return deliverCraft(state, job) ?? { ...state, jobs: state.jobs.map((candidate) => (candidate.id === job.id ? { ...job, isWaitingForCollection: true } : candidate)) };
}

export function collectFinishedJobsCommand(nowMs: number): Command {
  return (state) => {
    const due = findFinishedJobs(state, nowMs);
    if (due.length === 0) throw new CommandRejected('reject.nothingDue');
    return due.reduce(finishJob, state);
  };
}

export function collectWaitingCraftCommand(professionId: string): Command {
  return (state) => {
    const job = state.jobs.find((candidate): candidate is CraftJob => candidate.kind === 'craft' && candidate.professionId === professionId && candidate.isWaitingForCollection);
    if (!job) throw new CommandRejected('reject.nothingToCollect');
    const delivered = deliverCraft(state, job);
    if (delivered === null) throw new CommandRejected('reject.backpackFullForItem');
    return delivered;
  };
}
