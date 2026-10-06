import data from '../../../data/balance/crafting.json';

export const CRAFTING_MAXIMUM_LEVEL = data.maximumLevel;
export const CRAFTING_EXPERIENCE_TO_NEXT_BASE = data.experienceToNextBase;
export const CRAFTING_EXPERIENCE_TO_NEXT_EXPONENT = data.experienceToNextExponent;
export const CRAFTING_EXPERIENCE_PER_MATERIAL_BASE = data.experiencePerMaterialBase;
export const CRAFTING_EXPERIENCE_PER_MATERIAL_PER_REQUIRED_LEVEL = data.experiencePerMaterialPerRequiredLevel;
export const CRAFTING_LEVEL_GAP_STEP = data.levelGapStep;
export const CRAFTING_LEVEL_GAP_FACTOR_MINIMUM = data.levelGapFactorMinimum;
export const CRAFT_SECONDS_BASE = data.craftSecondsBase;
export const CRAFT_SECONDS_PER_REQUIRED_LEVEL = data.craftSecondsPerRequiredLevel;
export const CRAFT_FEE_BASE_COPPER = data.craftFeeBaseCopper;
export const CRAFT_FEE_PER_REQUIRED_LEVEL_COPPER = data.craftFeePerRequiredLevelCopper;
export const UPGRADE_MAXIMUM_LEVEL = data.upgradeMaximumLevel;
export const UPGRADE_CHANCE_AT_RECIPE_LEVEL: readonly number[] = data.upgradeChanceAtRecipeLevel;
export const UPGRADE_CHANCE_FAR_ABOVE_RECIPE: readonly number[] = data.upgradeChanceFarAboveRecipe;
export const UPGRADE_FAR_ABOVE_LEVELS = data.upgradeFarAboveLevels;
