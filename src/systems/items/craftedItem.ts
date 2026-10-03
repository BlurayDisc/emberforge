import { BASE_ITEMS, type BaseItemDefinition } from '../../content/baseItems';
import {
  BASE_STAT_GROWTH_PER_ITEM_LEVEL,
  BASE_STAT_SPREAD_FRACTION,
  ITEM_LEVEL_ROLLS_KEEP_HIGHEST,
  LEVELS_PER_BRACKET,
  QUALITY_WEIGHTS_WITHOUT_CATALYST,
  QUALITY_WEIGHTS_WITH_CATALYST,
  RARE_NAME_FIRST_PARTS,
  RARE_NAME_SECOND_PARTS,
  SELL_GROWTH_PER_ITEM_LEVEL,
  SELL_QUALITY_FACTOR,
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
  maximumItemLevel: number;
  usesCatalyst: boolean;
  ingredientValueCopper: number;
}

type CraftableQuality = 'common' | 'magic' | 'rare';

function rollQuality(usesCatalyst: boolean, random: Random): CraftableQuality {
  const weights = usesCatalyst ? QUALITY_WEIGHTS_WITH_CATALYST : QUALITY_WEIGHTS_WITHOUT_CATALYST;
  const qualities = Object.keys(weights) as CraftableQuality[];
  return random.pickWeighted(qualities, (quality) => weights[quality]);
}

function rollBaseStats(base: BaseItemDefinition, itemLevel: number, random: Random): StatBonuses {
  const levelFactor = 1 + BASE_STAT_GROWTH_PER_ITEM_LEVEL * (itemLevel - 1);
  const rolled: StatBonuses = {};
  for (const [stat, value] of Object.entries(base.baseStats) as Array<[keyof StatBonuses, number]>) {
    const spread = 1 + (random.nextFloat() * 2 - 1) * BASE_STAT_SPREAD_FRACTION;
    rolled[stat] = Math.max(1, Math.round(value * levelFactor * spread));
  }
  return rolled;
}

function rollRareNameParts(quality: CraftableQuality, random: Random): [string, string] | null {
  if (quality !== 'rare') return null;
  return [random.pick(RARE_NAME_FIRST_PARTS), random.pick(RARE_NAME_SECOND_PARTS)];
}

function computeSellValue(ingredientValueCopper: number, quality: CraftableQuality, itemLevel: number): number {
  const levelFactor = 1 + SELL_GROWTH_PER_ITEM_LEVEL * (itemLevel - 1);
  return Math.max(1, Math.round(ingredientValueCopper * SELL_QUALITY_FACTOR[quality] * levelFactor));
}

export function generateCraftedItem(request: CraftedItemRequest, random: Random): Item {
  const base = requireById(BASE_ITEMS, request.baseId);
  const bracketStart = (request.tier - 1) * LEVELS_PER_BRACKET + 1;
  const bracketEnd = request.tier * LEVELS_PER_BRACKET;
  const highestAllowedLevel = clamp(request.maximumItemLevel, bracketStart, bracketEnd);
  const itemLevel = Math.max(
    ...Array.from({ length: ITEM_LEVEL_ROLLS_KEEP_HIGHEST }, () => random.nextInt(bracketStart, highestAllowedLevel)),
  );

  const mainMaterial = MATERIALS.find((material) => material.tier === request.tier && material.category === base.mainCategory);
  if (!mainMaterial) throw new Error(`Tier ${request.tier} has no ${base.mainCategory} material for ${base.id}`);

  const quality = rollQuality(request.usesCatalyst, random);
  const affixes = rollAffixes(quality, itemLevel, random);
  return {
    id: request.itemId,
    baseId: base.id,
    materialId: mainMaterial.id,
    rareNameParts: rollRareNameParts(quality, random),
    slot: base.slot,
    gearType: base.gearType,
    armourWeight: base.armourWeight,
    quality,
    itemLevel,
    tier: request.tier,
    width: base.width,
    height: base.height,
    baseStats: rollBaseStats(base, itemLevel, random),
    affixes,
    sellValueCopper: computeSellValue(request.ingredientValueCopper, quality, itemLevel),
  };
}

export function previewBaseStatRanges(baseId: string, tier: number, maximumItemLevel: number): Record<string, [number, number]> {
  const base = requireById(BASE_ITEMS, baseId);
  const bracketStart = (tier - 1) * LEVELS_PER_BRACKET + 1;
  const highestLevel = clamp(maximumItemLevel, bracketStart, tier * LEVELS_PER_BRACKET);
  const ranges: Record<string, [number, number]> = {};
  for (const [stat, value] of Object.entries(base.baseStats) as Array<[string, number]>) {
    const lowest = value * (1 + BASE_STAT_GROWTH_PER_ITEM_LEVEL * (bracketStart - 1)) * (1 - BASE_STAT_SPREAD_FRACTION);
    const highest = value * (1 + BASE_STAT_GROWTH_PER_ITEM_LEVEL * (highestLevel - 1)) * (1 + BASE_STAT_SPREAD_FRACTION);
    ranges[stat] = [Math.max(1, Math.round(lowest)), Math.max(1, Math.round(highest))];
  }
  return ranges;
}
