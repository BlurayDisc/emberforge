import type { DungeonRun, GameState } from '../model/gameState';

export function activeRunOf(state: GameState): DungeonRun | null {
  return state.dungeonRun !== null && state.dungeonRun.status === 'active' ? state.dungeonRun : null;
}
