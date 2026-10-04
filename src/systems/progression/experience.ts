import {
  EXPERIENCE_RANK_MULTIPLIER,
  EXPERIENCE_TO_NEXT_LEVEL_BY_LEVEL,
  EXPERIENCE_TO_NEXT_LEVEL_EXPONENT_AFTER_TABLE,
  LEVEL_CAP,
  NORMAL_KILL_EXPERIENCE_BY_HERO_LEVEL_THEN_MONSTER_LEVEL,
} from '../../content/balance/progression';
import type { UnitRank } from '../../model/battle';
import type { Hero } from '../../model/hero';

const LAST_TABLE_LEVEL = EXPERIENCE_TO_NEXT_LEVEL_BY_LEVEL.length;

export function experienceToNextLevel(level: number): number {
  if (level <= LAST_TABLE_LEVEL) return EXPERIENCE_TO_NEXT_LEVEL_BY_LEVEL[level - 1]!;
  const lastTableValue = EXPERIENCE_TO_NEXT_LEVEL_BY_LEVEL[LAST_TABLE_LEVEL - 1]!;
  return Math.round(lastTableValue * (level / LAST_TABLE_LEVEL) ** EXPERIENCE_TO_NEXT_LEVEL_EXPONENT_AFTER_TABLE);
}

// The table holds the pay of a kill for each pair of hero level and monster level. A monster above the hero level pays like a monster of the hero level.
// Above the table, the hero uses the last row, scaled by how much more its level needs, so it needs the same number of kills.
function normalKillExperience(monsterLevel: number, heroLevel: number): number {
  const tableHeroLevel = Math.min(heroLevel, LAST_TABLE_LEVEL);
  const row = NORMAL_KILL_EXPERIENCE_BY_HERO_LEVEL_THEN_MONSTER_LEVEL[tableHeroLevel - 1]!;
  const payInTable = row[Math.min(monsterLevel, heroLevel, row.length) - 1]!;
  return payInTable * (experienceToNextLevel(heroLevel) / experienceToNextLevel(tableHeroLevel));
}

// A kill pays a number from the table. Nothing is worked out from a gap: a low monster pays little because its row says so.
export function experienceForKill(monsterLevel: number, heroLevel: number, monsterRank: UnitRank): number {
  return Math.max(1, Math.round(normalKillExperience(monsterLevel, heroLevel) * EXPERIENCE_RANK_MULTIPLIER[monsterRank]));
}

export function applyExperience(hero: Hero, gainedExperience: number): Hero {
  let level = hero.level;
  let experience = hero.experience + gainedExperience;
  while (level < LEVEL_CAP && experience >= experienceToNextLevel(level)) {
    experience -= experienceToNextLevel(level);
    level += 1;
  }
  if (level === LEVEL_CAP) experience = 0;
  return { ...hero, level, experience };
}
