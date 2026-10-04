import { DUNGEONS, type DungeonDefinition } from '../../../src/content/dungeons';
import { dungeonForLevel } from '../economy';
import { measureSoloHero } from './measureBattles';
import { MOB_KILL_TIME_PRESET } from './presets';
import { printTable } from './table';

// A normal monster only: the rare monster of the dungeon is left out.
function dungeonOfNormalMonsters(heroLevel: number): DungeonDefinition {
  const dungeon = dungeonForLevel(heroLevel);
  const monsterLevel = MOB_KILL_TIME_PRESET.monsterLevelRule === 'hero-level' ? heroLevel : dungeon.level;
  return { ...dungeon, level: monsterLevel, rareMonsterId: null };
}

export function runMobKillTimeScenario(): void {
  const preset = MOB_KILL_TIME_PRESET;
  const levels = Array.from({ length: preset.lastLevel - preset.firstLevel + 1 }, (_, index) => preset.firstLevel + index);
  const measurements = levels.map((level) => preset.classIds.map((classId) => measureSoloHero(classId, level, dungeonOfNormalMonsters(level), preset.battlesPerCase, preset.seed)));
  const targetSeconds = (level: number): string => String(preset.targetSecondsByLevel[String(level)] ?? '-');
  console.log(`\nMob kill time: ${preset.description} Monster level rule: ${preset.monsterLevelRule}. Monsters come from ${DUNGEONS.filter((dungeon) => dungeon.bossMonsterId === null).length} dungeons without a boss.`);
  printTable('Seconds to kill one monster (average of won fights)', ['Level', ...preset.classIds, 'Target'], levels.map((level, row) => [level, ...measurements[row]!.map((measurement) => (measurement.averageSecondsOfWins === null ? '-' : measurement.averageSecondsOfWins.toFixed(1))), targetSeconds(level)]));
  printTable('Win rate in percent', ['Level', ...preset.classIds], levels.map((level, row) => [level, ...measurements[row]!.map((measurement) => measurement.winRatePercent)]));
  printTable('Health lost in percent', ['Level', ...preset.classIds], levels.map((level, row) => [level, ...measurements[row]!.map((measurement) => measurement.healthLostPercent)]));
}
