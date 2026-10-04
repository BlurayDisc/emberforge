import type { ClassId } from '../../../src/model/hero';
import type { UnitRank } from '../../../src/model/battle';
import bossFightData from '../presets/boss-fight.json';
import economyData from '../presets/economy.json';
import experienceCurveData from '../presets/experience-curve.json';
import mobKillTimeData from '../presets/mob-kill-time.json';

export interface EconomyPreset {
  description: string;
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
  classIds: ClassId[];
  battlesPerCase: number;
  seed: number;
  targetSeconds: number;
  targetWinRatePercent: number;
}

export const ECONOMY_PRESET = economyData as EconomyPreset;
export const EXPERIENCE_CURVE_PRESET = experienceCurveData as ExperienceCurvePreset;
export const MOB_KILL_TIME_PRESET = mobKillTimeData as MobKillTimePreset;
export const BOSS_FIGHT_PRESET = bossFightData as BossFightPreset;
