import { dungeonBackdropCanvas } from './artProviders';
import { element } from './dom';

// The same battle picture as the dungeon details popup fills the row behind the text.
export function addDungeonBackdrop(row: HTMLElement, dungeonId: string): void {
  const canvas = dungeonBackdropCanvas(dungeonId);
  if (!canvas) return;
  canvas.classList.add('row-backdrop-art');
  row.classList.add('has-backdrop');
  row.prepend(canvas, element('div', 'row-backdrop-shade'));
}
