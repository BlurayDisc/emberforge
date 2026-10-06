import { DUNGEONS } from '../../../src/content/dungeons';
import { createRandom } from '../../../src/kernel/random';
import { createEncounter } from '../../../src/systems/dungeons';
import { experienceForKill, experienceToNextLevel } from '../../../src/systems/progression';
import { dungeonForLevel } from '../economy';
import type { ExperienceCurvePreset } from './presets';
import { printTable } from './table';

const LEVEL_ONE_DUNGEONS = DUNGEONS.filter((dungeon) => dungeon.level === 1 && dungeon.bossMonsterId === null);

// The experience left after each level-up, as a share of the bar of the new level, for one solo hero played from level 1 to the last level.
function leftoverSharesByLevel(seed: number, lastLevel: number, levelOneDungeonFightShare: number): Map<number, number> {
  const random = createRandom(seed);
  const leftoverShares = new Map<number, number>();
  let level = 1;
  let experience = 0;
  for (let fightNumber = 0; level < lastLevel; fightNumber++) {
    const dungeon = random.fork(`dungeon-${fightNumber}`).chance(levelOneDungeonFightShare) ? LEVEL_ONE_DUNGEONS[fightNumber % LEVEL_ONE_DUNGEONS.length]! : dungeonForLevel(level);
    for (const monster of createEncounter(dungeon, 1, random.fork(`encounter-${fightNumber}`))) experience += experienceForKill(monster.level, level, monster.rank);
    while (experience >= experienceToNextLevel(level) && level < lastLevel) {
      experience -= experienceToNextLevel(level);
      level += 1;
      leftoverShares.set(level, experience / experienceToNextLevel(level));
    }
  }
  return leftoverShares;
}

export function printLevelUpOvershoot(preset: ExperienceCurvePreset): void {
  const overshoot = preset.levelUpOvershoot;
  console.log(`\nLevel-up overshoot: ${overshoot.description}`);
  for (const share of overshoot.levelOneDungeonFightShares) {
    const games = Array.from({ length: overshoot.games }, (_, index) => leftoverSharesByLevel(overshoot.firstSeed + index, preset.lastLevel, share));
    const rows = Array.from({ length: preset.lastLevel - 1 }, (_, index) => {
      const level = index + 2;
      const leftovers = games.map((game) => game.get(level)! * 100);
      const percentOnLine = (leftovers.filter((leftover) => leftover < overshoot.landsOnLineBelowPercent).length / leftovers.length) * 100;
      const averageLeftover = leftovers.reduce((sum, leftover) => sum + leftover, 0) / leftovers.length;
      return [level, averageLeftover.toFixed(1), percentOnLine.toFixed(0), percentOnLine <= overshoot.maximumPercentOfLevelUpsOnLine ? 'ok' : 'lands on the line'];
    });
    printTable(`${Math.round(share * 100)}% of the fights in the level 1 dungeons: the experience left on the bar of the new level`, ['New level', 'Average left (% of bar)', 'Level-ups on the line (%)', 'Check'], rows);
  }
}
