import { BACKPACK_CELL_CAPACITY, BACKPACK_COLUMNS } from '../../content/balance/dungeonRun';
import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import type { MaterialStack } from '../../model/material';
import { element } from '../dom';
import type { PanelContext, PanelRenderer } from './panelContext';

let selectedCellIndex: number | null = null;

function describeStack(stack: MaterialStack): string {
  const material = requireById(MATERIALS, stack.materialId);
  return `${material.name} ×${stack.quantity} — Tier ${material.tier} ${material.category}, sells for ${material.sellValueCopper}c each`;
}

function renderCell(context: PanelContext, stack: MaterialStack | undefined, cellIndex: number): HTMLElement {
  const isSelected = selectedCellIndex === cellIndex;
  const cell = element('button', isSelected ? 'grid-cell selected' : 'grid-cell');
  cell.type = 'button';
  if (stack) {
    const material = requireById(MATERIALS, stack.materialId);
    cell.classList.add(`category-${material.category}`);
    cell.append(element('span', 'cell-name', material.name.slice(0, 6)), element('span', 'cell-count', String(stack.quantity)));
  }
  cell.addEventListener('click', () => {
    selectedCellIndex = cellIndex;
    context.requestRender();
  });
  return cell;
}

export const renderInventoryPanel: PanelRenderer = (context) => {
  const stacks = context.store.getState().backpackMaterials;
  const grid = element('div', 'backpack-grid');
  grid.style.gridTemplateColumns = `repeat(${BACKPACK_COLUMNS}, 1fr)`;
  for (let cellIndex = 0; cellIndex < BACKPACK_CELL_CAPACITY; cellIndex++) {
    grid.append(renderCell(context, stacks[cellIndex], cellIndex));
  }

  const selectedStack = selectedCellIndex === null ? undefined : stacks[selectedCellIndex];
  const detail = selectedStack ? describeStack(selectedStack) : 'Select a stack to see details.';
  return element(
    'div',
    'panel-body',
    element('p', 'hint', `Backpack: ${stacks.length} / ${BACKPACK_CELL_CAPACITY} cells used (materials stack to 99).`),
    grid,
    element('p', 'hint', detail),
  );
};
