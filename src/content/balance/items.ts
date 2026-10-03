import data from '../../../data/balance/items.json';

export const QUALITY_WEIGHTS_WITHOUT_CATALYST = data.qualityWeightsWithoutCatalyst;
export const QUALITY_WEIGHTS_WITH_CATALYST = data.qualityWeightsWithCatalyst;
export const CATALYST_MATERIAL_ID = data.catalystMaterialId;

export const LEVELS_PER_BRACKET = data.levelsPerBracket;
export const ITEM_LEVEL_ABOVE_HIGHEST_HERO = data.itemLevelAboveHighestHero;
export const ITEM_LEVEL_ROLLS_KEEP_HIGHEST = data.itemLevelRollsKeepHighest;

export const BASE_STAT_GROWTH_PER_ITEM_LEVEL = data.baseStatGrowthPerItemLevel;
export const BASE_STAT_SPREAD_FRACTION = data.baseStatSpreadFraction;
export const AFFIX_GROWTH_PER_ITEM_LEVEL = data.affixGrowthPerItemLevel;

export const MAGIC_AFFIX_COUNTS: readonly number[] = data.magicAffixCounts;
export const RARE_AFFIX_COUNTS: readonly number[] = data.rareAffixCounts;
export const MAXIMUM_AFFIXES_PER_KIND_MAGIC = data.maximumAffixesPerKindMagic;
export const MAXIMUM_AFFIXES_PER_KIND_RARE = data.maximumAffixesPerKindRare;

export const SELL_QUALITY_FACTOR: Record<'common' | 'magic' | 'rare' | 'unique', number> = data.sellQualityFactor;
export const SELL_GROWTH_PER_ITEM_LEVEL = data.sellGrowthPerItemLevel;

export const MAIN_INGREDIENT_CELLS_PER_UNIT = data.mainIngredientCellsPerUnit;
export const LARGE_ITEM_CELL_THRESHOLD = data.largeItemCellThreshold;
export const SECONDARY_INGREDIENT_SMALL_ITEM = data.secondaryIngredientSmallItem;
export const SECONDARY_INGREDIENT_LARGE_ITEM = data.secondaryIngredientLargeItem;

export const RARE_NAME_FIRST_PARTS: readonly string[] = data.rareNameFirstParts;
export const RARE_NAME_SECOND_PARTS: readonly string[] = data.rareNameSecondParts;
