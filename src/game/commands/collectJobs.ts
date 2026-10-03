import type { GameState } from '../../model/gameState';
import type { TimedJob } from '../../model/timedJob';
import { applyCraftingExperience } from '../../systems/crafting';
import { addItem } from '../../systems/inventory';
import { CommandRejected, type Command } from '../gameStore';
import { backpackRowsOf } from '../storage';

export function findFinishedJobs(state: GameState, nowMs: number): TimedJob[] {
  return state.jobs.filter((job) => job.finishesAtMs <= nowMs);
}

// A finished sale pays at once. A finished craft needs backpack room. Without room, the job waits
// and the next call tries again, so no item is ever lost.
function finishJob(state: GameState, job: TimedJob): GameState | null {
  const withoutJob = { ...state, jobs: state.jobs.filter((candidate) => candidate.id !== job.id) };
  if (job.kind === 'sell') return { ...withoutJob, copper: state.copper + job.copper };
  const backpack = addItem(state.backpack, job.item, backpackRowsOf(state));
  if (backpack === null) return null;
  const crafter = state.crafters[job.professionId] ?? { level: 1, experience: 0 };
  return { ...withoutJob, backpack, crafters: { ...state.crafters, [job.professionId]: applyCraftingExperience(crafter, job.crafterExperience) } };
}

export function collectFinishedJobsCommand(nowMs: number): Command {
  return (state) => {
    let current = state;
    let finishedAny = false;
    for (const job of findFinishedJobs(state, nowMs)) {
      const next = finishJob(current, job);
      if (next === null) continue;
      current = next;
      finishedAny = true;
    }
    if (!finishedAny) throw new CommandRejected('reject.nothingDue');
    return current;
  };
}
