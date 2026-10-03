import type { GameState } from '../../model/gameState';
import type { EquipmentSlot, Item } from '../../model/item';
import type { HeroSheet } from '../../model/heroSheet';
import { equipItem, findEquipProblem, slotsForItem, type EquipProblem } from '../../systems/equipment';
import { computeHeroPower, computeHeroSheet } from '../../systems/stats';

export interface SlotCandidate {
  item: Item;
  problem: EquipProblem | null;
}

export interface EquipComparison {
  before: HeroSheet;
  after: HeroSheet;
  powerBefore: number;
  powerAfter: number;
}

export function listItemsForSlot(state: GameState, heroId: string, slot: EquipmentSlot): SlotCandidate[] {
  const hero = state.company.find((candidate) => candidate.id === heroId);
  if (!hero) return [];
  const candidates = state.backpack.flatMap((entry) =>
    entry.content.kind === 'item' && slotsForItem(entry.content.item).includes(slot)
      ? [{ item: entry.content.item, problem: findEquipProblem(hero, entry.content.item) }]
      : [],
  );
  return candidates.sort((first, second) => Number(first.problem !== null) - Number(second.problem !== null));
}

// The hero stats before and after the item would replace what is in the slot.
export function compareEquip(state: GameState, heroId: string, item: Item, slot: EquipmentSlot): EquipComparison | null {
  const hero = state.company.find((candidate) => candidate.id === heroId);
  if (!hero) return null;
  const { hero: equipped } = equipItem(hero, item, slot);
  return {
    before: computeHeroSheet(hero),
    after: computeHeroSheet(equipped),
    powerBefore: computeHeroPower(hero),
    powerAfter: computeHeroPower(equipped),
  };
}
