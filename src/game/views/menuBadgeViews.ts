import type { GameState } from '../../model/gameState';
import type { CraftJob } from '../../model/timedJob';

export interface ActivityBadge {
  inProgress: number;
  ready: number;
}

// Dungeons count fights that run and results the player has not opened. The Workshop counts crafts that run and crafts that wait for a click.
export function dungeonActivityOf(state: GameState): ActivityBadge {
  return { inProgress: state.dungeonRuns.length, ready: state.reports.length };
}

export function workshopActivityOf(state: GameState): ActivityBadge {
  const crafts = state.jobs.filter((job): job is CraftJob => job.kind === 'craft');
  const ready = crafts.filter((job) => job.isWaitingForCollection).length;
  return { inProgress: crafts.length - ready, ready };
}
