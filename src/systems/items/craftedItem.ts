import { BASE_ITEMS, type BaseItemDefinition } from '../../content/baseItems';
import {
  BASE_STAT_GROWTH_PER_ITEM_LEVEL,
  BASE_STAT_SPREAD_FRACTION,
  ITEM_LEVEL_ROLLS_KEEP_HIGHEST,
  LEVELS_PER_BRACKET,
  QUALITY_WEIGHTS,
  RARE_NAME_FIRST_PARTS,
  RARE_NAME_SECOND_PARTS,
  SELL_GROWTH_PER_ITEM_LEVEL,
  SELL_QUALITY_FACTOR,
  UNSCALED_BASE_STATS,
} from '../../content/balance/items';
import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import { clamp } from '../../kernel/math';
import type { Random } from '../../kernel/random';
import type { Item, StatBonuses } from '../../model/item';
import { rollAffixes } from './rollAffixes';

export interface CraftedItemRequest {
  itemId: string;
  baseId: string;
  tier: number;
  setMaterialId: string | null;
  maximumItemLevel: number;
  upgradeLevel: number;
  craftingCostCopper: number;
}

type CraftableQuality = 'common' | 'magic' | 'rare';

function rollQuality(random: Random): CraftableQuality {
  const qualities = Object.keys(QUALITY_WEIGHTS) as CraftableQuality[];
  return random.pickWeighted(qualities, (quality) => QUALITY_WEIGHTS[quality]);
}

// Each upgrade level counts as one more item level for base stats and value. The item level that limits who can equip it does not change.
function rollBaseStats(base: BaseItemDefinition, effectiveItemLevel: number, random: Random): StatBonuses {
  const levelFactor = 1 + BASE_STAT_GROWTH_PER_ITEM_LEVEL * (effectiveItemLevel - 1);
  const rolled: StatBonuses = {};
  for (const [stat, value] of Object.entries(base.baseStats) as Array<[keyof StatBonuses, number]>) {
    if (UNSCALED_BASE_STATS.includes(stat)) {
      rolled[stat] = value;
      continue;
    }
    const spread = 1 + (random.nextFloat() * 2 - 1) * BASE_STAT_SPREAD_FRACTION;
    rolled[stat] = Math.max(1, Math.round(value * levelFactor * spread));
  }
  return rolled;
}

function rollRareNameParts(quality: CraftableQuality, random: Random): [string, string] | null {
  if (quality !== 'rare') return null;
  return [random.pick(RARE_NAME_FIRST_PARTS), random.pick(RARE_NAME_SECOND_PARTS)];
}

// The cost is the ingredients plus the crafter fee. A better quality item sells for a multiple of it.
function computeSellValue(craftingCostCopper: number, quality: CraftableQuality, itemLevel: number): number {
  const levelFactor = 1 + SELL_GROWTH_PER_ITEM_LEVEL * (itemLevel - 1);
  return Math.max(1, Math.round(craftingCostCopper * SELL_QUALITY_FACTOR[quality] * levelFactor));
}

export function generateCraftedItem(request: CraftedItemRequest, random: Random): Item {
  const base = requireById(BASE_ITEMS, request.baseId);
  const { lowest: lowestItemLevel, highest: highestAllowedLevel } = craftableItemLevelRange(request.tier, request.maximumItemLevel);
  const itemLevel = Math.max(
    ...Array.from({ length: ITEM_LEVEL_ROLLS_KEEP_HIGHEST }, () => random.nextInt(lowestItemLevel, highestAllowedLevel)),
  );

  const mainMaterial = MATERIALS.find((material) => material.tier === request.tier && material.category === base.mainCategory);
  if (!mainMaterial) throw new Error(`Tier ${request.tier} has no ${base.mainCategory} material for ${base.id}`);

  const setMaterial = request.setMaterialId === null ? undefined : requireById(MATERIALS, request.setMaterialId);
  const quality = rollQuality(random);
  const affixes = rollAffixes(quality, itemLevel, random);
  return {
    id: request.itemId,
    baseId: base.id,
    materialId: setMaterial?.id ?? mainMaterial.id,
    rareNameParts: rollRareNameParts(quality, random),
    slot: base.slot,
    gearType: base.gearType,
    armourWeight: base.armourWeight,
    quality,
    itemLevel,
    upgradeLevel: request.upgradeLevel,
    tier: request.tier,
    width: base.width,
    height: base.height,
    baseStats: rollBaseStats(base, itemLevel + request.upgradeLevel, random),
    affixes,
    sellValueCopper: computeSellValue(request.craftingCostCopper, quality, itemLevel + request.upgradeLevel),
  };
}

// The crafter rolls an item level inside the tier bracket, up to the cap that the best hero sets.
export function craftableItemLevelRange(tier: number, maximumItemLevel: number): { lowest: number; highest: number } {
  const lowest = (tier - 1) * LEVELS_PER_BRACKET + 1;
  return { lowest, highest: clamp(maximumItemLevel, lowest, tier * LEVELS_PER_BRACKET) };
}

export function previewBaseStatRanges(baseId: string, tier: number, maximumItemLevel: number): Record<string, [number, number]> {
  const base = requireById(BASE_ITEMS, baseId);
  const bracketStart = (tier - 1) * LEVELS_PER_BRACKET + 1;
  const highestLevel = clamp(maximumItemLevel, bracketStart, tier * LEVELS_PER_BRACKET);
  const ranges: Record<string, [number, number]> = {};
  for (const [stat, value] of Object.entries(base.baseStats) as Array<[string, number]>) {
    if (UNSCALED_BASE_STATS.includes(stat)) {
      ranges[stat] = [value, value];
      continue;
    }
    const lowest = value * (1 + BASE_STAT_GROWTH_PER_ITEM_LEVEL * (bracketStart - 1)) * (1 - BASE_STAT_SPREAD_FRACTION);
    const highest = value * (1 + BASE_STAT_GROWTH_PER_ITEM_LEVEL * (highestLevel - 1)) * (1 + BASE_STAT_SPREAD_FRACTION);
    ranges[stat] = [Math.max(1, Math.round(lowest)), Math.max(1, Math.round(highest))];
  }
  return ranges;
}
