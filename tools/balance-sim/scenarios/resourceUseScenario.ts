import { DUNGEONS } from '../../../src/content/dungeons';
import { requireById } from '../../../src/content/lookup';
import { measureSoloHero } from './measureBattles';
import { dungeonOfNormalMonsters } from './normalMonsterDungeon';
import { RESOURCE_USE_PRESET } from './presets';
import { printTable } from './table';

export function runResourceUseScenario(): void {
  const preset = RESOURCE_USE_PRESET;
  const levels = Array.from({ length: preset.lastLevel - preset.firstLevel + 1 }, (_, index) => preset.firstLevel + index);
  const normalFights = levels.map((level) => preset.classIds.map((classId) => measureSoloHero(classId, level, dungeonOfNormalMonsters(level), preset.battlesPerCase, preset.seed)));
  const [lowTargetFirst, highTargetFirst] = preset.targetLowestResourcePercentAtLevel[String(preset.firstLevel)] ?? [0, 0];
  const [lowTargetLast, highTargetLast] = preset.targetLowestResourcePercentAtLevel[String(preset.lastLevel)] ?? [0, 0];
  console.log(`\nResource use: ${preset.description}`);
  console.log(`Target: the pool dips to ${lowTargetFirst}-${highTargetFirst}% at level ${preset.firstLevel} and ${lowTargetLast}-${highTargetLast}% at level ${preset.lastLevel}, in a normal fight.`);
  printTable('Lowest point of the pool in one normal fight, percent of the maximum (average)', ['Level', ...preset.classIds], levels.map((level, row) => [level, ...normalFights[row]!.map((fight) => fight.averageLowestResourcePercent)]));
  printTable('Average level of the pool during one normal fight, percent', ['Level', ...preset.classIds], levels.map((level, row) => [level, ...normalFights[row]!.map((fight) => fight.averageResourcePercent)]));
  printTable('Spells cast in one normal fight (average)', ['Level', ...preset.classIds], levels.map((level, row) => [level, ...normalFights[row]!.map((fight) => fight.averageSpellsCast.toFixed(1))]));

  const bossDungeon = requireById(DUNGEONS, preset.bossDungeonId);
  const bossRows = preset.bossHeroLevels.flatMap((level) =>
    preset.classIds.map((classId) => {
      const fight = measureSoloHero(classId, level, bossDungeon, preset.battlesPerCase, preset.seed);
      return [level, classId, `${fight.averageLowestResourcePercent}%`, `${fight.averageResourcePercent}%`, fight.averageSpellsCast.toFixed(1), `${fight.winRatePercent}%`];
    }),
  );
  printTable(`Boss fight: ${bossDungeon.name}`, ['Hero lvl', 'Class', 'Lowest pool', 'Average pool', 'Spells cast', 'Win rate'], bossRows);
}
