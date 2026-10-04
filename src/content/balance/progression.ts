import data from '../../../data/balance/progression.json';
import type { UnitRank } from '../../model/battle';

export const LEVEL_CAP = data.levelCap;
// The first clear of this dungeon ends the story so far, and the Victory screen opens.
export const VICTORY_DUNGEON_ID = data.victoryDungeonId;

// Absolute numbers for the first levels. Index 0 is level 1. The levels above the table follow the exponent.
export const EXPERIENCE_TO_NEXT_LEVEL_BY_LEVEL: readonly number[] = data.experienceToNextLevelByLevel;
export const EXPERIENCE_TO_NEXT_LEVEL_EXPONENT_AFTER_TABLE = data.experienceToNextLevelExponentAfterTable;
// One row for each hero level. Index 0 of a row is a monster of level 1.
export const NORMAL_KILL_EXPERIENCE_BY_HERO_LEVEL_THEN_MONSTER_LEVEL: readonly (readonly number[])[] = data.normalKillExperienceByHeroLevelThenMonsterLevel;

export const EXPERIENCE_RANK_MULTIPLIER: Record<UnitRank, number> = data.experienceRankMultiplier;
