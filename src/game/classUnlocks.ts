import { CLASSES } from '../content/classes';
import { requireById } from '../content/lookup';
import type { GameState } from '../model/gameState';
import type { ClassId } from '../model/hero';

// A class opens for hire when the dungeon it names has been cleared. A class with no dungeon is open from the start.
export function isClassUnlocked(state: GameState, classId: ClassId): boolean {
  const { unlockAfterDungeonId } = requireById(CLASSES, classId);
  return unlockAfterDungeonId === null || state.clearedDungeonIds.includes(unlockAfterDungeonId);
}
