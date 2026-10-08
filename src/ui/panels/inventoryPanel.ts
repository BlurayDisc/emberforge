import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import { describeStorage, findBackpackMoveAnchor, hasBankUnlock, listSaleJobs, merchantSaleSlotsOf, moveBackpackEntryCommand, sortBackpackCommand } from '../../game';
import type { BackpackEntry } from '../../model/backpack';
import { actionButton, element } from '../dom';
import { itemBaseDisplayName, qualityName } from '../displayNames';
import { describeRejection, t } from '../i18n';
import { createMoneyDisplay } from '../moneyDisplay';
import { createItemNameElement } from '../itemNameElement';
import type { PanelContext, PanelRenderer } from './panelContext';
import { backpackEntryTitle, createBackpackEntryActions } from './backpack/backpackEntryMenu';
import { createBackpackGrid } from './backpack/backpackGrid';
import { openEquipPreview } from './backpack/equipPreview';

interface SelectedPosition {
  column: number;
  row: number;
}

let selectedPosition: SelectedPosition | null = null;

export function resetInventorySelection(): void {
  selectedPosition = null;
}

// The short description under the name. The full item card opens with View, so the price shows once, on the Sell button.
function renderDescription(entry: BackpackEntry): HTMLElement {
  if (entry.content.kind === 'item') {
    const item = entry.content.item;
    return element('p', 'hint selection-hint', t('item.meta', { baseName: itemBaseDisplayName(item), quality: qualityName(item.quality), tier: item.tier }), ' ', t('item.requiresLevel', { level: item.itemLevel }));
  }
  const material = requireById(MATERIALS, entry.content.materialId);
  return element(
    'p',
    'hint selection-hint',
    t('inventory.materialDetail', {
      tier: material.tier,
      category: t(`category.${material.category}`),
      cells: material.width * material.height,
    }),
    ' ',
    t(`material.${material.id}.lore`),
  );
}

function tryMove(context: PanelContext, from: SelectedPosition, column: number, row: number): void {
  const target = findBackpackMoveAnchor(context.store.getState(), from, { column, row }) ?? { column, row };
  const result = context.store.execute(moveBackpackEntryCommand(from, target));
  if (!result.accepted) {
    context.notify(describeRejection(result.rejection));
    return;
  }
  selectedPosition = target;
  context.requestRender();
}

// Sorting is a Bank upgrade. Before it, the button is missing.
function renderSortControl(context: PanelContext): HTMLElement[] {
  if (!hasBankUnlock(context.store.getState(), 'backpackSorting')) return [];
  return [actionButton(t('inventory.sort'), () => {
    const result = context.store.execute(sortBackpackCommand());
    context.notify(result.accepted ? t('inventory.sorted') : describeRejection(result.rejection));
    selectedPosition = null;
    context.requestRender();
  })];
}

// The merchant slot count can grow with a Bank upgrade, so the ceiling comes from the state. The line turns red when no slot is free.
function renderMerchantSaleStatus(context: PanelContext): HTMLElement {
  const state = context.store.getState();
  const used = listSaleJobs(state).length;
  const slots = merchantSaleSlotsOf(state);
  return element('span', used >= slots ? 'danger-text' : '', t('inventory.merchantSales', { used, slots }));
}

// The preview sits at the bottom of the panel and replaces the helper text while an entry is selected. The grid is above it, so it never jumps.
function renderSelectionBar(context: PanelContext, selected: BackpackEntry | undefined): HTMLElement {
  if (!selected) return element('div', 'selection-bar', element('p', 'hint', t('inventory.select')));
  return element(
    'div',
    'selection-bar',
    element('div', 'section-title', selected.content.kind === 'item' ? createItemNameElement(selected.content.item) : backpackEntryTitle(selected)),
    renderDescription(selected),
    element('div', 'hero-choice-row', ...createBackpackEntryActions(context, selected, {
      onEquipOnHero: (heroId) => selected.content.kind === 'item' && openEquipPreview(context, heroId, selected.content.item),
      afterAction: () => {
        selectedPosition = null;
        context.requestRender();
      },
    })),
  );
}

// A tap on an entry selects it. Then a tap on an empty spot moves it there, with its top-left corner on that spot.
// A tap on the selected entry again clears the selection. A long press or a drag would clash with scrolling on a phone.
export const renderInventoryPanel: PanelRenderer = (context) => {
  const entries = context.store.getState().backpack;
  const storage = describeStorage(context.store.getState());
  const selected = entries.find((entry) => entry.column === selectedPosition?.column && entry.row === selectedPosition?.row);
  if (!selected) selectedPosition = null;
  const grid = createBackpackGrid(context.store, {
    isSelected: (entry) => entry === selected,
    onEntryClick: (entry) => {
      selectedPosition = entry === selected ? null : { column: entry.column, row: entry.row };
      context.requestRender();
    },
    onEmptyCellClick: selected ? (column, row) => tryMove(context, selected, column, row) : undefined,
  });
  const body = element('div', 'panel-body');
  // The detail card is last, so it never pushes the grid, the status line or the buttons when it appears.
  body.append(
    element(
      'div',
      'inventory-layout',
      element(
        'div',
        'inventory-grid-column',
        grid,
        element('div', 'hint status-row', createMoneyDisplay(context.store.getState().copper), element('span', '', t('inventory.space', { used: storage.usedCells, total: storage.totalCells })), renderMerchantSaleStatus(context)),
        element('div', 'hero-choice-row', ...renderSortControl(context), actionButton(t('inventory.upgradeBackpack'), () => context.openPanel('bank'))),
        renderSelectionBar(context, selected),
      ),
    ),
  );
  return body;
};
