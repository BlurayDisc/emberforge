import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import { describeStorage, hasBankUnlock, listEquipOptions, moveBackpackEntryCommand, sortBackpackCommand } from '../../game';
import type { BackpackEntry } from '../../model/backpack';
import type { Item } from '../../model/item';
import { actionButton, element } from '../dom';
import { openModal } from '../modal';
import { heroDisplayName, materialName } from '../displayNames';
import { describeRejection, t } from '../i18n';
import { createItemNameElement } from '../itemNameElement';
import { createItemCard } from '../itemText';
import type { PanelContext, PanelRenderer } from './panelContext';
import { backpackEntryTitle, createBackpackEntryActions } from './backpack/backpackEntryMenu';
import { createBackpackGrid } from './backpack/backpackGrid';
import { renderEquipComparison } from './heroes/equipComparison';

interface SelectedPosition {
  column: number;
  row: number;
}

let selectedPosition: SelectedPosition | null = null;

export function resetInventorySelection(): void {
  selectedPosition = null;
}

function openEquipPreview(context: PanelContext, heroId: string, item: Item): void {
  const hero = context.store.getState().company.find((candidate) => candidate.id === heroId);
  if (!hero) return;
  const problem = listEquipOptions(context.store.getState(), item).find((option) => option.heroId === heroId)?.problem ?? null;
  const area = element('div', 'chooser-compare');
  const modal = openModal(t('equip.previewTitle', { hero: heroDisplayName(hero.name) }), area);
  renderEquipComparison(context, hero, undefined, item, problem, area, () => modal.close());
}

function renderDetail(entry: BackpackEntry): HTMLElement {
  if (entry.content.kind === 'item') return createItemCard(entry.content.item);
  const material = requireById(MATERIALS, entry.content.materialId);
  return element(
    'p',
    'hint',
    t('inventory.materialDetail', {
      name: materialName(material.id),
      cells: material.width * material.height,
      tier: material.tier,
      category: t(`category.${material.category}`),
      price: material.sellValueCopper,
    }),
  );
}

function tryMove(context: PanelContext, from: SelectedPosition, column: number, row: number): void {
  const result = context.store.execute(moveBackpackEntryCommand(from, { column, row }));
  if (!result.accepted) {
    context.notify(describeRejection(result.rejection));
    return;
  }
  selectedPosition = { column, row };
  context.requestRender();
}

// Sorting is a Bank upgrade. Before it, the panel says why the button is missing.
function renderSortControl(context: PanelContext): HTMLElement {
  if (!hasBankUnlock(context.store.getState(), 'backpackSorting')) return element('p', 'hint', t('inventory.sortLocked'));
  return actionButton(t('inventory.sort'), () => {
    const result = context.store.execute(sortBackpackCommand());
    context.notify(result.accepted ? t('inventory.sorted') : describeRejection(result.rejection));
    selectedPosition = null;
    context.requestRender();
  });
}

// The action bar has a fixed place above the grid, so the grid does not jump when the selection changes.
function renderSelectionBar(context: PanelContext, selected: BackpackEntry | undefined): HTMLElement {
  if (!selected) return element('div', 'selection-bar', element('p', 'hint', t('inventory.select')));
  return element(
    'div',
    'selection-bar',
    element('div', 'section-title', selected.content.kind === 'item' ? createItemNameElement(selected.content.item) : backpackEntryTitle(selected)),
    element('p', 'hint', t('inventory.moveHint')),
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
  body.append(
    element('p', 'hint', t('inventory.hint')),
    element('p', 'hint', t('inventory.space', { used: storage.usedCells, total: storage.totalCells })),
    renderSortControl(context),
    renderSelectionBar(context, selected),
    grid,
    ...(selected ? [renderDetail(selected)] : []),
  );
  return body;
};
