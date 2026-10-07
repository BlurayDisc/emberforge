import type { GameState } from '../model/gameState';
import { t } from './i18n';
import { TOWN_FACT_TALKS } from './townTalkFacts';
import type { TownTalk } from './townTalkLine';
import { TOWN_STORY_TALKS } from './townTalkStories';

const CHANCE_OF_A_FACT_LINE = 0.7;
const REMEMBERED_LINE_COUNT = 6;

const recentlySaidKeys: string[] = [];

function fittingLines(talks: readonly TownTalk[], state: GameState, pick: <Item>(items: readonly Item[]) => Item): Array<{ key: string; params: Record<string, string | number> }> {
  return talks.flatMap((talk) => {
    const params = talk.paramsFor(state, pick);
    return params === null ? [] : [{ key: talk.key, params }];
  });
}

// Most of the time a villager speaks about the player. A line is not repeated until the villagers have said several others.
export function pickTownTalk(state: GameState): string {
  const pick = <Item>(items: readonly Item[]): Item => items[Math.floor(Math.random() * items.length)] as Item;
  const notRecent = <Line extends { key: string }>(lines: readonly Line[]): Line[] => lines.filter((line) => !recentlySaidKeys.includes(line.key));
  const facts = notRecent(fittingLines(TOWN_FACT_TALKS, state, pick));
  const stories = notRecent(fittingLines(TOWN_STORY_TALKS, state, pick));
  const useFact = facts.length > 0 && (stories.length === 0 || Math.random() < CHANCE_OF_A_FACT_LINE);
  const chosen = pick(useFact ? facts : stories.length > 0 ? stories : fittingLines(TOWN_STORY_TALKS, state, pick));
  recentlySaidKeys.push(chosen.key);
  if (recentlySaidKeys.length > REMEMBERED_LINE_COUNT) recentlySaidKeys.shift();
  return t(chosen.key, chosen.params);
}
