// Version 19: a saved game owns no Mill upgrade. A Mill that holds more than its new capacity keeps what it holds.
export function migrateMillUpgrades(save: Record<string, unknown>): Record<string, unknown> {
  return { ...save, millCapacityUpgrades: 0, millSpeedUpgrades: 0 };
}
