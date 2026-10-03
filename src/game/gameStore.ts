import type { GameState } from '../model/gameState';
import { parseGameState, serializeGameState } from '../systems/save';
import { createNewGameState } from './newGame';
import type { SaveStorage } from './saveStorage';

export type Command = (state: GameState) => GameState;

export class CommandRejected extends Error {}

export interface CommandResult {
  accepted: boolean;
  rejectionReason: string | null;
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
        return { accepted: true, rejectionReason: null };
      } catch (error) {
        if (error instanceof CommandRejected) return { accepted: false, rejectionReason: error.message };
        throw error;
      }
    },
    startNewGame: () => commit(createFreshState()),
  };
}
