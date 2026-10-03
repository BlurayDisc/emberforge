import { HERO_NAMES } from '../../content/heroNames';
import type { Random } from '../../kernel/random';
import type { ClassId, Hero } from '../../model/hero';

export function createHero(classId: ClassId, heroNumber: number, random: Random): Hero {
  return {
    id: `hero-${heroNumber}`,
    name: random.pick(HERO_NAMES),
    classId,
    level: 1,
    experience: 0,
    healthFraction: 1,
    equipment: {},
  };
}
