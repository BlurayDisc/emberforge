import { DUNGEONS } from '../content/dungeons';
import type { GameState } from '../model/gameState';
import type { MessageParams } from '../game';
import { heroDisplayName } from './displayNames';
import { t } from './i18n';

// Each line is a full sentence about the player, the heroes or the town. A line that returns null does not fit the state now.
interface TownTalk {
  key: string;
  paramsFor(state: GameState, pick: <Item>(items: readonly Item[]) => Item): MessageParams | null;
}

const ALWAYS: MessageParams = {};
const ENOUGH_COPPER_FOR_A_HERO = 1000;

function townDungeons(state: GameState) {
  return DUNGEONS.filter((dungeon) => dungeon.townId === state.townId);
}

const TOWN_TALKS: readonly TownTalk[] = [
  { key: 'talk.noHeroes', paramsFor: (state) => (state.company.length === 0 ? ALWAYS : null) },
  { key: 'talk.tiredHero', paramsFor: (state, pick) => (state.company.length > 0 ? { hero: heroDisplayName(pick(state.company).name) } : null) },
  {
    key: 'talk.marchingHero',
    paramsFor: (state, pick) => {
      if (state.dungeonRuns.length === 0) return null;
      const run = pick(state.dungeonRuns);
      const hero = state.company.find((candidate) => candidate.id === run.heroIds[0]);
      return hero ? { hero: heroDisplayName(hero.name), dungeon: t(`dungeon.${run.dungeonId}`) } : null;
    },
  },
  {
    key: 'talk.clearedDungeon',
    paramsFor: (state, pick) => {
      const cleared = townDungeons(state).filter((dungeon) => state.clearedDungeonIds.includes(dungeon.id));
      return cleared.length > 0 ? { dungeon: t(`dungeon.${pick(cleared).id}`) } : null;
    },
  },
  {
    key: 'talk.dangerousDungeon',
    paramsFor: (state, pick) => {
      const uncleared = townDungeons(state).filter((dungeon) => !state.clearedDungeonIds.includes(dungeon.id));
      return uncleared.length > 0 ? { dungeon: t(`dungeon.${pick(uncleared).id}`) } : null;
    },
  },
  { key: 'talk.companySize', paramsFor: (state) => (state.company.length > 0 ? { count: state.company.length } : null) },
  { key: 'talk.fullPurse', paramsFor: (state) => (state.copper >= ENOUGH_COPPER_FOR_A_HERO ? ALWAYS : null) },
  { key: 'talk.emptyPurse', paramsFor: (state) => (state.copper < ENOUGH_COPPER_FOR_A_HERO ? ALWAYS : null) },
  { key: 'talk.unreadResults', paramsFor: (state, pick) => (state.reports.length > 0 ? { dungeon: t(`dungeon.${pick(state.reports).dungeonId}`) } : null) },
  { key: 'talk.townHistory', paramsFor: (state) => ({ town: t(`town.${state.townId}`) }) },
  { key: 'talk.farmers', paramsFor: (state) => ({ region: t(`town.${state.townId}.region`) }) },
  { key: 'talk.smith', paramsFor: () => ALWAYS },
  { key: 'talk.keep', paramsFor: () => ALWAYS },
  { key: 'talk.rats', paramsFor: () => ALWAYS },
  { key: 'talk.southRoad', paramsFor: () => ALWAYS },
];

export function pickTownTalk(state: GameState): string {
  const pick = <Item>(items: readonly Item[]): Item => items[Math.floor(Math.random() * items.length)] as Item;
  const fitting = TOWN_TALKS.flatMap((talk) => {
    const params = talk.paramsFor(state, pick);
    return params === null ? [] : [{ key: talk.key, params }];
  });
  const chosen = pick(fitting);
  return t(chosen.key, chosen.params);
}
