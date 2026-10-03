import { NORMAL_SPELL_SLOT_COUNT } from '../../content/balance/spells';
import { heroNamesForClass } from '../../content/heroNames';
import type { Random } from '../../kernel/random';
import type { ClassId, Hero } from '../../model/hero';

export function createHero(classId: ClassId, heroNumber: number, random: Random): Hero {
  return {
    id: `hero-${heroNumber}`,
    name: random.pick(heroNamesForClass(classId)),
    classId,
    level: 1,
    experience: 0,
    healthFraction: 1,
    healthAsOfMs: 0,
    downedUntilMs: null,
    equipment: {},
    learnedSpellIds: [],
    equippedSpellIds: Array.from({ length: NORMAL_SPELL_SLOT_COUNT }, () => null),
    equippedUltimateId: null,
    statistics: {
      monstersDefeated: 0,
      damageDealt: 0,
      damageTaken: 0,
      healingDone: 0,
      secondsFought: 0,
      battlesWon: 0,
      battlesLost: 0,
    },
  };
}
