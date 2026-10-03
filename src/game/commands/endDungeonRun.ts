import type { GameState, RunEndReason } from '../../model/gameState';

export function endDungeonRun(state: GameState, reason: RunEndReason): GameState {
  if (state.dungeonRun === null) return state;
  return {
    ...state,
    company: state.company.map((hero) => ({ ...hero, healthFraction: 1 })),
    dungeonRun: { ...state.dungeonRun, status: 'ended', endReason: reason },
  };
}
