import type { ClassId } from '../../../src/model/hero';
import type { UnitRank } from '../../../src/model/battle';
import type { GearFloorProfile } from './bestEquippableGear';
import bossFightData from '../presets/boss-fight.json';
import economyData from '../presets/economy.json';
import experienceCurveData from '../presets/experience-curve.json';
import mobKillTimeData from '../presets/mob-kill-time.json';
import resourceUseData from '../presets/resource-use.json';

export interface EconomyPreset {
  description: string;
  // The share of the crafted income that the spells of one hero may take at each level. The rest pays for hiring and the Bank.
  spellBudgetPercent: number;
  firstLevel: number;
  lastLevel: number;
  games: number;
  firstSeed: number;
}

export interface ExperienceCurvePreset {
  description: string;
  firstLevel: number;
  lastLevel: number;
  // The monster levels that exist in the game. Each one is a column of the tables.
  monsterLevels: number[];
  ranks: UnitRank[];
  targetKillsAtMatchingLevel: { firstLevel: [number, number]; lastLevels: [number, number] };
}

export interface MobKillTimePreset {
  description: string;
  firstLevel: number;
  lastLevel: number;
  classIds: ClassId[];
  // "hero-level": the monsters have the hero level. "dungeon-level": they keep the level of their dungeon.
  monsterLevelRule: 'hero-level' | 'dungeon-level';
  battlesPerCase: number;
  seed: number;
  targetSecondsByLevel: Record<string, number>;
}

export interface BossFightPreset {
  description: string;
  dungeonId: string;
  heroLevels: number[];
  partnerLevels: number[];
  classIds: ClassId[];
  partnerClassIds: ClassId[];
  battlesPerCase: number;
  seed: number;
  targetSeconds: number;
  targetWinRatePercent: number;
  // When set, each hero wears Common gear plus this many prefixed items. When null, the gear is crafted at the normal quality odds.
  gearFloor: GearFloorProfile | null;
}

export interface ResourceUsePreset {
  description: string;
  firstLevel: number;
  lastLevel: number;
  classIds: ClassId[];
  battlesPerCase: number;
  seed: number;
  bossDungeonId: string;
  bossHeroLevels: number[];
  // The lowest point the pool should reach in a fight against a normal monster, as a range in percent, at the first and the last level.
  targetLowestResourcePercentAtLevel: Record<string, number[]>;
}

export const ECONOMY_PRESET = economyData as EconomyPreset;
export const EXPERIENCE_CURVE_PRESET = experienceCurveData as ExperienceCurvePreset;
export const MOB_KILL_TIME_PRESET = mobKillTimeData as MobKillTimePreset;
export const BOSS_FIGHT_PRESET = bossFightData as BossFightPreset;
export const RESOURCE_USE_PRESET = resourceUseData as ResourceUsePreset;
