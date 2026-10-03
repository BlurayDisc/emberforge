import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../kernel/stageSize';
import { createRandom } from '../kernel/random';
import { ditherFade } from './castleDither';
import { createPixelCanvas, type PixelCanvas } from './pixelCanvas';

export const PARAPET_TOP_Y = 196;
const PARAPET_FACE_TOP_Y = 210;
export const WALKWAY_TOP_Y = 234;
export const FRAME_TOWER_WIDTH = 24;

function drawParapet(art: PixelCanvas): void {
  art.fill('outline', 0, PARAPET_FACE_TOP_Y - 1, LOGICAL_WIDTH, WALKWAY_TOP_Y - PARAPET_FACE_TOP_Y + 2);
  art.fill('stone', 0, PARAPET_FACE_TOP_Y, LOGICAL_WIDTH, WALKWAY_TOP_Y - PARAPET_FACE_TOP_Y);
  for (let row = 0; row < WALKWAY_TOP_Y - PARAPET_FACE_TOP_Y; row += 6) {
    art.fill('stoneDark', 0, PARAPET_FACE_TOP_Y + row, LOGICAL_WIDTH, 1);
    const offset = (row / 6) % 2 === 0 ? 0 : 8;
    for (let column = offset; column < LOGICAL_WIDTH; column += 16) art.fill('stoneDark', column, PARAPET_FACE_TOP_Y + row, 1, 6);
    for (let column = offset; column < LOGICAL_WIDTH; column += 16) art.fill('stoneLight', column + 1, PARAPET_FACE_TOP_Y + row + 1, 13, 1);
  }
  art.fill('stoneLight', 0, PARAPET_FACE_TOP_Y - 3, LOGICAL_WIDTH, 3);
  art.fill('stoneDark', 0, PARAPET_FACE_TOP_Y, LOGICAL_WIDTH, 1);
  for (let merlonX = 30; merlonX < LOGICAL_WIDTH - FRAME_TOWER_WIDTH; merlonX += 38) {
    art.fill('outline', merlonX - 1, PARAPET_TOP_Y - 1, 20, PARAPET_FACE_TOP_Y - PARAPET_TOP_Y);
    art.fill('stone', merlonX, PARAPET_TOP_Y, 18, PARAPET_FACE_TOP_Y - PARAPET_TOP_Y);
    art.fill('stoneLight', merlonX, PARAPET_TOP_Y, 18, 2);
    art.fill('stoneLight', merlonX, PARAPET_TOP_Y, 3, PARAPET_FACE_TOP_Y - PARAPET_TOP_Y);
    art.fill('stoneDark', merlonX + 14, PARAPET_TOP_Y + 2, 4, PARAPET_FACE_TOP_Y - PARAPET_TOP_Y - 2);
    art.fill('void', merlonX + 8, PARAPET_TOP_Y + 4, 2, 8);
  }
  ditherFade(art, 'shadow', 0, WALKWAY_TOP_Y - 10, LOGICAL_WIDTH, 10, 0, 8);
}

function drawWalkway(art: PixelCanvas): void {
  const random = createRandom(67).fork('walkway');
  let rowTop = WALKWAY_TOP_Y;
  for (let rowIndex = 0; rowTop < LOGICAL_HEIGHT; rowIndex++) {
    const rowHeight = 5 + rowIndex * 2;
    const slabWidth = 22 + rowIndex * 7;
    for (let x = -((rowIndex * 11) % slabWidth); x < LOGICAL_WIDTH; x += slabWidth) {
      art.fill(random.chance(0.5) ? 'floorLight' : 'stoneLight', x, rowTop, slabWidth, rowHeight);
      art.fill('floorDark', x, rowTop, 1, rowHeight);
    }
    art.fill('floorDark', 0, rowTop, LOGICAL_WIDTH, 1);
    rowTop += rowHeight;
  }
  ditherFade(art, 'shadow', 0, WALKWAY_TOP_Y, LOGICAL_WIDTH, 22, 9, 0);
}

// The two stone columns that frame the view are sprites of their own, so drifting clouds pass behind them.
export function drawFrameTower(): HTMLCanvasElement {
  const art = createPixelCanvas(FRAME_TOWER_WIDTH + 2, LOGICAL_HEIGHT);
  const left = 1;
  art.fill('outline', left - 1, 0, FRAME_TOWER_WIDTH + 2, LOGICAL_HEIGHT);
  art.fill('stone', left, 0, FRAME_TOWER_WIDTH, LOGICAL_HEIGHT);
  for (let row = 0; row < LOGICAL_HEIGHT; row += 8) {
    art.fill('stoneDark', left, row, FRAME_TOWER_WIDTH, 1);
    const offset = (row / 8) % 2 === 0 ? 0 : 6;
    for (let column = offset; column < FRAME_TOWER_WIDTH; column += 12) art.fill('stoneDark', left + column, row, 1, 8);
  }
  art.fill('stoneLight', left, 0, 4, LOGICAL_HEIGHT);
  art.fill('stoneDark', left + FRAME_TOWER_WIDTH - 6, 0, 6, LOGICAL_HEIGHT);
  for (const bandY of [60, 150]) {
    art.fill('stoneLight', left, bandY, FRAME_TOWER_WIDTH, 3);
    art.fill('stoneDark', left, bandY + 3, FRAME_TOWER_WIDTH, 2);
  }
  art.fill('void', left + 10, 90, 3, 22);
  art.fill('stoneDark', left + 9, 89, 5, 1);
  return art.canvas;
}

export function drawParapetAndWalkway(art: PixelCanvas): void {
  drawParapet(art);
  drawWalkway(art);
}
