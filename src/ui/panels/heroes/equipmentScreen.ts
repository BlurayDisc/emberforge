import { BASE_ITEMS } from '../../../content/baseItems';
import { requireById } from '../../../content/lookup';
import { compareEquip, equipItemCommand, listItemsForSlot, unequipItemCommand, type SlotCandidate } from '../../../game';
import type { Hero } from '../../../model/hero';
import type { EquipmentSlot, Item } from '../../../model/item';
import type { StatBlock } from '../../../model/statBlock';
import { actionButton, element } from '../../dom';
import { heroDisplayName, itemDisplayName } from '../../displayNames';
import { describeRejection, t } from '../../i18n';
import { createItemIcon } from '../../iconArt';
import { openItemView } from '../../itemModals';
import { createItemCard, slotLabel, statLabel } from '../../itemText';
import { openModal, type ModalHandle } from '../../modal';
import { createPortrait } from '../../portraitArt';
import type { PanelContext } from '../panelContext';

const COMPARED_STATS: readonly (keyof StatBlock)[] = ['hp', 'strength', 'magic', 'skill', 'speed', 'defence', 'resistance'];
const SLOTS: readonly EquipmentSlot[] = ['helm', 'amulet', 'gloves', 'belt', 'mainHand', 'offHand', 'ringOne', 'ringTwo', 'boots', 'armour'];

function iconOf(item: Item): HTMLImageElement {
  return createItemIcon(item.baseId, item.materialId, requireById(BASE_ITEMS, item.baseId).mainCategory, 3);
}

function deltaCell(before: number, after: number): HTMLElement {
  const difference = after - before;
  const text = difference > 0 ? `+${difference}` : String(difference);
  return element('span', `delta ${difference > 0 ? 'delta-up' : difference < 0 ? 'delta-down' : 'delta-same'}`, difference === 0 ? '=' : text);
}

function renderComparison(context: PanelContext, hero: Hero, slot: EquipmentSlot, candidate: SlotCandidate, area: HTMLElement, modal: () => ModalHandle): void {
  const comparison = compareEquip(context.store.getState(), hero.id, candidate.item, slot);
  const equipped = hero.equipment[slot];
  const rows = comparison
    ? [
        ...COMPARED_STATS.map((stat) => element('div', 'compare-row', element('span', 'stat-name', statLabel(stat)), element('span', '', String(comparison.before[stat])), element('span', '', '>'), element('span', '', String(comparison.after[stat])), deltaCell(comparison.before[stat], comparison.after[stat]))),
        element('div', 'compare-row', element('span', 'stat-name', t('equip.power')), element('span', '', String(comparison.powerBefore)), element('span', '', '>'), element('span', '', String(comparison.powerAfter)), deltaCell(comparison.powerBefore, comparison.powerAfter)),
      ]
    : [];
  const equipButton = actionButton(t('equip.confirm'), () => {
    const result = context.store.execute(equipItemCommand(hero.id, candidate.item.id, slot));
    context.notify(result.accepted ? t('heroes.equips', { hero: heroDisplayName(hero.name), item: itemDisplayName(candidate.item) }) : describeRejection(result.rejection));
    if (result.accepted) modal().close();
  }, { disabled: candidate.problem !== null, className: 'action-button primary' });
  area.replaceChildren(
    element(
      'div',
      'compare-cards',
      element('div', 'compare-card', element('div', 'section-title', t('equip.current')), equipped ? createItemCard(equipped) : element('p', 'hint', t('equip.nothing'))),
      element('div', 'compare-card', element('div', 'section-title', t('equip.candidate')), createItemCard(candidate.item)),
    ),
    element('div', 'compare-table', ...rows),
    candidate.problem ? element('p', 'danger-text', t(candidate.problem.key, candidate.problem.params)) : element('span', ''),
    equipButton,
  );
}

// The list on the left selects an item on hover or on tap. The table on the right shows what changes.
function openEquipChooser(context: PanelContext, hero: Hero, slot: EquipmentSlot): void {
  const candidates = listItemsForSlot(context.store.getState(), hero.id, slot);
  const compareArea = element('div', 'chooser-compare', element('p', 'hint', t('equip.hoverHint')));
  let handle: ModalHandle | null = null;
  const rows = candidates.map((candidate) => {
    const row = element(
      'div',
      `chooser-row${candidate.problem ? ' disabled' : ''}`,
      iconOf(candidate.item),
      element('span', `quality-${candidate.item.quality}`, itemDisplayName(candidate.item)),
    );
    const select = (): void => {
      rows.forEach((other) => other.classList.remove('selected'));
      row.classList.add('selected');
      renderComparison(context, hero, slot, candidate, compareArea, () => handle as ModalHandle);
    };
    row.addEventListener('mouseenter', select);
    row.addEventListener('click', select);
    return row;
  });
  const list = element('div', 'chooser-list', ...(rows.length > 0 ? rows : [element('p', 'hint', t('equip.noItems'))]));
  handle = openModal(t('equip.chooseTitle', { slot: slotLabel(slot) }), element('div', 'chooser', list, compareArea));
}

function openSlotMenu(context: PanelContext, hero: Hero, slot: EquipmentSlot, item: Item): void {
  const menu = element('div', 'slot-menu');
  const modal = openModal(itemDisplayName(item), menu);
  menu.append(
    actionButton(t('slot.menuEquip'), () => {
      modal.close();
      openEquipChooser(context, hero, slot);
    }, { className: 'action-button primary' }),
    actionButton(t('slot.menuView'), () => {
      modal.close();
      openItemView(item);
    }),
    actionButton(t('heroes.unequip'), () => {
      const result = context.store.execute(unequipItemCommand(hero.id, slot));
      if (!result.accepted) context.notify(describeRejection(result.rejection));
      modal.close();
    }),
  );
}

function renderSlot(context: PanelContext, hero: Hero, slot: EquipmentSlot): HTMLElement {
  const item = hero.equipment[slot];
  const box = element('button', `slot-box${item ? ` quality-border-${item.quality}` : ''}`);
  box.type = 'button';
  box.style.gridArea = slot;
  if (item) {
    box.title = itemDisplayName(item);
    box.append(iconOf(item), element('span', 'slot-caption', slotLabel(slot)));
    box.addEventListener('click', () => openSlotMenu(context, hero, slot, item));
  } else {
    box.append(element('span', 'slot-empty', slotLabel(slot)));
    box.addEventListener('click', () => openEquipChooser(context, hero, slot));
  }
  return box;
}

export function renderEquipmentScreen(context: PanelContext, hero: Hero): HTMLElement {
  const portrait = element('div', 'doll-portrait', createPortrait(hero.classId, hero.name, 5));
  portrait.style.gridArea = 'portrait';
  return element('div', 'paperdoll', portrait, ...SLOTS.map((slot) => renderSlot(context, hero, slot)));
}
