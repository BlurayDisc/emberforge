import type { UnitRank } from '../../model/battle';

export const LEVEL_CAP = 100;

export const EXPERIENCE_TO_NEXT_LEVEL_BASE = 40;
export const EXPERIENCE_TO_NEXT_LEVEL_EXPONENT = 1.5;

export const KILLS_PER_LEVEL_BASE = 10;
export const KILLS_PER_LEVEL_GROWTH = 0.15;

export const LEVEL_GAP_STEP = 0.1;
export const LEVEL_GAP_FACTOR_MINIMUM = 0.05;
export const LEVEL_GAP_FACTOR_MAXIMUM = 1.5;

export const EXPERIENCE_RANK_MULTIPLIER: Record<UnitRank, number> = {
  hero: 0,
  normal: 1,
  rare: 5,
  boss: 20,
};
