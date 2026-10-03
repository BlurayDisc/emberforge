import type { EquipmentSlot, Item, StatBonuses } from '../model/item';
import type { StatBlock } from '../model/statBlock';
import { element } from './dom';
import { itemBaseDisplayName, itemDisplayName, qualityName } from './displayNames';
import { t } from './i18n';
import { createMoneyDisplay } from './moneyDisplay';

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

export function statLabel(stat: keyof StatBlock): string {
  return t(`stat.${stat}`);
}

export function slotLabel(slot: EquipmentSlot): string {
  return t(`slot.${slot}`);
}

export function formatStatBonuses(bonuses: StatBonuses): string {
  return (Object.entries(bonuses) as Array<[keyof StatBlock, number]>)
    .map(([stat, value]) => `+${value} ${statLabel(stat)}`)
    .join(', ');
}

export function totalItemBonuses(item: Item): StatBonuses {
  const totals: StatBonuses = { ...item.baseStats };
  for (const affix of item.affixes) totals[affix.stat] = (totals[affix.stat] ?? 0) + affix.value;
  return totals;
}

export function createItemCard(item: Item): HTMLElement {
  const meta = t('item.meta', {
    baseName: itemBaseDisplayName(item),
    quality: qualityName(item.quality),
    level: item.itemLevel,
    tier: item.tier,
  });
  const card = element(
    'div',
    'item-card',
    element('div', `item-name quality-${item.quality}`, itemDisplayName(item)),
    element('div', 'card-text small', meta),
    element('div', 'card-text', formatStatBonuses(item.baseStats)),
  );
  for (const affix of item.affixes) {
    card.append(element('div', 'affix-line', `${t(`affix.${affix.affixId}`)}: +${affix.value} ${statLabel(affix.stat)}`));
  }
  card.append(element('div', 'card-row', t('item.sells'), createMoneyDisplay(item.sellValueCopper)));
  return card;
}
