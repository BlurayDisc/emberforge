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
