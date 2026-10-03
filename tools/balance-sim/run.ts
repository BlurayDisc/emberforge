import { DUNGEONS, type DungeonDefinition } from '../../src/content/dungeons';
import { createRandom } from '../../src/kernel/random';
import type { ClassId, Hero } from '../../src/model/hero';
import { simulateBattle } from '../../src/systems/battle';
import { createEncounter } from '../../src/systems/dungeons';
import { heroToBattleUnit } from '../../src/systems/stats';

const BATTLES_PER_CASE = 300;
const SHORT_FIGHT_SECONDS_AT_LEVEL_ONE = 7;
const SECONDS_ADDED_PER_LEVEL = 0.535;

interface PartyCase {
  label: string;
  classIds: readonly ClassId[];
}

const PARTY_CASES: readonly PartyCase[] = [
  { label: 'solo warrior', classIds: ['warrior'] },
  { label: 'duo warrior+priest', classIds: ['warrior', 'priest'] },
  { label: 'full party', classIds: ['warrior', 'archer', 'mage', 'priest'] },
];

function targetDurationSeconds(level: number): number {
  return SHORT_FIGHT_SECONDS_AT_LEVEL_ONE + SECONDS_ADDED_PER_LEVEL * (level - 1);
}

function createPartyAtLevel(classIds: readonly ClassId[], level: number): Hero[] {
  return classIds.map((classId, index) => ({
    id: `hero-${index}`,
    name: classId,
    classId,
    level,
    experience: 0,
    healthFraction: 1,
  }));
}

function measure(partyCase: PartyCase, dungeon: DungeonDefinition, heroLevel: number): string {
  let wins = 0;
  let totalSeconds = 0;
  let totalHealthLost = 0;
  const seedRandom = createRandom(2024);

  for (let battle = 0; battle < BATTLES_PER_CASE; battle++) {
    const random = seedRandom.fork(`battle-${battle}`);
    const partyUnits = createPartyAtLevel(partyCase.classIds, heroLevel).map(heroToBattleUnit);
    const monsterUnits = createEncounter(dungeon, partyUnits.length, random.fork('monsters'));
    const report = simulateBattle([...partyUnits, ...monsterUnits], random.fork('battle'));
    if (report.winner === 'party') wins += 1;
    totalSeconds += report.durationSeconds;
    const partyAfter = report.finalUnits.filter((unit) => unit.side === 'party');
    const maxTotal = partyAfter.reduce((sum, unit) => sum + unit.maxHp, 0);
    const hpTotal = partyAfter.reduce((sum, unit) => sum + unit.hp, 0);
    totalHealthLost += 1 - hpTotal / maxTotal;
  }

  const winRate = Math.round((wins / BATTLES_PER_CASE) * 100);
  const seconds = (totalSeconds / BATTLES_PER_CASE).toFixed(1);
  const healthLost = Math.round((totalHealthLost / BATTLES_PER_CASE) * 100);
  const target = targetDurationSeconds(dungeon.level).toFixed(1);
  return `${partyCase.label.padEnd(20)} win ${String(winRate).padStart(3)}%  duration ${seconds.padStart(6)}s (target ${target}s)  hp lost ${String(healthLost).padStart(3)}%`;
}

for (const dungeon of DUNGEONS) {
  console.log(`\n${dungeon.name} (monster level ${dungeon.level}, heroes at level ${dungeon.level})`);
  for (const partyCase of PARTY_CASES) {
    console.log(`  ${measure(partyCase, dungeon, dungeon.level)}`);
  }
}
