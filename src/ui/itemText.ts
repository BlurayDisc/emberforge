import type { EquipmentSlot, Item } from '../model/item';
import { element } from './dom';
import { itemBaseDisplayName, qualityName } from './displayNames';
import { createItemNameElement } from './itemNameElement';
import { t } from './i18n';
import { createItemStatTable } from './itemStatTable';
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

export function slotLabel(slot: EquipmentSlot): string {
  return t(`slot.${slot}`);
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
    createItemNameElement(item, 'item-name'),
    element('div', 'card-text small', meta),
    createItemStatTable(item),
  );
  card.append(element('div', 'card-row', t('item.sells'), createMoneyDisplay(item.sellValueCopper)));
  return card;
}
