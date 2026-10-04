import { MILL_BASE_STORAGE_CAPACITY, MILL_PRODUCTION_INTERVAL_SECONDS_BY_SPEED_UPGRADE, MILL_SHORTEST_PRODUCTION_INTERVAL_SECONDS } from '../content/balance/mill';
import type { GameState } from '../model/gameState';
import type { MillSettings } from '../model/mill';

export function millSettingsOf(state: GameState): MillSettings {
  return {
    storageCapacity: MILL_BASE_STORAGE_CAPACITY + state.millCapacityUpgrades,
    productionIntervalSeconds: MILL_PRODUCTION_INTERVAL_SECONDS_BY_SPEED_UPGRADE[state.millSpeedUpgrades] ?? MILL_SHORTEST_PRODUCTION_INTERVAL_SECONDS,
  };
}
