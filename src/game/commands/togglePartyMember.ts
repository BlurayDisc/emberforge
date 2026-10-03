import { togglePartyMembership } from '../../systems/heroes';
import { CommandRejected, type Command } from '../gameStore';
import { activeRunOf } from '../runStatus';

export function togglePartyMemberCommand(heroId: string): Command {
  return (state) => {
    if (activeRunOf(state) !== null) throw new CommandRejected('Stop the dungeon run before you change the party.');
    return { ...state, partyHeroIds: togglePartyMembership(state.partyHeroIds, heroId) };
  };
}
