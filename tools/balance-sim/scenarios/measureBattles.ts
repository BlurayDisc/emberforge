import type { DungeonDefinition } from '../../../src/content/dungeons';
import { createRandom } from '../../../src/kernel/random';
import type { ClassId } from '../../../src/model/hero';
import { simulateBattle } from '../../../src/systems/battle';
import { createEncounter } from '../../../src/systems/dungeons';
import { heroToBattleUnit } from '../../../src/systems/stats';
import { createSimulatedHero, learnSpellsFor } from '../simulatedHero';
import { equipBestGear } from './bestEquippableGear';

export interface BattleMeasurement {
  winRatePercent: number;
  averageSecondsOfWins: number | null;
  averageSecondsOfAllFights: number;
  healthLostPercent: number;
}

// One hero with the best gear it can equip and its best spells fights the dungeon again and again.
// Every battle forks its own random streams from the seed, so the same preset gives the same numbers.
export function measureSoloHero(classId: ClassId, heroLevel: number, dungeon: DungeonDefinition, battles: number, seed: number): BattleMeasurement {
  const seedRandom = createRandom(seed);
  let wins = 0;
  let secondsOfWins = 0;
  let secondsOfAllFights = 0;
  let healthLost = 0;
  for (let battle = 0; battle < battles; battle++) {
    const random = seedRandom.fork(`battle-${battle}`);
    const hero = learnSpellsFor(equipBestGear(createSimulatedHero(classId, heroLevel, 0), random.fork('gear')), true);
    const heroUnit = heroToBattleUnit(hero);
    const monsterUnits = createEncounter(dungeon, 1, random.fork('monsters'));
    const report = simulateBattle([heroUnit, ...monsterUnits], random.fork('battle'));
    const heroAfter = report.finalUnits.find((unit) => unit.side === 'party')!;
    secondsOfAllFights += report.durationSeconds;
    healthLost += 1 - heroAfter.hp / heroAfter.maxHp;
    if (report.winner === 'party') {
      wins += 1;
      secondsOfWins += report.durationSeconds;
    }
  }
  return {
    winRatePercent: Math.round((wins / battles) * 100),
    averageSecondsOfWins: wins === 0 ? null : secondsOfWins / wins,
    averageSecondsOfAllFights: secondsOfAllFights / battles,
    healthLostPercent: Math.round((healthLost / battles) * 100),
  };
}
