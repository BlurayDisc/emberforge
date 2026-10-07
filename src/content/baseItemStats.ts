import type { BaseItemDefinition } from './baseItems';
import { UPGRADE_MAIN_STAT_FRACTION_PER_LEVEL } from './balance/crafting';
import { UNSCALED_BASE_STATS } from './balance/items';
import type { StatBonuses } from '../model/item';

// Only a stat with a flat growth (weapon damage) changes with the item level. A flat growth stat can round to 0 at a low item level. Every other stat keeps at least 1.
export function baseStatAtItemLevel(base: BaseItemDefinition, stat: keyof StatBonuses, value: number, itemLevel: number): { average: number; minimum: number } {
  const flatGrowth = base.growthPerItemLevel?.[stat];
  if (flatGrowth !== undefined) return { average: value + flatGrowth * (itemLevel - 1), minimum: 0 };
  return { average: value, minimum: 1 };
}

// Every upgrade level adds a share of the main stat, and never less than 1. Low items get a flat +1 per level, high items get the share.
// The share is taken from the main stat before any upgrade, so every level of one item adds the same amount.
export function upgradeBonusToMainStat(mainStatBeforeUpgrade: number, upgradeLevel: number): number {
  const bonusPerLevel = Math.max(1, Math.round(mainStatBeforeUpgrade * UPGRADE_MAIN_STAT_FRACTION_PER_LEVEL));
  return bonusPerLevel * upgradeLevel;
}

// The base stats without the random spread, with the upgrade bonus on the main stat.
export function averageBaseStats(base: BaseItemDefinition, itemLevel: number, upgradeLevel: number): StatBonuses {
  const stats: StatBonuses = {};
  for (const [stat, value] of Object.entries(base.baseStats) as Array<[keyof StatBonuses, number]>) {
    let statBeforeUpgrade = value;
    if (!UNSCALED_BASE_STATS.includes(stat)) {
      const { average, minimum } = baseStatAtItemLevel(base, stat, value, itemLevel);
      statBeforeUpgrade = Math.max(minimum, Math.round(average));
    }
    stats[stat] = statBeforeUpgrade + (stat === base.mainStat ? upgradeBonusToMainStat(statBeforeUpgrade, upgradeLevel) : 0);
  }
  return stats;
}
