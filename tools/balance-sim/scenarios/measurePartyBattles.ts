import type { DungeonDefinition } from '../../../src/content/dungeons';
import { createRandom } from '../../../src/kernel/random';
import type { ClassId } from '../../../src/model/hero';
import { simulateBattle } from '../../../src/systems/battle';
import { createEncounter } from '../../../src/systems/dungeons';
import { heroToBattleUnit } from '../../../src/systems/stats';
import { createSimulatedHero, learnSpellsFor } from '../simulatedHero';
import { equipBestGear, type GearFloorProfile, type GearRule } from './bestEquippableGear';

export interface PartyMember {
  classId: ClassId;
  level: number;
}

export interface PartyMeasurement {
  winRatePercent: number;
  averageSecondsOfAllFights: number;
  healthLostPercent: number;
}

// A party fights the dungeon again and again. Each hero wears the best gear it can equip and uses its best spells.
// Every battle forks its own random streams from the seed, so the same preset gives the same numbers.
export function measureParty(members: readonly PartyMember[], dungeon: DungeonDefinition, battles: number, seed: number, floorProfile: GearFloorProfile | null = null, gearRule: GearRule | null = null): PartyMeasurement {
  const seedRandom = createRandom(seed);
  let wins = 0;
  let secondsOfAllFights = 0;
  let healthLost = 0;
  for (let battle = 0; battle < battles; battle++) {
    const random = seedRandom.fork(`battle-${battle}`);
    const partyUnits = members.map((member, index) =>
      heroToBattleUnit(learnSpellsFor(equipBestGear(createSimulatedHero(member.classId, member.level, index), random.fork(`gear-${index}`), floorProfile, gearRule), true)),
    );
    const monsterUnits = createEncounter(dungeon, partyUnits.length, random.fork('monsters'));
    const report = simulateBattle([...partyUnits, ...monsterUnits], random.fork('battle'));
    const partyAfter = report.finalUnits.filter((unit) => unit.side === 'party');
    healthLost += 1 - partyAfter.reduce((sum, unit) => sum + unit.hp, 0) / partyAfter.reduce((sum, unit) => sum + unit.maxHp, 0);
    secondsOfAllFights += report.durationSeconds;
    if (report.winner === 'party') wins += 1;
  }
  return {
    winRatePercent: Math.round((wins / battles) * 100),
    averageSecondsOfAllFights: secondsOfAllFights / battles,
    healthLostPercent: Math.round((healthLost / battles) * 100),
  };
}
