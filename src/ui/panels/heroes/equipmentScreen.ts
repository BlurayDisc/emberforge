import { BASE_ITEMS } from '../../../content/baseItems';
import { requireById } from '../../../content/lookup';
import { listItemsForSlot, unequipItemCommand, type SlotCandidate } from '../../../game';
import type { Hero } from '../../../model/hero';
import type { EquipmentSlot, Item } from '../../../model/item';
import { actionButton, element } from '../../dom';
import { itemDisplayName } from '../../displayNames';
import { createItemNameElement } from '../../itemNameElement';
import { describeRejection, t } from '../../i18n';
import { createItemIcon } from '../../iconArt';
import { openItemView } from '../../itemModals';
import { slotLabel } from '../../itemText';
import { openModal, type ModalHandle, type ScreenPoint } from '../../modal';
import { createFullBodyPortrait } from '../../fullBody/fullBodyPortraitArt';
import type { PanelContext } from '../panelContext';
import { equipIntoEmptySlot, renderEquipComparison } from './equipComparison';

const SLOTS: readonly EquipmentSlot[] = ['helm', 'amulet', 'gloves', 'belt', 'mainHand', 'offHand', 'ringOne', 'ringTwo', 'legs', 'armour', 'boots'];

function iconOf(item: Item): HTMLImageElement {
  return createItemIcon(item.baseId, item.materialId, requireById(BASE_ITEMS, item.baseId).mainCategory, 3);
}

// The chooser lists the items. A tap on an item opens its compare screen in the same window. Back returns to the list.
function openEquipChooser(context: PanelContext, hero: Hero, slot: EquipmentSlot): void {
  const candidates = listItemsForSlot(context.store.getState(), hero.id, slot);
  const screen = element('div', 'chooser');
  let handle: ModalHandle | null = null;

  const showList = (): void => {
    const rows = candidates.map((candidate) => {
      const row = element(
        'div',
        `chooser-row${candidate.problem ? ' disabled' : ''}`,
        iconOf(candidate.item),
        createItemNameElement(candidate.item),
      );
      row.addEventListener('click', () => showComparison(candidate));
      return row;
    });
    const list = element('div', 'chooser-list', ...(rows.length > 0 ? rows : [element('p', 'hint', t('equip.noItems'))]));
    screen.replaceChildren(element('p', 'hint', t('equip.pickHint')), list);
  };

  const showComparison = (candidate: SlotCandidate): void => {
    if (equipIntoEmptySlot(context, hero, slot, candidate.item, candidate.problem)) {
      (handle as ModalHandle).close();
      return;
    }
    const compareArea = element('div', 'chooser-compare');
    renderEquipComparison(context, hero, slot, candidate.item, candidate.problem, compareArea, () => (handle as ModalHandle).close());
    screen.replaceChildren(actionButton(t('equip.backToList'), showList), compareArea);
  };

  showList();
  handle = openModal(t('equip.chooseTitle', { slot: slotLabel(slot) }), screen);
}

function openSlotMenu(context: PanelContext, hero: Hero, slot: EquipmentSlot, item: Item, clickPoint: ScreenPoint): void {
  let modal: ModalHandle | null = null;
  const closeMenu = (): void => modal?.close();
  // The buttons are in the menu before it opens. The modal keeps a menu inside the screen by its full size.
  const menu = element(
    'div',
    'slot-menu',
    actionButton(t('slot.menuView'), () => {
      closeMenu();
      openItemView(item);
    }),
    actionButton(t('slot.menuEquip'), () => {
      closeMenu();
      openEquipChooser(context, hero, slot);
    }, { className: 'action-button primary' }),
    actionButton(t('heroes.unequip'), () => {
      const result = context.store.execute(unequipItemCommand(hero.id, slot));
      if (!result.accepted) context.notify(describeRejection(result.rejection));
      closeMenu();
    }),
  );
  modal = openModal(itemDisplayName(item), menu, undefined, clickPoint);
}

function renderSlot(context: PanelContext, hero: Hero, slot: EquipmentSlot): HTMLElement {
  const item = hero.equipment[slot];
  const box = element('button', `slot-box${item ? ` quality-border-${item.quality}` : ''}`);
  box.type = 'button';
  box.style.gridArea = slot;
  if (item) {
    box.title = itemDisplayName(item);
    box.append(iconOf(item), element('span', 'slot-caption', slotLabel(slot)));
    box.addEventListener('click', (event) => {
      // A key press gives a click with no pointer position, so the menu opens at the slot instead.
      const slotBox = box.getBoundingClientRect();
      const clickPoint = event.detail === 0 ? { x: slotBox.left + slotBox.width / 2, y: slotBox.top + slotBox.height / 2 } : { x: event.clientX, y: event.clientY };
      openSlotMenu(context, hero, slot, item, clickPoint);
    });
  } else {
    box.append(element('span', 'slot-empty', slotLabel(slot)));
    box.addEventListener('click', () => openEquipChooser(context, hero, slot));
  }
  return box;
}

export function renderEquipmentScreen(context: PanelContext, hero: Hero): HTMLElement {
  const portrait = element('div', 'doll-portrait', createFullBodyPortrait(hero.classId, hero.name, 5));
  portrait.style.gridArea = 'portrait';
  return element('div', 'paperdoll', portrait, ...SLOTS.map((slot) => renderSlot(context, hero, slot)));
}
