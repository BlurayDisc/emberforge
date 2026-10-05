import data from '../../../data/balance/items.json';

export const QUALITY_WEIGHTS = data.qualityWeights;
export const CATALYST_MATERIAL_ID = data.catalystMaterialId;

export const LEVELS_PER_BRACKET = data.levelsPerBracket;

export const BASE_STAT_GROWTH_PER_ITEM_LEVEL = data.baseStatGrowthPerItemLevel;
export const BASE_STAT_SPREAD_FRACTION = data.baseStatSpreadFraction;
export const UNSCALED_BASE_STATS: readonly string[] = data.unscaledBaseStats;
export const AFFIX_GROWTH_PER_ITEM_LEVEL = data.affixGrowthPerItemLevel;


export const SELL_ADDED_VALUE_COPPER_PER_INGREDIENT = data.sellAddedValueCopperPerIngredient;
export const SELL_ADDED_VALUE_COPPER_PER_ITEM = data.sellAddedValueCopperPerItem;
export const SELL_ADDED_VALUE_COPPER_PER_AFFIX = data.sellAddedValueCopperPerAffix;
export const AFFIX_RULES_BY_QUALITY: Record<'uncommon' | 'magic' | 'rare', { counts: number[]; maximumPerKind: number }> = data.affixRulesByQuality;
export const SELL_QUALITY_FACTOR: Record<'common' | 'uncommon' | 'magic' | 'rare', number> = data.sellQualityFactor;
export const SELL_GROWTH_PER_UPGRADE_LEVEL = data.sellGrowthPerUpgradeLevel;

export const LARGE_ITEM_CELL_THRESHOLD = data.largeItemCellThreshold;
export const SET_MATERIAL_SMALL_ITEM = data.setMaterialSmallItem;
export const SET_MATERIAL_LARGE_ITEM = data.setMaterialLargeItem;
export const SET_RECIPE_SLOTS: readonly string[] = data.setRecipeSlots;

export const RARE_NAME_FIRST_PARTS: readonly string[] = data.rareNameFirstParts;
export const RARE_NAME_SECOND_PARTS: readonly string[] = data.rareNameSecondParts;
