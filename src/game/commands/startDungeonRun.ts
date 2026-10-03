import { DUNGEONS } from '../../content/dungeons';
import { CommandRejected, type Command } from '../gameStore';
import { activeRunOf } from '../runStatus';

export function startDungeonRunCommand(dungeonId: string): Command {
  return (state) => {
    if (activeRunOf(state) !== null) throw new CommandRejected('A dungeon run is already active.');
    if (state.partyHeroIds.length === 0) throw new CommandRejected('Add a hero to the party first.');
    const dungeon = DUNGEONS.find((candidate) => candidate.id === dungeonId);
    if (!dungeon || dungeon.townId !== state.townId) throw new CommandRejected('This dungeon is not in this town.');

    const runNumber = state.runsStarted + 1;
    return {
      ...state,
      runsStarted: runNumber,
      dungeonRun: {
        dungeonId,
        runNumber,
        encounterNumber: 0,
        status: 'active',
        endReason: null,
        encountersWon: 0,
        copperGained: 0,
        materialsGained: [],
      },
    };
  };
}
