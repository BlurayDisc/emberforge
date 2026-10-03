import type { EquipmentSlot, Item, StatBonuses } from '../model/item';
import type { StatBlock } from '../model/statBlock';
import { element } from './dom';
import { createMoneyDisplay } from './moneyDisplay';

export const STAT_LABELS: Record<keyof StatBlock, string> = {
  hp: 'HP',
  strength: 'STR',
  magic: 'MAG',
  skill: 'SKL',
  speed: 'SPD',
  defence: 'DEF',
  resistance: 'RES',
};

export const SLOT_LABELS: Record<EquipmentSlot, string> = {
  mainHand: 'Main hand',
  offHand: 'Off hand',
  helm: 'Helm',
  armour: 'Armour',
  gloves: 'Gloves',
  boots: 'Boots',
  belt: 'Belt',
  amulet: 'Amulet',
  ringOne: 'Ring',
  ringTwo: 'Ring',
};

export const EQUIPMENT_SLOT_ORDER: readonly EquipmentSlot[] = [
  'mainHand',
  'offHand',
  'helm',
  'armour',
  'gloves',
  'boots',
  'belt',
  'amulet',
  'ringOne',
  'ringTwo',
];

export function formatStatBonuses(bonuses: StatBonuses): string {
  return (Object.entries(bonuses) as Array<[keyof StatBlock, number]>)
    .map(([stat, value]) => `+${value} ${STAT_LABELS[stat]}`)
    .join(', ');
}

export function createItemCard(item: Item): HTMLElement {
  const card = element(
    'div',
    'item-card',
    element('div', `item-name quality-${item.quality}`, item.name),
    element('div', 'card-text small', `${item.baseName} — ${item.quality}, item level ${item.itemLevel}, tier ${item.tier}`),
    element('div', 'card-text', formatStatBonuses(item.baseStats)),
  );
  for (const affix of item.affixes) {
    card.append(element('div', 'affix-line', `${affix.displayName}: +${affix.value} ${STAT_LABELS[affix.stat]}`));
  }
  card.append(element('div', 'card-row', 'Sells for ', createMoneyDisplay(item.sellValueCopper)));
  return card;
}
