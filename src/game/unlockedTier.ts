import { TOWNS } from '../content/towns';
import type { GameState } from '../model/gameState';

export function highestUnlockedTier(state: GameState): number {
  const townIndex = TOWNS.findIndex((town) => town.id === state.townId);
  return Math.max(1, townIndex + 1);
}
