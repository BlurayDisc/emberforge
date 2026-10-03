import type { GameState } from '../model/gameState';
import { parseGameState, serializeGameState } from '../systems/save';
import { createNewGameState } from './newGame';
import type { SaveStorage } from './saveStorage';

export type Command = (state: GameState) => GameState;

export type MessageParams = Record<string, string | number>;

export class CommandRejected extends Error {
  readonly key: string;
  readonly params: MessageParams;

  constructor(key: string, params: MessageParams = {}) {
    super(key);
    this.key = key;
    this.params = params;
  }
}

export interface Rejection {
  key: string;
  params: MessageParams;
}

export interface CommandResult {
  accepted: boolean;
  rejection: Rejection | null;
}

export interface GameStore {
  getState(): GameState;
  subscribe(listener: () => void): () => void;
  execute(command: Command): CommandResult;
  startNewGame(): void;
}

function loadSavedState(storage: SaveStorage): GameState | null {
  const serialized = storage.read();
  return serialized === null ? null : parseGameState(serialized);
}

function createFreshState(): GameState {
  return createNewGameState(Date.now());
}

export function createGameStore(storage: SaveStorage): GameStore {
  let state = loadSavedState(storage) ?? createFreshState();
  const listeners = new Set<() => void>();

  const commit = (newState: GameState): void => {
    state = newState;
    storage.write(serializeGameState(state));
    listeners.forEach((listener) => listener());
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    execute: (command) => {
      try {
        commit(command(state));
        return { accepted: true, rejection: null };
      } catch (error) {
        if (error instanceof CommandRejected) return { accepted: false, rejection: { key: error.key, params: error.params } };
        throw error;
      }
    },
    startNewGame: () => commit(createFreshState()),
  };
}
