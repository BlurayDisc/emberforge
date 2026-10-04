import { MILL_PRODUCED_MATERIAL_IDS } from '../../content/balance/mill';
import type { Random } from '../../kernel/random';
import type { MillSettings, MillState } from '../../model/mill';

const MILLISECONDS_PER_SECOND = 1000;

export function storedMillMaterialCount(mill: MillState): number {
  return mill.storedMaterials.reduce((total, stack) => total + stack.quantity, 0);
}

export function isMillFull(mill: MillState, settings: MillSettings): boolean {
  return storedMillMaterialCount(mill) >= settings.storageCapacity;
}

export function nextMillProductionAtMs(mill: MillState, settings: MillSettings): number | null {
  if (mill.productionClockStartedAtMs === null) return null;
  return mill.productionClockStartedAtMs + settings.productionIntervalSeconds * MILLISECONDS_PER_SECOND;
}

function addToStock(mill: MillState, materialIds: readonly string[]): MillState['storedMaterials'] {
  const stock = mill.storedMaterials.map((stack) => ({ ...stack }));
  for (const materialId of materialIds) {
    const existing = stock.find((stack) => stack.materialId === materialId);
    if (existing) existing.quantity += 1;
    else stock.push({ materialId, quantity: 1 });
  }
  return stock;
}

// The Mill works by the clock, also while the page was closed. A full Mill stops its clock,
// so time spent full is never saved up. Each product has its own random stream by its number.
// Returns null when nothing changes.
export function produceMillMaterials(mill: MillState, settings: MillSettings, nowMs: number, random: Random): MillState | null {
  if (isMillFull(mill, settings)) return null;
  if (mill.productionClockStartedAtMs === null) return { ...mill, productionClockStartedAtMs: nowMs };
  const intervalMs = settings.productionIntervalSeconds * MILLISECONDS_PER_SECOND;
  const intervalsPassed = Math.floor((nowMs - mill.productionClockStartedAtMs) / intervalMs);
  if (intervalsPassed < 1) return null;
  const roomLeft = settings.storageCapacity - storedMillMaterialCount(mill);
  const productsMade = Math.min(intervalsPassed, roomLeft);
  const producedIds = Array.from({ length: productsMade }, (_, index) => random.fork(`mill-${mill.productionsMade + index}`).pick(MILL_PRODUCED_MATERIAL_IDS));
  const isFullNow = productsMade === roomLeft;
  return {
    productionClockStartedAtMs: isFullNow ? null : mill.productionClockStartedAtMs + productsMade * intervalMs,
    productionsMade: mill.productionsMade + productsMade,
    storedMaterials: addToStock(mill, producedIds),
  };
}
