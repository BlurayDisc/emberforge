import { monsterStatsAtLevel } from '../../../src/content/balance/monsterScaling';
import { dungeonForLevel } from '../economy';
import type { GearRule } from './bestEquippableGear';
import { measureSoloHero } from './measureBattles';
import { FIRST_FIGHT_PRESET } from './presets';
import { printTable } from './table';

function targetBandText(band: readonly number[] | undefined): string {
  return band ? band.join('-') : '-';
}

export function runFirstFightScenario(): void {
  const preset = FIRST_FIGHT_PRESET;
  const levels = Array.from({ length: preset.lastLevel - preset.firstLevel + 1 }, (_, index) => preset.firstLevel + index);
  console.log(`\nFirst fight: ${preset.description}`);
  for (const gearState of preset.gearStates) {
    const measurements = levels.map((level) => {
      const gearRule: GearRule = { slots: level <= gearState.weaponOnlyUpToLevel ? ['mainHand'] : ['mainHand', 'offHand', 'helm', 'armour', 'gloves', 'legs', 'boots', 'belt', 'amulet', 'ring'], quality: gearState.quality };
      const dungeon = { ...dungeonForLevel(level), level, rareMonsterId: null };
      return preset.classIds.map((classId) => measureSoloHero(classId, level, dungeon, preset.battlesPerCase, preset.seed, gearRule));
    });
    const averagedColumns = preset.classIds.flatMap((classId, column) => (preset.averagedClassIds.includes(classId) ? [column] : []));
    const averageOf = (values: number[]): number => values.reduce((sum, value) => sum + value, 0) / values.length;
    console.log(`\nGear state: ${gearState.name}. ${gearState.description}`);
    printTable('Health lost in percent (average of the baseline classes in the last column)', ['Level', ...preset.classIds, 'Baseline average', 'Target'], levels.map((level, row) => [level, ...measurements[row]!.map((measurement) => measurement.healthLostPercent), averageOf(averagedColumns.map((column) => measurements[row]![column]!.healthLostPercent)).toFixed(1), targetBandText(gearState.targetHealthLostPercentByLevel[String(level)])]));
    printTable('Seconds to kill the monster (fights won)', ['Level', ...preset.classIds], levels.map((level, row) => [level, ...measurements[row]!.map((measurement) => (measurement.averageSecondsOfWins === null ? '-' : measurement.averageSecondsOfWins.toFixed(1)))]));
    printTable('Win rate in percent', ['Level', ...preset.classIds], levels.map((level, row) => [level, ...measurements[row]!.map((measurement) => measurement.winRatePercent)]));
  }
  printTable('Normal monster curve', ['Level', 'HP', 'Damage', 'Armour', 'Resistance', 'HP / damage'], levels.map((level) => {
    const stats = monsterStatsAtLevel(level);
    return [level, stats.hp, stats.damage, stats.armour, stats.resistance, (stats.hp / stats.damage).toFixed(1)];
  }));
}
