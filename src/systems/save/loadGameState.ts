import type { GameState } from '../../model/gameState';
import { parseGameState } from './saveFormat';
import { salvageGameState } from './salvageGameState';

export interface LoadedGameState {
  state: GameState;
  // False when the save was too new or too old to migrate, or when a part of it was dropped. The caller keeps the raw text.
  isIntact: boolean;
}

function readJson(serialized: string): unknown {
  try {
    return JSON.parse(serialized);
  } catch {
    return null;
  }
}

// A save always loads. The migrations run first. If they cannot, the raw save is read part by part.
// Returns null only when the text is not a save at all (not JSON, or not an object).
export function loadGameState(serialized: string, freshState: GameState): LoadedGameState | null {
  const migrated = parseGameState(serialized);
  const salvaged = salvageGameState(migrated ?? readJson(serialized), freshState);
  if (!salvaged) return null;
  return { state: salvaged.state, isIntact: migrated !== null && salvaged.droppedCount === 0 };
}
