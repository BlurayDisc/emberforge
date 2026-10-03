import type { GameState } from '../../model/gameState';
import type { Hero } from '../../model/hero';
import type { EquipmentSlot } from '../../model/item';
import { equipItem, findEquipProblem, unequipItem } from '../../systems/equipment';
import { addItem, findItem, removeItem } from '../../systems/inventory';
import { CommandRejected, type Command } from '../gameStore';
import { backpackRowsOf } from '../storage';
import { replaceHero, requireEditableHero } from './editableHero';

const requireEditableGearHero = (state: GameState, heroId: string): Hero => requireEditableHero(state, heroId, 'reject.stopRunBeforeGearChange');

export function equipItemCommand(heroId: string, itemId: string, slot?: EquipmentSlot): Command {
  return (state) => {
    const hero = requireEditableGearHero(state, heroId);
    const item = findItem(state.backpack, itemId);
    if (!item) throw new CommandRejected('reject.itemNotInBackpack');
    const problem = findEquipProblem(hero, item);
    if (problem !== null) throw new CommandRejected(problem.key, problem.params);

    const { hero: equippedHero, replacedItem } = equipItem(hero, item, slot);
    const backpackWithoutItem = removeItem(state.backpack, itemId);
    const finalBackpack = replacedItem ? addItem(backpackWithoutItem, replacedItem, backpackRowsOf(state)) : backpackWithoutItem;
    if (finalBackpack === null) throw new CommandRejected('reject.backpackFullForReplaced');
    return { ...state, company: replaceHero(state, equippedHero), backpack: finalBackpack };
  };
}

export function unequipItemCommand(heroId: string, slot: EquipmentSlot): Command {
  return (state) => {
    const hero = requireEditableGearHero(state, heroId);
    const { hero: unequippedHero, replacedItem } = unequipItem(hero, slot);
    if (!replacedItem) return state;
    const backpack = addItem(state.backpack, replacedItem, backpackRowsOf(state));
    if (backpack === null) throw new CommandRejected('reject.backpackFullForItem');
    return { ...state, company: replaceHero(state, unequippedHero), backpack };
  };
}
