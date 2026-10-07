import { BASE_ITEMS } from '../../content/baseItems';
import { averageBaseStats } from '../../content/baseItemStats';

// Version 26: the gear budget. Base stats are whole numbers that come from the current base items, and an upgrade level adds a flat +1 to the main stat.
// An old item counted its upgrade level as extra item levels, so its stats are computed again. The random spread is lost. An item whose base item is gone keeps its stats.
// The profession Woodworking is now Enchanting, so its crafter level and jobs keep working under the new id.
// The code reads old saves as loose JSON, because the old item shapes no longer exist as types.
type Loose = Record<string, unknown>;

function isItem(value: unknown): value is Loose {
  return typeof value === 'object' && value !== null && 'baseId' in value && 'baseStats' in value && 'affixes' in value;
}

function migrateItem(item: Loose): Loose {
  const base = BASE_ITEMS.find((candidate) => candidate.id === item.baseId);
  const itemLevel = item.itemLevel;
  if (!base || typeof itemLevel !== 'number') return item;
  const upgradeLevel = typeof item.upgradeLevel === 'number' ? item.upgradeLevel : 0;
  return { ...item, baseStats: averageBaseStats(base, itemLevel, upgradeLevel) };
}

const OLD_PROFESSION_ID = 'woodworking';
const NEW_PROFESSION_ID = 'enchanting';

function migrateEveryItem(value: unknown): unknown {
  if (typeof value === 'string') return value === OLD_PROFESSION_ID ? NEW_PROFESSION_ID : value;
  if (Array.isArray(value)) return value.map(migrateEveryItem);
  if (typeof value !== 'object' || value === null) return value;
  if (isItem(value)) return migrateItem(value);
  return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key === OLD_PROFESSION_ID ? NEW_PROFESSION_ID : key, migrateEveryItem(inner)]));
}

export function migrateGearBudget(save: Loose): Loose {
  return migrateEveryItem(save) as Loose;
}
