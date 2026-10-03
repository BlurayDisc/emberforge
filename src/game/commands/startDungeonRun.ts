import { DUNGEONS } from '../../content/dungeons';
import { isDowned, settleHealth } from '../../systems/recovery';
import { CommandRejected, type Command } from '../gameStore';
import { isDungeonUnlocked, runInDungeon, runOfHero } from '../runStatus';

export function startDungeonRunCommand(dungeonId: string, heroIds: readonly string[], nowMs: number): Command {
  return (state) => {
    const dungeon = DUNGEONS.find((candidate) => candidate.id === dungeonId);
    if (!dungeon || dungeon.townId !== state.townId) throw new CommandRejected('reject.dungeonNotInTown');
    if (!isDungeonUnlocked(state, dungeon)) throw new CommandRejected('reject.dungeonLocked');
    if (runInDungeon(state, dungeonId)) throw new CommandRejected('reject.dungeonBusy');
    if ((state.pendingLoot[dungeonId] ?? []).length > 0) throw new CommandRejected('reject.dungeonHasPendingLoot');
    if (heroIds.length === 0) throw new CommandRejected('reject.noHeroSelected');
    if (heroIds.length > dungeon.maxPartySize) throw new CommandRejected('reject.tooManyHeroes', { max: dungeon.maxPartySize });
    if (!heroIds.every((heroId) => state.company.some((hero) => hero.id === heroId))) throw new CommandRejected('reject.heroMissing');
    if (heroIds.some((heroId) => runOfHero(state, heroId))) throw new CommandRejected('reject.heroBusy');

    const tooWeakHero = state.company.find((hero) => heroIds.includes(hero.id) && hero.level < dungeon.minimumHeroLevel);
    if (tooWeakHero) throw new CommandRejected('reject.heroLevelTooLow', { hero: tooWeakHero.name, level: dungeon.minimumHeroLevel });

    const downedHero = state.company.find((hero) => heroIds.includes(hero.id) && isDowned(hero, nowMs));
    if (downedHero) throw new CommandRejected('reject.heroDowned', { hero: downedHero.name });

    const runNumber = state.runsStarted + 1;
    return {
      ...state,
      runsStarted: runNumber,
      // Regeneration is frozen into the saved health, because the fight starts from that health.
      company: state.company.map((hero) => (heroIds.includes(hero.id) ? settleHealth(hero, nowMs) : hero)),
      dungeonRuns: [...state.dungeonRuns, { runNumber, dungeonId, heroIds: [...heroIds] }],
    };
  };
}
