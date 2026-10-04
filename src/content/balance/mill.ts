import data from '../../../data/balance/mill.json';

export const MILL_BASE_STORAGE_CAPACITY = data.baseStorageCapacity;
export const MILL_STORAGE_CAPACITY_UPGRADE_COSTS_COPPER: readonly number[] = data.storageCapacityUpgradeCostsCopper;
export const MILL_PRODUCTION_INTERVAL_SECONDS_BY_SPEED_UPGRADE: readonly number[] = data.productionIntervalSecondsBySpeedUpgrade;
export const MILL_SHORTEST_PRODUCTION_INTERVAL_SECONDS = Math.min(...MILL_PRODUCTION_INTERVAL_SECONDS_BY_SPEED_UPGRADE);
export const MILL_SPEED_UPGRADE_COSTS_COPPER: readonly number[] = data.speedUpgradeCostsCopper;
export const MILL_PRODUCED_MATERIAL_IDS: readonly string[] = data.producedMaterialIds;
