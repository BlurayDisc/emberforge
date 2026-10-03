// Version 18: the Mill makes materials by the clock. A saved game starts with an empty Mill.
export function migrateMill(save: Record<string, unknown>): Record<string, unknown> {
  return { ...save, mill: { productionClockStartedAtMs: null, productionsMade: 0, storedMaterials: [] } };
}
