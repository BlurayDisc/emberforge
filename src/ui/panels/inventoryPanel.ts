import { BACKPACK_COLUMNS } from '../../content/balance/backpack';
import { BASE_ITEMS } from '../../content/baseItems';
import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import { backpackRowsOf, describeStorage, equipItemCommand, listEquipOptions, sizeOfBackpackEntry } from '../../game';
import type { BackpackEntry } from '../../model/backpack';
import type { Item } from '../../model/item';
import { actionButton, element } from '../dom';
import { heroDisplayName, itemDisplayName, materialName } from '../displayNames';
import { describeRejection, t } from '../i18n';
import { createItemIcon, createMaterialIcon } from '../iconArt';
import { createItemCard } from '../itemText';
import type { PanelContext, PanelRenderer } from './panelContext';

interface SelectedPosition {
  column: number;
  row: number;
}

let selectedPosition: SelectedPosition | null = null;

export function resetInventorySelection(): void {
  selectedPosition = null;
}

function placeInGrid(target: HTMLElement, column: number, row: number, width: number, height: number): void {
  target.style.gridColumn = `${column + 1} / span ${width}`;
  target.style.gridRow = `${row + 1} / span ${height}`;
}

function renderEntry(context: PanelContext, entry: BackpackEntry): HTMLElement {
  const content = entry.content;
  const { width, height } = sizeOfBackpackEntry(entry);
  const cell = element('button', 'grid-entry');
  cell.type = 'button';
  placeInGrid(cell, entry.column, entry.row, width, height);

  if (content.kind === 'item') {
    cell.classList.add(`quality-border-${content.item.quality}`);
    const base = requireById(BASE_ITEMS, content.item.baseId);
    cell.title = itemDisplayName(content.item);
    cell.append(createItemIcon(content.item.baseId, content.item.materialId, base.mainCategory, 3));
  } else {
    const material = requireById(MATERIALS, content.materialId);
    cell.classList.add(`category-${material.category}`);
    cell.title = materialName(material.id);
    cell.append(createMaterialIcon(material.id, material.category, 2));
  }
  if (selectedPosition?.column === entry.column && selectedPosition.row === entry.row) cell.classList.add('selected');
  cell.addEventListener('click', () => {
    selectedPosition = { column: entry.column, row: entry.row };
    context.requestRender();
  });
  return cell;
}

function renderEquipButtons(context: PanelContext, item: Item): HTMLElement {
  const state = context.store.getState();
  const buttons = listEquipOptions(state, item).map((option) => {
    const heroName = heroDisplayName(option.heroName);
    const label = option.problem === null
      ? t('inventory.equipOn', { hero: heroName })
      : t('inventory.equipOnProblem', { hero: heroName, problem: t(option.problem.key, option.problem.params) });
    return actionButton(
      label,
      () => {
        const result = context.store.execute(equipItemCommand(option.heroId, item.id));
        context.notify(result.accepted ? t('heroes.equips', { hero: heroName, item: itemDisplayName(item) }) : describeRejection(result.rejection));
      },
      { disabled: option.problem !== null, className: 'action-button small-button' },
    );
  });
  return element('div', 'button-column', ...buttons);
}

function renderDetail(context: PanelContext, entry: BackpackEntry | undefined): HTMLElement {
  if (!entry) return element('p', 'hint', t('inventory.select'));
  if (entry.content.kind === 'item') {
    return element('div', 'detail-row', createItemCard(entry.content.item), renderEquipButtons(context, entry.content.item));
  }
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

export const renderInventoryPanel: PanelRenderer = (context) => {
  const entries = context.store.getState().backpack;
  const storage = describeStorage(context.store.getState());
  const grid = element('div', 'backpack-grid');
  const state = context.store.getState();
  for (let row = 0; row < backpackRowsOf(state); row++) {
    for (let column = 0; column < BACKPACK_COLUMNS; column++) {
      const emptyCell = element('div', 'grid-empty');
      placeInGrid(emptyCell, column, row, 1, 1);
      grid.append(emptyCell);
    }
  }
  entries.forEach((entry) => grid.append(renderEntry(context, entry)));

  const selected = entries.find((entry) => entry.column === selectedPosition?.column && entry.row === selectedPosition?.row);
  const body = element('div', 'panel-body');
  body.append(element('p', 'hint', t('inventory.hint')), element('p', 'hint', t('inventory.space', { used: storage.usedCells, total: storage.totalCells })), grid, renderDetail(context, selected));
  return body;
};
