import { createRandom } from '../../kernel/random';
import type { ClassId } from '../../model/hero';
import { hireCostForCompanySize } from '../../systems/economy';
import { canJoinParty, createHero } from '../../systems/heroes';
import { CommandRejected, type Command } from '../gameStore';
import { activeRunOf } from '../runStatus';

export function hireHeroCommand(classId: ClassId): Command {
  return (state) => {
    const cost = hireCostForCompanySize(state.company.length);
    if (cost === null) throw new CommandRejected('The company is full.');
    if (state.copper < cost) throw new CommandRejected('You do not have enough money.');

    const heroNumber = state.heroesHired + 1;
    const hero = createHero(classId, heroNumber, createRandom(state.seed).fork(`hero-${heroNumber}`));
    const joinsParty = canJoinParty(state.partyHeroIds) && activeRunOf(state) === null;
    return {
      ...state,
      copper: state.copper - cost,
      company: [...state.company, hero],
      heroesHired: heroNumber,
      partyHeroIds: joinsParty ? [...state.partyHeroIds, hero.id] : state.partyHeroIds,
    };
  };
}
