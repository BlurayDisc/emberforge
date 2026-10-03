import { DUNGEONS } from '../../content/dungeons';
import { CommandRejected, type Command } from '../gameStore';
import { activeRunOf } from '../runStatus';

export function startDungeonRunCommand(dungeonId: string, heroIds: readonly string[]): Command {
  return (state) => {
    if (activeRunOf(state) !== null) throw new CommandRejected('reject.runAlreadyActive');
    const dungeon = DUNGEONS.find((candidate) => candidate.id === dungeonId);
    if (!dungeon || dungeon.townId !== state.townId) throw new CommandRejected('reject.dungeonNotInTown');
    if (heroIds.length === 0) throw new CommandRejected('reject.noHeroSelected');
    if (heroIds.length > dungeon.maxPartySize) throw new CommandRejected('reject.tooManyHeroes', { max: dungeon.maxPartySize });
    if (!heroIds.every((heroId) => state.company.some((hero) => hero.id === heroId))) throw new CommandRejected('reject.heroMissing');

    const runNumber = state.runsStarted + 1;
    return {
      ...state,
      runsStarted: runNumber,
      dungeonRun: {
        dungeonId,
        heroIds: [...heroIds],
        runNumber,
        encounterNumber: 0,
        status: 'active',
        endReason: null,
        encountersWon: 0,
        copperGained: 0,
        materialsGained: [],
        lastEncounter: null,
      },
    };
  };
}
