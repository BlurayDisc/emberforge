import { PROFESSION_IDS } from '../content/baseItems';
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
    heroesHired: 0,
    backpack: [],
    backpackExpansions: 0,
    merchantExtraSlots: 0,
    itemsCrafted: 0,
    runsStarted: 0,
    dungeonRuns: [],
    reports: [],
    clearedDungeonIds: [],
    crafters: Object.fromEntries(PROFESSION_IDS.map((professionId) => [professionId, { level: 1, experience: 0 }])),
    jobs: [],
    jobsStarted: 0,
  };
}
