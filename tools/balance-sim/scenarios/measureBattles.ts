import type { DungeonDefinition } from '../../../src/content/dungeons';
import { createRandom } from '../../../src/kernel/random';
import type { ClassId } from '../../../src/model/hero';
import { simulateBattle } from '../../../src/systems/battle';
import { createEncounter } from '../../../src/systems/dungeons';
import { heroToBattleUnit } from '../../../src/systems/stats';
import { createSimulatedHero, learnSpellsFor } from '../simulatedHero';
import { equipBestGear, type GearRule } from './bestEquippableGear';

export interface BattleMeasurement {
  winRatePercent: number;
  averageSecondsOfWins: number | null;
  averageSecondsOfAllFights: number;
  healthLostPercent: number;
  // The resource pool of the hero: the lowest point of a fight and the average over the fight, as a share of the maximum. Spells cast in a fight.
  averageLowestResourcePercent: number;
  averageResourcePercent: number;
  averageSpellsCast: number;
}

// One hero with the best gear it can equip and its best spells fights the dungeon again and again.
// Every battle forks its own random streams from the seed, so the same preset gives the same numbers.
export function measureSoloHero(classId: ClassId, heroLevel: number, dungeon: DungeonDefinition, battles: number, seed: number, gearRule: GearRule | null = null): BattleMeasurement {
  const seedRandom = createRandom(seed);
  let wins = 0;
  let secondsOfWins = 0;
  let secondsOfAllFights = 0;
  let healthLost = 0;
  let lowestResourceShares = 0;
  let averageResourceShares = 0;
  let spellsCast = 0;
  for (let battle = 0; battle < battles; battle++) {
    const random = seedRandom.fork(`battle-${battle}`);
    const hero = learnSpellsFor(equipBestGear(createSimulatedHero(classId, heroLevel, 0), random.fork('gear'), null, gearRule), true);
    const heroUnit = heroToBattleUnit(hero);
    const monsterUnits = createEncounter(dungeon, 1, random.fork('monsters'));
    const report = simulateBattle([heroUnit, ...monsterUnits], random.fork('battle'));
    const heroAfter = report.finalUnits.find((unit) => unit.side === 'party')!;
    const heroEvents = report.events.filter((fightEvent) => fightEvent.actorId === heroUnit.id);
    const resourceShares = [heroUnit.resource / heroUnit.maxResource, ...heroEvents.map((fightEvent) => fightEvent.actorResourceAfter / heroUnit.maxResource)];
    lowestResourceShares += Math.min(...resourceShares);
    averageResourceShares += resourceShares.reduce((sum, share) => sum + share, 0) / resourceShares.length;
    spellsCast += heroEvents.filter((fightEvent) => fightEvent.resourceSpent !== undefined).length;
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
    averageLowestResourcePercent: Math.round((lowestResourceShares / battles) * 100),
    averageResourcePercent: Math.round((averageResourceShares / battles) * 100),
    averageSpellsCast: spellsCast / battles,
  };
}
