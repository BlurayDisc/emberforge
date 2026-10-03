import type { GameState, RunEndReason } from '../../model/gameState';

// The run must already hold its latest counters in state.dungeonRuns. Only the heroes of
// this run are healed, because heroes of other runs are still fighting.
export function endDungeonRun(state: GameState, runNumber: number, reason: RunEndReason): GameState {
  const run = state.dungeonRuns.find((candidate) => candidate.runNumber === runNumber);
  if (!run) return state;
  return {
    ...state,
    company: state.company.map((hero) => (run.heroIds.includes(hero.id) ? { ...hero, healthFraction: 1 } : hero)),
    dungeonRuns: state.dungeonRuns.filter((candidate) => candidate.runNumber !== runNumber),
    lastEndedRun: { ...run, status: 'ended', endReason: reason },
  };
}
