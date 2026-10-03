import { DUNGEONS, type DungeonDefinition } from '../content/dungeons';
import type { DungeonRun, GameState } from '../model/gameState';

export function activeRunsOf(state: GameState): readonly DungeonRun[] {
  return state.dungeonRuns;
}

export function findActiveRun(state: GameState, runNumber: number): DungeonRun | undefined {
  return state.dungeonRuns.find((run) => run.runNumber === runNumber);
}

export function runInDungeon(state: GameState, dungeonId: string): DungeonRun | undefined {
  return state.dungeonRuns.find((run) => run.dungeonId === dungeonId);
}

export function runOfHero(state: GameState, heroId: string): DungeonRun | undefined {
  return state.dungeonRuns.find((run) => run.heroIds.includes(heroId));
}

// A dungeon opens when the dungeon before it has been cleared. The first one is open from the start.
export function isDungeonUnlocked(state: GameState, dungeon: DungeonDefinition): boolean {
  return dungeon.unlockAfter === null || state.clearedDungeonIds.includes(dungeon.unlockAfter);
}

export function findDungeon(dungeonId: string): DungeonDefinition | undefined {
  return DUNGEONS.find((candidate) => candidate.id === dungeonId);
}
