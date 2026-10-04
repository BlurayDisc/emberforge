import type { GameState } from '../../model/gameState';
import { SAVE_MIGRATIONS } from './migrations';

export const CURRENT_SAVE_VERSION = 19;

export function serializeGameState(state: GameState): string {
  return JSON.stringify(state);
}

// Runs the migrations one after another, from the saved version up to the current one.
// A save from a newer game, or one with a missing step, returns null. The caller must then keep the raw text.
export function parseGameState(serialized: string): GameState | null {
  try {
    let save = JSON.parse(serialized) as Record<string, unknown>;
    while (typeof save.saveVersion === 'number' && save.saveVersion < CURRENT_SAVE_VERSION) {
      const migration = SAVE_MIGRATIONS.find((candidate) => candidate.fromVersion === save.saveVersion);
      if (!migration) return null;
      save = { ...migration.migrate(save), saveVersion: migration.fromVersion + 1 };
    }
    if (save.saveVersion !== CURRENT_SAVE_VERSION) return null;
    if (!Array.isArray(save.company) || !Array.isArray(save.backpack)) return null;
    return save as unknown as GameState;
  } catch {
    return null;
  }
}
