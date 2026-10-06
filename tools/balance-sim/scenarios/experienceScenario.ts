import { experienceForKill, experienceToNextLevel } from '../../../src/systems/progression';
import { dungeonForLevel } from '../economy';
import { EXPERIENCE_CURVE_PRESET } from './presets';
import { printLevelUpOvershoot } from './levelUpOvershoot';
import { printTable } from './table';

export function runExperienceScenario(): void {
  const preset = EXPERIENCE_CURVE_PRESET;
  const levels = Array.from({ length: preset.lastLevel - preset.firstLevel + 1 }, (_, index) => preset.firstLevel + index);
  const [firstLow, firstHigh] = preset.targetKillsAtMatchingLevel.firstLevel;
  const [lastLow, lastHigh] = preset.targetKillsAtMatchingLevel.lastLevels;
  console.log(`\nExperience: ${preset.description}`);
  console.log(`Target for the best dungeon: ${firstLow}-${firstHigh} kills in the first levels, ${lastLow}-${lastHigh} kills in the last levels.`);

  printTable(
    'Kills of a normal monster for one level, in the best dungeon without a boss that the hero can enter',
    ['Hero lvl', 'Dungeon', 'Mob lvl', 'XP of a kill', 'XP needed', 'Kills'],
    levels.map((heroLevel) => {
      const dungeon = dungeonForLevel(heroLevel);
      const killExperience = experienceForKill(dungeon.level, heroLevel, 'normal');
      return [heroLevel, dungeon.name, dungeon.level, killExperience, experienceToNextLevel(heroLevel), (experienceToNextLevel(heroLevel) / killExperience).toFixed(1)];
    }),
  );

  const monsterColumns = preset.monsterLevels.map((level) => `Mob ${level}`);
  for (const rank of preset.ranks) {
    printTable(
      `Kills of a ${rank} monster for one level (average kills, because XP carries over; rows: hero level, columns: monster level)`,
      ['Hero lvl', 'XP needed', ...monsterColumns],
      levels.map((heroLevel) => [
        heroLevel,
        experienceToNextLevel(heroLevel),
        ...preset.monsterLevels.map((monsterLevel) => (monsterLevel > heroLevel ? '-' : Math.round(experienceToNextLevel(heroLevel) / experienceForKill(monsterLevel, heroLevel, rank)))),
      ]),
    );
  }

  printTable(
    'XP of one normal kill (rows: hero level, columns: monster level)',
    ['Hero lvl', ...monsterColumns],
    levels.map((heroLevel) => [heroLevel, ...preset.monsterLevels.map((monsterLevel) => (monsterLevel > heroLevel ? '-' : experienceForKill(monsterLevel, heroLevel, 'normal')))]),
  );

  printLevelUpOvershoot(preset);
}
