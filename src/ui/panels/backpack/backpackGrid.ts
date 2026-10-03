import { BACKPACK_COLUMNS } from '../../../content/balance/backpack';
import { BASE_ITEMS } from '../../../content/baseItems';
import { requireById } from '../../../content/lookup';
import { MATERIALS } from '../../../content/materials';
import { backpackRowsOf, sizeOfBackpackEntry, type GameStore } from '../../../game';
import type { BackpackEntry } from '../../../model/backpack';
import { element } from '../../dom';
import { itemDisplayName, materialName } from '../../displayNames';
import { createItemIcon, createMaterialIcon } from '../../iconArt';
import type { ScreenPoint } from '../../modal';

export interface BackpackGridOptions {
  isSelected?: (entry: BackpackEntry) => boolean;
  onEntryClick: (entry: BackpackEntry, clickPoint: ScreenPoint) => void;
  // When set, the empty cells can be tapped. The inventory uses this to place a moving entry.
  onEmptyCellClick?: (column: number, row: number) => void;
}

function placeInGrid(target: HTMLElement, column: number, row: number, width: number, height: number): void {
  target.style.gridColumn = `${column + 1} / span ${width}`;
  target.style.gridRow = `${row + 1} / span ${height}`;
}

function createEntryCell(entry: BackpackEntry, options: BackpackGridOptions): HTMLElement {
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
  if (options.isSelected?.(entry)) cell.classList.add('selected');
  cell.addEventListener('click', (event) => {
    // A key press gives a click with no pointer position, so the menu opens at the cell instead.
    const cellBox = cell.getBoundingClientRect();
    const clickPoint = event.detail === 0 ? { x: cellBox.left + cellBox.width / 2, y: cellBox.top + cellBox.height / 2 } : { x: event.clientX, y: event.clientY };
    options.onEntryClick(entry, clickPoint);
  });
  return cell;
}

// The inventory and the merchant show the backpack the same way: the real grid with every entry in its place.
export function createBackpackGrid(store: GameStore, options: BackpackGridOptions): HTMLElement {
  const state = store.getState();
  const grid = element('div', 'backpack-grid');
  for (let row = 0; row < backpackRowsOf(state); row++) {
    for (let column = 0; column < BACKPACK_COLUMNS; column++) {
      const emptyCell = element('div', 'grid-empty');
      placeInGrid(emptyCell, column, row, 1, 1);
      if (options.onEmptyCellClick) {
        const onEmptyCellClick = options.onEmptyCellClick;
        emptyCell.classList.add('move-target');
        emptyCell.addEventListener('click', () => onEmptyCellClick(column, row));
      }
      grid.append(emptyCell);
    }
  }
  state.backpack.forEach((entry) => grid.append(createEntryCell(entry, options)));
  return grid;
}
