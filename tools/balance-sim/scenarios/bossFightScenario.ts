import { DUNGEONS } from '../../../src/content/dungeons';
import { requireById } from '../../../src/content/lookup';
import { measureParty } from './measurePartyBattles';
import { BOSS_FIGHT_PRESET } from './presets';
import { printTable } from './table';

// The boss needs two heroes. The strong hero is each class at the hero level. The partner is a weaker hero of each class in turn.
// A row averages the win rate over the partner classes and also shows the worst partner class.
export function runBossFightScenario(): void {
  const preset = BOSS_FIGHT_PRESET;
  const dungeon = requireById(DUNGEONS, preset.dungeonId);
  const averageWinRates: number[] = [];
  const rows = preset.heroLevels.flatMap((heroLevel) =>
    preset.partnerLevels.flatMap((partnerLevel) =>
      preset.classIds.map((classId) => {
        const measurements = preset.partnerClassIds.map((partnerClassId) => ({
          partnerClassId,
          ...measureParty([{ classId, level: heroLevel }, { classId: partnerClassId, level: partnerLevel }], dungeon, preset.battlesPerCase, preset.seed),
        }));
        const averageWinRate = Math.round(measurements.reduce((sum, measurement) => sum + measurement.winRatePercent, 0) / measurements.length);
        const worst = measurements.reduce((lowest, measurement) => (measurement.winRatePercent < lowest.winRatePercent ? measurement : lowest));
        const averageSeconds = measurements.reduce((sum, measurement) => sum + measurement.averageSecondsOfAllFights, 0) / measurements.length;
        const averageHealthLost = Math.round(measurements.reduce((sum, measurement) => sum + measurement.healthLostPercent, 0) / measurements.length);
        averageWinRates.push(averageWinRate);
        return [
          heroLevel,
          partnerLevel,
          classId,
          `${averageWinRate}%`,
          `${worst.winRatePercent}% (${worst.partnerClassId})`,
          averageSeconds.toFixed(1),
          `${averageHealthLost}%`,
          averageWinRate >= preset.targetWinRatePercent ? 'ok' : `below ${preset.targetWinRatePercent}%`,
        ];
      }),
    ),
  );
  console.log(`\nBoss fight: ${preset.description} Target: win rate ${preset.targetWinRatePercent}%, about ${preset.targetSeconds} s.`);
  printTable(`${dungeon.name}, ${preset.battlesPerCase} fights for each partner class`, ['Hero lvl', 'Partner lvl', 'Class', 'Win rate (avg)', 'Worst partner', 'Seconds', 'HP lost', 'Check'], rows);
  const lowestAverage = Math.min(...averageWinRates);
  console.log(`Average win rate of all rows: ${Math.round(averageWinRates.reduce((sum, rate) => sum + rate, 0) / averageWinRates.length)}%. Lowest row: ${lowestAverage}%.`);
}
