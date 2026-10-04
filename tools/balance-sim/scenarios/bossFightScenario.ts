import { DUNGEONS } from '../../../src/content/dungeons';
import { requireById } from '../../../src/content/lookup';
import { measureSoloHero } from './measureBattles';
import { BOSS_FIGHT_PRESET } from './presets';
import { printTable } from './table';

export function runBossFightScenario(): void {
  const preset = BOSS_FIGHT_PRESET;
  const dungeon = requireById(DUNGEONS, preset.dungeonId);
  const rows = preset.heroLevels.flatMap((heroLevel) =>
    preset.classIds.map((classId) => {
      const measurement = measureSoloHero(classId, heroLevel, dungeon, preset.battlesPerCase, preset.seed);
      const meetsWinRate = measurement.winRatePercent >= preset.targetWinRatePercent;
      return [
        heroLevel,
        classId,
        `${measurement.winRatePercent}%`,
        measurement.averageSecondsOfWins === null ? '-' : measurement.averageSecondsOfWins.toFixed(1),
        measurement.averageSecondsOfAllFights.toFixed(1),
        `${measurement.healthLostPercent}%`,
        meetsWinRate ? 'ok' : `below ${preset.targetWinRatePercent}%`,
      ];
    }),
  );
  console.log(`\nBoss fight: ${preset.description} Target: win rate ${preset.targetWinRatePercent}%, about ${preset.targetSeconds} s.`);
  printTable(`${dungeon.name}, ${preset.battlesPerCase} fights for each case`, ['Hero lvl', 'Class', 'Win rate', 'Seconds (won)', 'Seconds (all)', 'HP lost', 'Check'], rows);
}
