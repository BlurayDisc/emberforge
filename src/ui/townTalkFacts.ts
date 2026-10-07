import { DUNGEONS } from '../content/dungeons';
import { describeMoney, isBackpackFull } from '../game';
import type { GameState } from '../model/gameState';
import type { Hero } from '../model/hero';
import { ITEM_QUALITY_ORDER, type Item } from '../model/item';
import { className, heroDisplayName, itemDisplayName } from './displayNames';
import { t } from './i18n';
import { ALWAYS, type TownTalk } from './townTalkLine';

const ENOUGH_COPPER_FOR_A_HERO = 1000;
const POOR_COPPER = 100;
const STRONG_HERO_LEVEL = 5;
const NEW_HERO_LEVEL = 3;
const BIG_COMPANY_SIZE = 4;
const FINE_ITEM_QUALITIES: readonly Item['quality'][] = ['rare', 'unique'];
const MANY_CRAFTED_ITEMS = 5;
const SEASONED_RUNS = 3;
const SKILLED_CRAFTER_LEVEL = 3;
const MORNING_BEFORE_HOUR = 10;
const EVENING_FROM_HOUR = 18;
const NIGHT_FROM_HOUR = 22;
const NIGHT_BEFORE_HOUR = 5;

function townDungeons(state: GameState) {
  return DUNGEONS.filter((dungeon) => dungeon.townId === state.townId);
}

function strongestHero(company: readonly Hero[]): Hero | undefined {
  return company.reduce<Hero | undefined>((best, hero) => (best === undefined || hero.level > best.level ? hero : best), undefined);
}

function weakestHero(company: readonly Hero[]): Hero | undefined {
  return company.reduce<Hero | undefined>((weakest, hero) => (weakest === undefined || hero.level < weakest.level ? hero : weakest), undefined);
}

function fineItemsInBackpack(state: GameState): Item[] {
  return state.backpack.flatMap((entry) => (entry.content.kind === 'item' && FINE_ITEM_QUALITIES.includes(entry.content.item.quality) ? [entry.content.item] : []));
}

function bestWornItem(company: readonly Hero[]): { hero: Hero; item: Item } | null {
  const worn = company.flatMap((hero) => Object.values(hero.equipment).map((item) => ({ hero, item })));
  const best = worn.reduce<{ hero: Hero; item: Item } | null>(
    (top, candidate) => (top === null || ITEM_QUALITY_ORDER.indexOf(candidate.item.quality) > ITEM_QUALITY_ORDER.indexOf(top.item.quality) ? candidate : top),
    null,
  );
  return best !== null && FINE_ITEM_QUALITIES.includes(best.item.quality) ? best : null;
}

function millWaitingCount(state: GameState): number {
  return state.mill.storedMaterials.reduce((total, stack) => total + stack.quantity, 0);
}

function hourNow(): number {
  return new Date().getHours();
}

// Lines about what the player has: gold, heroes, levels, items, crafting and runs. Each one fits only when the fact is true.
export const TOWN_FACT_TALKS: readonly TownTalk[] = [
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
  { key: 'talk.poorPurse', paramsFor: (state) => (state.copper < POOR_COPPER ? ALWAYS : null) },
  { key: 'talk.goldPurse', paramsFor: (state) => (describeMoney(state.copper).gold > 0 ? { gold: describeMoney(state.copper).gold } : null) },
  { key: 'talk.unreadResults', paramsFor: (state, pick) => (state.reports.length > 0 ? { dungeon: t(`dungeon.${pick(state.reports).dungeonId}`) } : null) },
  {
    key: 'talk.strongHero',
    paramsFor: (state) => {
      const hero = strongestHero(state.company);
      return hero && hero.level >= STRONG_HERO_LEVEL ? { hero: heroDisplayName(hero.name), level: hero.level } : null;
    },
  },
  {
    key: 'talk.newHero',
    paramsFor: (state) => {
      const hero = weakestHero(state.company);
      return hero && hero.level <= NEW_HERO_LEVEL ? { hero: heroDisplayName(hero.name), level: hero.level } : null;
    },
  },
  {
    key: 'talk.heroClass',
    paramsFor: (state, pick) => {
      if (state.company.length === 0) return null;
      const hero = pick(state.company);
      return { hero: heroDisplayName(hero.name), class: className(hero.classId) };
    },
  },
  { key: 'talk.soloHero', paramsFor: (state) => (state.company.length === 1 ? ALWAYS : null) },
  { key: 'talk.bigCompany', paramsFor: (state) => (state.company.length >= BIG_COMPANY_SIZE ? { count: state.company.length } : null) },
  {
    key: 'talk.downedHero',
    paramsFor: (state, pick) => {
      const nowMs = Date.now();
      const downed = state.company.filter((hero) => hero.downedUntilMs !== null && hero.downedUntilMs > nowMs);
      return downed.length > 0 ? { hero: heroDisplayName(pick(downed).name) } : null;
    },
  },
  {
    key: 'talk.wornTreasure',
    paramsFor: (state) => {
      const worn = bestWornItem(state.company);
      return worn ? { hero: heroDisplayName(worn.hero.name), item: itemDisplayName(worn.item) } : null;
    },
  },
  {
    key: 'talk.packTreasure',
    paramsFor: (state, pick) => {
      const fine = fineItemsInBackpack(state);
      return fine.length > 0 ? { item: itemDisplayName(pick(fine)) } : null;
    },
  },
  { key: 'talk.packFull', paramsFor: (state) => (isBackpackFull(state) ? ALWAYS : null) },
  { key: 'talk.manyCrafted', paramsFor: (state) => (state.itemsCrafted >= MANY_CRAFTED_ITEMS ? { count: state.itemsCrafted } : null) },
  { key: 'talk.coldForge', paramsFor: (state) => (state.itemsCrafted === 0 && state.company.length > 0 ? ALWAYS : null) },
  {
    key: 'talk.skilledCrafter',
    paramsFor: (state) => {
      const bestLevel = Math.max(0, ...Object.values(state.crafters).map((crafter) => crafter.level));
      return bestLevel >= SKILLED_CRAFTER_LEVEL ? { level: bestLevel } : null;
    },
  },
  { key: 'talk.millWaiting', paramsFor: (state) => (millWaitingCount(state) > 0 ? { count: millWaitingCount(state) } : null) },
  { key: 'talk.firstMarch', paramsFor: (state) => (state.runsStarted === 0 && state.company.length > 0 ? ALWAYS : null) },
  { key: 'talk.manyMarches', paramsFor: (state) => (state.runsStarted >= SEASONED_RUNS ? { count: state.runsStarted } : null) },
  { key: 'talk.clearedCount', paramsFor: (state) => (state.clearedDungeonIds.length > 0 ? { count: state.clearedDungeonIds.length } : null) },
  { key: 'talk.morning', paramsFor: () => (hourNow() < MORNING_BEFORE_HOUR && hourNow() >= NIGHT_BEFORE_HOUR ? ALWAYS : null) },
  { key: 'talk.evening', paramsFor: () => (hourNow() >= EVENING_FROM_HOUR && hourNow() < NIGHT_FROM_HOUR ? ALWAYS : null) },
  { key: 'talk.night', paramsFor: () => (hourNow() >= NIGHT_FROM_HOUR || hourNow() < NIGHT_BEFORE_HOUR ? ALWAYS : null) },
];
