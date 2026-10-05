import { BASE_ITEMS, type BaseItemDefinition } from '../../content/baseItems';
import {
  BASE_STAT_GROWTH_PER_ITEM_LEVEL,
  BASE_STAT_SPREAD_FRACTION,
  QUALITY_WEIGHTS,
  RARE_NAME_FIRST_PARTS,
  RARE_NAME_SECOND_PARTS,
  SELL_GROWTH_PER_UPGRADE_LEVEL,
  SELL_ADDED_VALUE_COPPER_PER_AFFIX,
  SELL_ADDED_VALUE_COPPER_PER_INGREDIENT,
  SELL_ADDED_VALUE_COPPER_PER_ITEM,
  SELL_QUALITY_FACTOR,
  UNSCALED_BASE_STATS,
} from '../../content/balance/items';
import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import type { Random } from '../../kernel/random';
import type { Item, StatBonuses } from '../../model/item';
import { rollAffixes } from './rollAffixes';

export interface CraftedItemRequest {
  itemId: string;
  baseId: string;
  tier: number;
  setMaterialId: string | null;
  itemLevel: number;
  upgradeLevel: number;
  craftingCostCopper: number;
  ingredientCount: number;
  // A dropped item has a fixed quality. A crafted item rolls it.
  quality?: CraftableQuality;
}

type CraftableQuality = 'common' | 'uncommon' | 'magic' | 'rare';

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

// The cost is the ingredients plus the crafter fee. Every ingredient adds copper on top of it, so a craft that eats more material earns more.
// A better quality multiplies that price, every affix adds a flat amount, and every item adds a small flat amount, so a rolled item sells for clearly more but not for double.
// The item level adds nothing of its own: the crafter fee already grows with the recipe level. Only an upgrade level adds a small share.
function computeSellValue(craftingCostCopper: number, ingredientCount: number, quality: CraftableQuality, affixCount: number, upgradeLevel: number): number {
  const upgradeFactor = 1 + SELL_GROWTH_PER_UPGRADE_LEVEL * upgradeLevel;
  const materialsAndQualityCopper = (craftingCostCopper + SELL_ADDED_VALUE_COPPER_PER_INGREDIENT * ingredientCount) * SELL_QUALITY_FACTOR[quality];
  return Math.max(1, Math.round((materialsAndQualityCopper + SELL_ADDED_VALUE_COPPER_PER_AFFIX * affixCount + SELL_ADDED_VALUE_COPPER_PER_ITEM) * upgradeFactor));
}

export function generateCraftedItem(request: CraftedItemRequest, random: Random): Item {
  const base = requireById(BASE_ITEMS, request.baseId);
  const { itemLevel } = request;

  const mainMaterial = MATERIALS.find((material) => material.tier === request.tier && material.category === base.mainCategory);
  if (!mainMaterial) throw new Error(`Tier ${request.tier} has no ${base.mainCategory} material for ${base.id}`);

  const setMaterial = request.setMaterialId === null ? undefined : requireById(MATERIALS, request.setMaterialId);
  const quality = request.quality ?? rollQuality(random);
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
    sellValueCopper: computeSellValue(request.craftingCostCopper, request.ingredientCount, quality, affixes.length, request.upgradeLevel),
  };
}

export function previewBaseStatRanges(baseId: string, itemLevel: number): Record<string, [number, number]> {
  const base = requireById(BASE_ITEMS, baseId);
  const levelFactor = 1 + BASE_STAT_GROWTH_PER_ITEM_LEVEL * (itemLevel - 1);
  const ranges: Record<string, [number, number]> = {};
  for (const [stat, value] of Object.entries(base.baseStats) as Array<[string, number]>) {
    if (UNSCALED_BASE_STATS.includes(stat)) {
      ranges[stat] = [value, value];
      continue;
    }
    const lowest = value * levelFactor * (1 - BASE_STAT_SPREAD_FRACTION);
    const highest = value * levelFactor * (1 + BASE_STAT_SPREAD_FRACTION);
    ranges[stat] = [Math.max(1, Math.round(lowest)), Math.max(1, Math.round(highest))];
  }
  return ranges;
}
