import { STARTING_TOWN_ID } from '../content/towns';
import type { GameState } from '../model/gameState';
import { CURRENT_SAVE_VERSION } from '../systems/save';

export function createNewGameState(seed: number): GameState {
  return {
    saveVersion: CURRENT_SAVE_VERSION,
    seed: seed >>> 0,
    townId: STARTING_TOWN_ID,
    copper: 0,
    company: [],
    partyHeroIds: [],
    heroesHired: 0,
    backpack: [],
    itemsCrafted: 0,
    runsStarted: 0,
    dungeonRun: null,
  };
}
