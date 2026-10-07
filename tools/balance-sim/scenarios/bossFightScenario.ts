import { DUNGEONS } from '../../../src/content/dungeons';
import { requireById } from '../../../src/content/lookup';
import { measureParty } from './measurePartyBattles';
import { BOSS_FIGHT_PRESET, type BossGearState } from './presets';
import { printTable } from './table';

const averageOf = (values: number[]): number => values.reduce((sum, value) => sum + value, 0) / values.length;

// The boss needs two heroes. The strong hero is each class at the hero level. The partner is a weaker hero of each class in turn.
// A row averages the win rate over the partner classes and also shows the worst partner class. A one-hero state has no partner.
export function runBossFightScenario(): void {
  const preset = BOSS_FIGHT_PRESET;
  console.log(`\nBoss fight: ${preset.description} Target length about ${preset.targetSeconds} s.`);
  for (const gearState of preset.gearStates) runGearState(gearState);
}

function runGearState(gearState: BossGearState): void {
  const preset = BOSS_FIGHT_PRESET;
  const dungeon = requireById(DUNGEONS, preset.dungeonId);
  const gearRule = gearState.slots === null ? null : { slots: gearState.slots, quality: gearState.quality };
  const partnerClassIds = gearState.partySize === 1 ? [null] : preset.partnerClassIds;
  const rows = preset.heroLevels.flatMap((heroLevel) =>
    preset.partnerLevels.flatMap((partnerLevel) =>
      preset.classIds.map((classId) => {
        const measurements = partnerClassIds.map((partnerClassId) => ({
          partnerClassId,
          ...measureParty(partnerClassId === null ? [{ classId, level: heroLevel }] : [{ classId, level: heroLevel }, { classId: partnerClassId, level: partnerLevel }], dungeon, preset.battlesPerCase, preset.seed, gearState.gearFloor, gearRule),
        }));
        const worst = measurements.reduce((lowest, measurement) => (measurement.winRatePercent < lowest.winRatePercent ? measurement : lowest));
        return {
          classId,
          winRate: averageOf(measurements.map((measurement) => measurement.winRatePercent)),
          worst: `${worst.winRatePercent}%${worst.partnerClassId === null ? '' : ` (${worst.partnerClassId})`}`,
          seconds: averageOf(measurements.map((measurement) => measurement.averageSecondsOfAllFights)),
          healthLost: averageOf(measurements.map((measurement) => measurement.healthLostPercent)),
        };
      }),
    ),
  );
  const [lowest, highest] = gearState.targetWinRatePercent;
  const baselineRows = rows.filter((row) => preset.averagedClassIds.includes(row.classId));
  const baselineWinRate = averageOf(baselineRows.map((row) => row.winRate));
  printTable(
    `${gearState.name}: ${gearState.description} (${preset.battlesPerCase} fights for each partner class)`,
    ['Class', 'Win rate (avg)', 'Worst partner', 'Seconds', 'HP lost'],
    rows.map((row) => [row.classId, `${Math.round(row.winRate)}%`, row.worst, row.seconds.toFixed(1), `${Math.round(row.healthLost)}%`]),
  );
  console.log(`Baseline classes (${preset.averagedClassIds.join(', ')}): win rate ${Math.round(baselineWinRate)}%, fight ${averageOf(baselineRows.map((row) => row.seconds)).toFixed(1)} s. Target ${lowest}-${highest}%: ${baselineWinRate >= lowest && baselineWinRate <= highest ? 'ok' : 'OUTSIDE'}. All classes: ${Math.round(averageOf(rows.map((row) => row.winRate)))}%.`);
}
