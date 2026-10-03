import type { GameState } from '../../model/gameState';
import type { Hero } from '../../model/hero';
import type { EquipmentSlot } from '../../model/item';
import { equipItem, findEquipProblem, unequipItem } from '../../systems/equipment';
import { addItem, findItem, removeItem } from '../../systems/inventory';
import { CommandRejected, type Command } from '../gameStore';
import { runOfHero } from '../runStatus';

function requireEditableHero(state: GameState, heroId: string): Hero {
  const hero = state.company.find((candidate) => candidate.id === heroId);
  if (!hero) throw new CommandRejected('reject.heroMissing');
  if (runOfHero(state, heroId)) {
    throw new CommandRejected('reject.stopRunBeforeGearChange');
  }
  return hero;
}

function replaceHero(state: GameState, updatedHero: Hero): Hero[] {
  return state.company.map((hero) => (hero.id === updatedHero.id ? updatedHero : hero));
}

export function equipItemCommand(heroId: string, itemId: string, slot?: EquipmentSlot): Command {
  return (state) => {
    const hero = requireEditableHero(state, heroId);
    const item = findItem(state.backpack, itemId);
    if (!item) throw new CommandRejected('reject.itemNotInBackpack');
    const problem = findEquipProblem(hero, item);
    if (problem !== null) throw new CommandRejected(problem.key, problem.params);

    const { hero: equippedHero, replacedItem } = equipItem(hero, item, slot);
    const backpackWithoutItem = removeItem(state.backpack, itemId);
    const finalBackpack = replacedItem ? addItem(backpackWithoutItem, replacedItem) : backpackWithoutItem;
    if (finalBackpack === null) throw new CommandRejected('reject.backpackFullForReplaced');
    return { ...state, company: replaceHero(state, equippedHero), backpack: finalBackpack };
  };
}

export function unequipItemCommand(heroId: string, slot: EquipmentSlot): Command {
  return (state) => {
    const hero = requireEditableHero(state, heroId);
    const { hero: unequippedHero, replacedItem } = unequipItem(hero, slot);
    if (!replacedItem) return state;
    const backpack = addItem(state.backpack, replacedItem);
    if (backpack === null) throw new CommandRejected('reject.backpackFullForItem');
    return { ...state, company: replaceHero(state, unequippedHero), backpack };
  };
}
