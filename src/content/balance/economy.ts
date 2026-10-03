import data from '../../../data/balance/economy.json';
import type { UnitRank } from '../../model/battle';

export const COPPER_PER_SILVER = data.copperPerSilver;
export const SILVER_PER_GOLD = data.silverPerGold;

export const MAXIMUM_COMPANY_SIZE = data.maximumCompanySize;
export const MAXIMUM_PARTY_SIZE = data.maximumPartySize;

export const HERO_HIRE_COST_BY_COMPANY_SIZE: readonly number[] = data.heroHireCostByCompanySize;

export const COPPER_DROP_BASE = data.copperDropBase;
export const COPPER_DROP_PER_LEVEL = data.copperDropPerLevel;
export const COPPER_DROP_SPREAD_FRACTION = data.copperDropSpreadFraction;

export const COPPER_DROP_RANK_MULTIPLIER: Record<UnitRank, number> = data.copperDropRankMultiplier;
