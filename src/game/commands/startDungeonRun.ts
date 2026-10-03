import { DUNGEONS } from '../../content/dungeons';
import { CommandRejected, type Command } from '../gameStore';
import { isDungeonUnlocked, runInDungeon, runOfHero } from '../runStatus';

export function startDungeonRunCommand(dungeonId: string, heroIds: readonly string[]): Command {
  return (state) => {
    const dungeon = DUNGEONS.find((candidate) => candidate.id === dungeonId);
    if (!dungeon || dungeon.townId !== state.townId) throw new CommandRejected('reject.dungeonNotInTown');
    if (!isDungeonUnlocked(state, dungeon)) throw new CommandRejected('reject.dungeonLocked');
    if (runInDungeon(state, dungeonId)) throw new CommandRejected('reject.dungeonBusy');
    if (heroIds.length === 0) throw new CommandRejected('reject.noHeroSelected');
    if (heroIds.length > dungeon.maxPartySize) throw new CommandRejected('reject.tooManyHeroes', { max: dungeon.maxPartySize });
    if (!heroIds.every((heroId) => state.company.some((hero) => hero.id === heroId))) throw new CommandRejected('reject.heroMissing');
    if (heroIds.some((heroId) => runOfHero(state, heroId))) throw new CommandRejected('reject.heroBusy');

    const runNumber = state.runsStarted + 1;
    return {
      ...state,
      runsStarted: runNumber,
      dungeonRuns: [...state.dungeonRuns, { runNumber, dungeonId, heroIds: [...heroIds] }],
    };
  };
}
