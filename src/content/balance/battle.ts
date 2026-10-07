import data from '../../../data/balance/battle.json';

export const MAXIMUM_BATTLE_SECONDS = data.maximumBattleSeconds;

export const BASE_CRITICAL_CHANCE = data.baseCriticalChance;
export const CRITICAL_DAMAGE_MULTIPLIER = data.criticalDamageMultiplier;
export const MAXIMUM_CRITICAL_CHANCE = data.maximumCriticalChance;

// The attack speed pool is 1 + bonus. It never goes below this, so the attack time stays finite.
export const MINIMUM_ATTACK_SPEED_FACTOR = data.minimumAttackSpeedFactor;
export const MONSTER_DAMAGE_VARIANCE_FRACTION = data.monsterDamageVarianceFraction;

export const HEAL_BELOW_HEALTH_FRACTION = data.healBelowHealthFraction;
export const HEAL_POWER_MULTIPLIER = data.healPowerMultiplier;
export const LOG_TIME_MARKER_SECONDS = data.logTimeMarkerSeconds;
export const BURN_TICK_SECONDS = data.burnTickSeconds;
