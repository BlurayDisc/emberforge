import type { ClassId } from '../../../src/model/hero';
import type { ItemSlot } from '../../../src/model/item';
import type { UnitRank } from '../../../src/model/battle';
import type { GearFloorProfile } from './bestEquippableGear';
import crafterCurveData from '../presets/crafter-curve.json';
import bossFightData from '../presets/boss-fight.json';
import economyData from '../presets/economy.json';
import experienceCurveData from '../presets/experience-curve.json';
import firstFightData from '../presets/first-fight.json';
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
  levelUpOvershoot: {
    description: string;
    // Each share is a case: the part of the hero fights that are in the level 1 dungeons. The rest are in the best dungeon the hero may enter.
    levelOneDungeonFightShares: number[];
    games: number;
    firstSeed: number;
    landsOnLineBelowPercent: number;
    maximumPercentOfLevelUpsOnLine: number;
  };
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

export interface FirstFightPreset {
  description: string;
  firstLevel: number;
  lastLevel: number;
  classIds: ClassId[];
  averagedClassIds: ClassId[];
  battlesPerCase: number;
  seed: number;
  // Up to this hero level only the main hand weapon is worn. Above it, every slot is worn.
  // Each gear state has its own target band of health lost, one entry for each level.
  gearStates: { name: string; description: string; weaponOnlyUpToLevel: number; quality: 'common' | 'uncommon' | 'magic' | 'rare'; targetHealthLostPercentByLevel: Record<string, number[]> }[];
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
  averagedClassIds: ClassId[];
  targetSeconds: number;
  gearStates: BossGearState[];
}

export interface BossGearState {
  name: string;
  description: string;
  // 1 is the strong hero alone. 2 adds the partner.
  partySize: 1 | 2;
  // When set, each hero wears Common gear plus this many prefixed items. When null, the gear is crafted at the normal quality odds.
  gearFloor: GearFloorProfile | null;
  // When set, each hero wears only these slots at this quality (an empty list is no gear).
  slots: ItemSlot[] | null;
  quality: 'common' | 'uncommon' | 'magic' | 'rare' | null;
  targetWinRatePercent: [number, number];
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

export interface CrafterCurvePreset {
  description: string;
  firstLevel: number;
  lastLevel: number;
  professionIds: string[];
  // Fights in one level 1 dungeon before the player crafts, each time the crafter is below the hero level.
  basicFightsPerRound: number;
  // The share of all fights in the level 1 dungeons that keeps the crafter level with the hero: lowest and highest allowed.
  basicFightShareRange: [number, number];
  games: number;
  firstSeed: number;
}

export const ECONOMY_PRESET = economyData as EconomyPreset;
export const CRAFTER_CURVE_PRESET = crafterCurveData as CrafterCurvePreset;
export const EXPERIENCE_CURVE_PRESET = experienceCurveData as ExperienceCurvePreset;
export const MOB_KILL_TIME_PRESET = mobKillTimeData as MobKillTimePreset;
export const FIRST_FIGHT_PRESET = firstFightData as FirstFightPreset;
export const BOSS_FIGHT_PRESET = bossFightData as BossFightPreset;
export const RESOURCE_USE_PRESET = resourceUseData as ResourceUsePreset;
