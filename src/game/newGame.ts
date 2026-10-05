import { PROFESSION_IDS } from '../content/baseItems';
import { STARTING_COPPER } from '../content/balance/economy';
import { STARTING_TOWN_ID } from '../content/towns';
import type { GameState } from '../model/gameState';
import { CURRENT_SAVE_VERSION } from '../systems/save';

export function createNewGameState(seed: number): GameState {
  return {
    saveVersion: CURRENT_SAVE_VERSION,
    seed: seed >>> 0,
    townId: STARTING_TOWN_ID,
    copper: STARTING_COPPER,
    company: [],
    heroesHired: 0,
    backpack: [],
    backpackExpansions: 0,
    merchantExtraSlots: 0,
    millCapacityUpgrades: 0,
    millSpeedUpgrades: 0,
    bankUnlockIds: [],
    itemsCrafted: 0,
    runsStarted: 0,
    dungeonRuns: [],
    reports: [],
    clearedDungeonIds: [],
    crafters: Object.fromEntries(PROFESSION_IDS.map((professionId) => [professionId, { level: 1, experience: 0 }])),
    jobs: [],
    jobsStarted: 0,
    pendingLoot: {},
    pendingItems: {},
    mill: { productionClockStartedAtMs: null, productionsMade: 0, storedMaterials: [] },
  };
}
