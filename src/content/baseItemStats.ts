import type { BaseItemDefinition } from './baseItems';
import { UNSCALED_BASE_STATS } from './balance/items';
import type { StatBonuses } from '../model/item';

// Only a stat with a flat growth (weapon damage) changes with the item level. A flat growth stat can round to 0 at a low item level. Every other stat keeps at least 1.
export function baseStatAtItemLevel(base: BaseItemDefinition, stat: keyof StatBonuses, value: number, itemLevel: number): { average: number; minimum: number } {
  const flatGrowth = base.growthPerItemLevel?.[stat];
  if (flatGrowth !== undefined) return { average: value + flatGrowth * (itemLevel - 1), minimum: 0 };
  return { average: value, minimum: 1 };
}

// The base stats without the random spread, with the flat upgrade bonus on the main stat.
export function averageBaseStats(base: BaseItemDefinition, itemLevel: number, upgradeLevel: number): StatBonuses {
  const stats: StatBonuses = {};
  for (const [stat, value] of Object.entries(base.baseStats) as Array<[keyof StatBonuses, number]>) {
    const upgradeBonus = stat === base.mainStat ? upgradeLevel : 0;
    if (UNSCALED_BASE_STATS.includes(stat)) {
      stats[stat] = value + upgradeBonus;
      continue;
    }
    const { average, minimum } = baseStatAtItemLevel(base, stat, value, itemLevel);
    stats[stat] = Math.max(minimum, Math.round(average)) + upgradeBonus;
  }
  return stats;
}
