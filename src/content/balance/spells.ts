import data from '../../../data/balance/spells.json';
import type { CurveAnchor } from '../../kernel/math';

export const NORMAL_SPELL_SLOT_COUNT = data.normalSlotCount;
// The price of a spell by its unlock level, as points on a curve. The curve goes on beyond the last point.
export const SPELL_LEARN_COST_CURVE: readonly CurveAnchor[] = data.learnCostAnchors.map(({ level, copper }) => ({ x: level, y: copper }));
export const ULTIMATE_LEARN_COST_FACTOR = data.ultimateCostFactor;
export const ULTIMATE_OPENING_DELAY_SECONDS = data.ultimateOpeningDelaySeconds;
export const HEAL_SPELL_CAST_BELOW_HEALTH_FRACTION = data.healCastBelowHealthFraction;
