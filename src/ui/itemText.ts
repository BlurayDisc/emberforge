import { CLASSES } from '../content/classes';
import { classIdsThatCanUseItem } from '../game';
import type { EquipmentSlot, Item } from '../model/item';
import { createClassTags } from './classTags';
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
  'legs',
  'boots',
  'belt',
  'amulet',
  'ringOne',
  'ringTwo',
];

export function slotLabel(slot: EquipmentSlot): string {
  return t(`slot.${slot}`);
}

// An item that every class can use shows one note. Other items list the classes, so the player sees who can wear it.
function createClassRequirement(item: Item): HTMLElement {
  const classIds = classIdsThatCanUseItem(item);
  if (classIds.length === CLASSES.length) return element('div', 'card-text small', t('item.usableByAllClasses'));
  return createClassTags(classIds, 'item.usableBy');
}

export function createItemCard(item: Item): HTMLElement {
  const meta = t('item.meta', {
    baseName: itemBaseDisplayName(item),
    quality: qualityName(item.quality),
    tier: item.tier,
  });
  const card = element(
    'div',
    'item-card',
    createItemNameElement(item, 'item-name'),
    element('div', 'card-text small', meta),
    element('div', 'item-level-requirement', t('item.requiresLevel', { level: item.itemLevel })),
    createClassRequirement(item),
    createItemStatTable(item),
  );
  card.append(element('div', 'card-row', t('item.sells'), createMoneyDisplay(item.sellValueCopper)));
  return card;
}
