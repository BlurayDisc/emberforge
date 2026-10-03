import data from '../../../data/balance/progression.json';
import type { UnitRank } from '../../model/battle';

export const LEVEL_CAP = data.levelCap;

export const EXPERIENCE_TO_NEXT_LEVEL_BASE = data.experienceToNextLevelBase;
export const EXPERIENCE_TO_NEXT_LEVEL_EXPONENT = data.experienceToNextLevelExponent;

export const KILLS_PER_LEVEL_BASE = data.killsPerLevelBase;
export const KILLS_PER_LEVEL_GROWTH = data.killsPerLevelGrowth;

export const LEVEL_GAP_STEP = data.levelGapStep;
export const LEVEL_GAP_FACTOR_MINIMUM = data.levelGapFactorMinimum;
export const LEVEL_GAP_FACTOR_MAXIMUM = data.levelGapFactorMaximum;
export const EARLY_EXPERIENCE_BONUS = data.earlyExperienceBonus;
export const EARLY_EXPERIENCE_FADE_LEVELS = data.earlyExperienceFadeLevels;

export const EXPERIENCE_RANK_MULTIPLIER: Record<UnitRank, number> = data.experienceRankMultiplier;
