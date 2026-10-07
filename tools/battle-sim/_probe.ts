import { buildUnits, simulate, type GearState } from './battleSetup';
const [classId, level, creep, count, seed, gear] = process.argv.slice(2);
const setup = { heroes: [{ classId: classId as never, level: Number(level) }], gearState: (gear ?? 'common') as GearState, creepId: creep as string, creepLevel: Number(level), creepCount: Number(count), seed: Number(seed) };
const { heroUnits, creepUnits } = buildUnits(setup);
const report = simulate(heroUnits, creepUnits, setup.seed);
console.log('duration', report.durationSeconds, report.winner);
for (const e of report.actionEvents.slice(0, 14)) console.log(JSON.stringify(e));
for (const e of report.actionEvents.filter((x) => x.kind === 'death')) console.log(JSON.stringify(e));
