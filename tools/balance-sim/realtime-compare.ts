import { createRandom } from '../../src/kernel/random';
import type { BattleReport } from '../../src/model/battle';
import type { ClassId } from '../../src/model/hero';
import type { RealtimeBattleReport } from '../../src/model/realtimeBattle';
import { simulateBattle, simulateRealtimeBattle } from '../../src/systems/battle';
import { commonGearHeroUnit, normalMonsterUnit } from './realtimeFixtures';
import { printTable } from './scenarios/table';

const CLASS_IDS: readonly ClassId[] = ['warrior', 'archer', 'mage'];
const LEVELS = [1, 5, 10];
const BATTLES_PER_CASE = 300;

interface Measurement {
  wins: number;
  seconds: number;
  healthLost: number;
  firstDamageSeconds: number;
  meleeContactSeconds: number;
}

const emptyMeasurement = (): Measurement => ({ wins: 0, seconds: 0, healthLost: 0, firstDamageSeconds: 0, meleeContactSeconds: 0 });

function firstDamageSecondsOf(report: BattleReport): number {
  return report.events.find((event) => event.kind === 'attack' && !event.isDamageOverTime)?.timeSeconds ?? report.durationSeconds;
}

// The first moment when the two bodies are at melee reach of each other. A ranged hero may never come that close.
function meleeContactSecondsOf(report: RealtimeBattleReport): number {
  const [hero, monster] = report.tracks;
  const contactDistance = hero!.bodyRadius + monster!.bodyRadius + 0.3 + 0.05;
  const tick = hero!.x.findIndex((_, index) => Math.hypot(hero!.x[index]! - monster!.x[index]!, hero!.y[index]! - monster!.y[index]!) <= contactDistance);
  return (tick === -1 ? report.durationSeconds / report.tickSeconds : tick) * report.tickSeconds;
}

function add(total: Measurement, report: BattleReport, firstDamageSeconds: number, meleeContactSeconds: number): void {
  const hero = report.finalUnits.find((unit) => unit.side === 'party')!;
  total.wins += report.winner === 'party' ? 1 : 0;
  total.seconds += report.durationSeconds;
  total.healthLost += 1 - hero.hp / hero.maxHp;
  total.firstDamageSeconds += firstDamageSeconds;
  total.meleeContactSeconds += meleeContactSeconds;
}

function measure(classId: ClassId, level: number): { oldSim: Measurement; newSim: Measurement } {
  const oldSim = emptyMeasurement();
  const newSim = emptyMeasurement();
  const seedRandom = createRandom(2024);
  for (let battle = 0; battle < BATTLES_PER_CASE; battle++) {
    const random = seedRandom.fork(`battle-${battle}`);
    const hero = commonGearHeroUnit(classId, level, random);
    const monster = normalMonsterUnit(level, 'monster-0', battle);
    const oldReport = simulateBattle([{ ...hero }, { ...monster }], random.fork('battle'));
    add(oldSim, oldReport, firstDamageSecondsOf(oldReport), 0);
    const newReport = simulateRealtimeBattle([{ ...hero }, { ...monster }], random.fork('battle'));
    add(newSim, newReport, firstDamageSecondsOf(newReport), meleeContactSecondsOf(newReport));
  }
  return { oldSim, newSim };
}

const row = (total: Measurement): (string | number)[] => [
  `${Math.round((total.wins / BATTLES_PER_CASE) * 100)}%`,
  (total.seconds / BATTLES_PER_CASE).toFixed(1),
  `${Math.round((total.healthLost / BATTLES_PER_CASE) * 100)}%`,
  (total.firstDamageSeconds / BATTLES_PER_CASE).toFixed(1),
];

const rows: (string | number)[][] = [];
for (const classId of CLASS_IDS) {
  for (const level of LEVELS) {
    const { oldSim, newSim } = measure(classId, level);
    rows.push([`${classId} L${level}`, ...row(oldSim), ...row(newSim), (newSim.meleeContactSeconds / BATTLES_PER_CASE).toFixed(1)]);
  }
}
printTable(`First fight, Common gear, best spells, one normal monster of the hero level (${BATTLES_PER_CASE} seeds). old = turn sim, new = real-time sim`,
  ['Case', 'old win', 'old s', 'old HP lost', 'old 1st dmg s', 'new win', 'new s', 'new HP lost', 'new 1st dmg s', 'new contact s'], rows);
console.log('\n1st dmg s = seconds to the first hit. contact s = seconds until the bodies touch (a ranged hero often never lets the monster touch it before the monster dies, so its value is the fight length).');
