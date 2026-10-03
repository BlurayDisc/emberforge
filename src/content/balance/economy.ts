import type { UnitRank } from '../../model/battle';

export const COPPER_PER_SILVER = 100;
export const SILVER_PER_GOLD = 100;

export const MAXIMUM_COMPANY_SIZE = 12;
export const MAXIMUM_PARTY_SIZE = 4;

export const HERO_HIRE_COST_BY_COMPANY_SIZE: readonly number[] = [
  0, 100, 300, 900, 2700, 8100, 24300, 72900, 218700, 656100, 1968300, 5904900,
];

export const COPPER_DROP_BASE = 3;
export const COPPER_DROP_PER_LEVEL = 2;
export const COPPER_DROP_SPREAD_FRACTION = 0.3;

export const COPPER_DROP_RANK_MULTIPLIER: Record<UnitRank, number> = {
  hero: 0,
  normal: 1,
  rare: 3,
  boss: 8,
};
