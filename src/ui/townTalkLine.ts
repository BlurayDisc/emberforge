import type { MessageParams } from '../game';
import type { GameState } from '../model/gameState';

// One line that a villager can say. paramsFor returns null when the line does not fit the state now.
export interface TownTalk {
  key: string;
  paramsFor(state: GameState, pick: <Item>(items: readonly Item[]) => Item): MessageParams | null;
}

export const ALWAYS: MessageParams = {};
