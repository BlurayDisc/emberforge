import type { ItemQuality } from '../../model/item';

type CraftableQuality = Exclude<ItemQuality, 'unique'>;

export const QUALITY_WEIGHTS_WITHOUT_CATALYST: Record<CraftableQuality, number> = { common: 55, magic: 35, rare: 10 };
export const QUALITY_WEIGHTS_WITH_CATALYST: Record<CraftableQuality, number> = { common: 25, magic: 45, rare: 30 };
export const CATALYST_MATERIAL_ID = 'tarnished-catalyst';

export const LEVELS_PER_BRACKET = 10;
export const ITEM_LEVEL_ABOVE_HIGHEST_HERO = 0;
export const ITEM_LEVEL_ROLLS_KEEP_HIGHEST = 2;

export const BASE_STAT_GROWTH_PER_ITEM_LEVEL = 0.12;
export const BASE_STAT_SPREAD_FRACTION = 0.15;
export const AFFIX_GROWTH_PER_ITEM_LEVEL = 0.1;

export const MAGIC_AFFIX_COUNTS: readonly number[] = [1, 2];
export const RARE_AFFIX_COUNTS: readonly number[] = [3, 4];
export const MAXIMUM_AFFIXES_PER_KIND_MAGIC = 1;
export const MAXIMUM_AFFIXES_PER_KIND_RARE = 2;

export const SELL_QUALITY_FACTOR: Record<ItemQuality, number> = { common: 1, magic: 2, rare: 4, unique: 10 };
export const SELL_GROWTH_PER_ITEM_LEVEL = 0.1;

export const MAIN_INGREDIENT_CELLS_PER_UNIT = 2;
export const LARGE_ITEM_CELL_THRESHOLD = 6;
export const SECONDARY_INGREDIENT_SMALL_ITEM = 1;
export const SECONDARY_INGREDIENT_LARGE_ITEM = 2;

export const RARE_NAME_FIRST_PARTS: readonly string[] = [
  'Grim', 'Doom', 'Storm', 'Ash', 'Dread', 'Iron', 'Night', 'Blood', 'Wrath', 'Gloom',
];
export const RARE_NAME_SECOND_PARTS: readonly string[] = [
  'Bite', 'Song', 'Edge', 'Ward', 'Grip', 'Mark', 'Veil', 'Spire', 'Thorn', 'Coil',
];
