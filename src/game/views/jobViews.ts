import { saleSeconds } from '../../systems/economy';
import type { GameState } from '../../model/gameState';
import type { CraftJob, SaleJob } from '../../model/timedJob';

export function listSaleJobs(state: GameState): SaleJob[] {
  return state.jobs.filter((job): job is SaleJob => job.kind === 'sell');
}

export function crafterJob(state: GameState, professionId: string): CraftJob | undefined {
  return state.jobs.find((job): job is CraftJob => job.kind === 'craft' && job.professionId === professionId);
}

// How long the merchant needs to sell goods of this value.
export function saleDurationSeconds(valueCopper: number): number {
  return saleSeconds(valueCopper);
}
