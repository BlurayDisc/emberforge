import { DUNGEONS } from '../../content/dungeons';
import { CommandRejected, type Command } from '../gameStore';
import { runInDungeon, runOfHero } from '../runStatus';

export function startDungeonRunCommand(dungeonId: string, heroIds: readonly string[]): Command {
  return (state) => {
    const dungeon = DUNGEONS.find((candidate) => candidate.id === dungeonId);
    if (!dungeon || dungeon.townId !== state.townId) throw new CommandRejected('reject.dungeonNotInTown');
    if (runInDungeon(state, dungeonId)) throw new CommandRejected('reject.dungeonBusy');
    if (heroIds.length === 0) throw new CommandRejected('reject.noHeroSelected');
    if (heroIds.length > dungeon.maxPartySize) throw new CommandRejected('reject.tooManyHeroes', { max: dungeon.maxPartySize });
    if (!heroIds.every((heroId) => state.company.some((hero) => hero.id === heroId))) throw new CommandRejected('reject.heroMissing');
    if (heroIds.some((heroId) => runOfHero(state, heroId))) throw new CommandRejected('reject.heroBusy');

    const runNumber = state.runsStarted + 1;
    return {
      ...state,
      runsStarted: runNumber,
      dungeonRuns: [
        ...state.dungeonRuns,
        {
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
      ],
    };
  };
}
