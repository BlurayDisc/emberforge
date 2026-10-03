import type { GameState } from '../../model/gameState';

export const CURRENT_SAVE_VERSION = 1;

export function serializeGameState(state: GameState): string {
  return JSON.stringify(state);
}

export function parseGameState(serialized: string): GameState | null {
  try {
    const parsed = JSON.parse(serialized) as Partial<GameState>;
    if (parsed.saveVersion !== CURRENT_SAVE_VERSION) return null;
    if (!Array.isArray(parsed.company) || !Array.isArray(parsed.backpackMaterials)) return null;
    return parsed as GameState;
  } catch {
    return null;
  }
}
