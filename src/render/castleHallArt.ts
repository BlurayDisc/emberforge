import { castleSpot } from '../content/castle';
import { createRandom } from '../kernel/random';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../kernel/stageSize';
import { ditherDisc, ditherFade, ditherRect } from './castleDither';
import { drawFoundingTapestry, drawPrincessPortrait, drawStainedWindow } from './castleHallDecorArt';
import { drawHallThrones } from './castleHallThronesArt';
import { createPixelCanvas, type PixelCanvas } from './pixelCanvas';

const WALL_BASE_Y = 128;
const DAIS_LEFT = 150;
const DAIS_RIGHT = 334;
const CARPET_CENTER_X = 242;

export interface HallFlame {
  x: number;
  y: number;
  size: 'torch' | 'brazier';
}

// The backdrop draws the holders. The view lays animated flames over these points. y is the bottom of the flame.
export const HALL_FLAMES: readonly HallFlame[] = [
  { x: 96, y: 78, size: 'torch' },
  { x: 388, y: 78, size: 'torch' },
  { x: 138, y: 156, size: 'brazier' },
  { x: 346, y: 156, size: 'brazier' },
];

function drawWall(art: PixelCanvas): void {
  const random = createRandom(41).fork('hall-wall');
  art.fill('stone', 0, 0, LOGICAL_WIDTH, WALL_BASE_Y);
  for (let row = 0; row < WALL_BASE_Y; row += 8) {
    art.fill('stoneDark', 0, row, LOGICAL_WIDTH, 1);
    const offset = (row / 8) % 2 === 0 ? 0 : 12;
    for (let column = offset; column < LOGICAL_WIDTH; column += 24) art.fill('stoneDark', column, row, 1, 8);
    for (let column = offset; column < LOGICAL_WIDTH; column += 24) art.fill('stoneLight', column + 1, row + 1, 22, 1);
  }
  for (let speckle = 0; speckle < 500; speckle++) art.fill(random.chance(0.5) ? 'stoneLight' : 'stoneDark', random.nextInt(0, LOGICAL_WIDTH - 1), random.nextInt(0, WALL_BASE_Y - 1), 1, 1);
  ditherFade(art, 'shadow', 0, 0, LOGICAL_WIDTH, 44, 14, 0);
  ditherFade(art, 'shadow', 0, WALL_BASE_Y - 20, LOGICAL_WIDTH, 20, 0, 6);
  art.fill('timber', 0, 0, LOGICAL_WIDTH, 5);
  art.fill('leatherDark', 0, 5, LOGICAL_WIDTH, 2);
  for (let beam = 20; beam < LOGICAL_WIDTH; beam += 60) art.fill('timber', beam, 0, 8, 12);
}

// Floor tiles shrink toward the back wall, so the hall looks deep.
function drawFloor(art: PixelCanvas): void {
  let rowTop = WALL_BASE_Y;
  for (let rowIndex = 0; rowTop < LOGICAL_HEIGHT; rowIndex++) {
    const rowHeight = Math.round(4 + rowIndex * 1.3);
    const depth = (rowTop - WALL_BASE_Y) / (LOGICAL_HEIGHT - WALL_BASE_Y);
    const tileWidth = Math.round(12 + depth * 40);
    for (let x = CARPET_CENTER_X - Math.ceil(CARPET_CENTER_X / tileWidth + 1) * tileWidth; x < LOGICAL_WIDTH; x += tileWidth) {
      const tileNumber = Math.round((x - CARPET_CENTER_X) / tileWidth);
      art.fill((tileNumber + rowIndex) % 2 === 0 ? 'floorLight' : 'floorDark', x, rowTop, tileWidth, rowHeight);
      art.fill('stoneDark', x, rowTop, 1, rowHeight);
    }
    art.fill('stoneDark', 0, rowTop, LOGICAL_WIDTH, 1);
    rowTop += rowHeight;
  }
  ditherFade(art, 'shadow', 0, WALL_BASE_Y, LOGICAL_WIDTH, 16, 8, 0);
}

function drawCarpet(art: PixelCanvas): void {
  for (let y = WALL_BASE_Y; y < LOGICAL_HEIGHT; y++) {
    const depth = (y - WALL_BASE_Y) / (LOGICAL_HEIGHT - WALL_BASE_Y);
    const halfWidth = Math.round(18 + depth * 24);
    const left = CARPET_CENTER_X - halfWidth;
    art.fill('carpet', left, y, halfWidth * 2, 1);
    art.fill('gold', left, y, 2, 1);
    art.fill('gold', left + halfWidth * 2 - 2, y, 2, 1);
    art.fill('carpetDark', left + 3, y, 1, 1);
    art.fill('carpetDark', left + halfWidth * 2 - 4, y, 1, 1);
    if (Math.floor(y / 14) % 2 === 0 && y % 14 < 3) art.fill('carpetDark', CARPET_CENTER_X - halfWidth + 6, y, halfWidth * 2 - 12, 1);
    if (y % 14 === 6) art.fill('gold', CARPET_CENTER_X - 1, y, 2, 1);
  }
}

function drawDais(art: PixelCanvas): void {
  art.fill('floorLight', DAIS_LEFT, WALL_BASE_Y, DAIS_RIGHT - DAIS_LEFT, 18);
  for (let x = DAIS_LEFT; x < DAIS_RIGHT; x += 16) art.fill('floorDark', x, WALL_BASE_Y, 8, 18);
  art.fill('stoneDark', DAIS_LEFT, WALL_BASE_Y, DAIS_RIGHT - DAIS_LEFT, 1);
  for (let step = 0; step < 3; step++) {
    const inset = step * 0;
    const top = 146 + step * 4;
    art.fill(step === 0 ? 'stoneLight' : step === 1 ? 'stone' : 'stoneDark', DAIS_LEFT - inset, top, DAIS_RIGHT - DAIS_LEFT + inset * 2, 4);
    art.fill('outline', DAIS_LEFT - inset, top + 3, DAIS_RIGHT - DAIS_LEFT, 1);
    for (let x = DAIS_LEFT; x < DAIS_RIGHT; x += 12) art.fill('stoneDark', x, top, 1, 3);
  }
  const carpetLeft = CARPET_CENTER_X - 20;
  art.fill('carpet', carpetLeft, WALL_BASE_Y, 40, 30);
  art.fill('gold', carpetLeft, WALL_BASE_Y, 2, 30);
  art.fill('gold', carpetLeft + 38, WALL_BASE_Y, 2, 30);
  art.fill('outline', DAIS_LEFT - 1, WALL_BASE_Y, 1, 30);
  art.fill('outline', DAIS_RIGHT, WALL_BASE_Y, 1, 30);
}

function drawPillar(art: PixelCanvas, centerX: number, baseY: number, width: number): void {
  const left = centerX - width / 2;
  art.fill('stone', left, 0, width, baseY);
  art.fill('stoneLight', left, 0, 3, baseY);
  art.fill('stoneDark', left + width - 5, 0, 5, baseY);
  for (let flute = left + 6; flute < left + width - 5; flute += 5) art.fill('stoneDark', flute, 8, 1, baseY - 14);
  art.fill('stoneLight', left - 3, 0, width + 6, 12);
  art.fill('stoneDark', left - 3, 10, width + 6, 2);
  art.fill('stoneLight', left - 3, baseY - 8, width + 6, 8);
  art.fill('stoneDark', left - 3, baseY - 2, width + 6, 2);
  art.fill('outline', left - 3, baseY, width + 6, 1);
  art.fill('carpetDark', left + 2, 18, width - 4, 36);
  art.fill('gold', left + 2, 18, width - 4, 1);
  art.fill('gold', centerX - 2, 30, 4, 8);
}

function drawTorchHolder(art: PixelCanvas, centerX: number, flameY: number): void {
  art.fill('steelDark', centerX - 3, flameY + 4, 6, 2);
  art.fill('timber', centerX - 1, flameY + 4, 2, 10);
  art.fill('steelDark', centerX - 4, flameY + 14, 8, 2);
  art.fill('steelDark', centerX - 3, flameY, 1, 5);
  art.fill('steelDark', centerX + 2, flameY, 1, 5);
  ditherDisc(art, 'lamp', centerX, flameY + 2, 15, 2);
}

function drawBrazier(art: PixelCanvas, centerX: number, flameY: number): void {
  art.fill('steelDark', centerX - 8, flameY, 16, 4);
  art.fill('steel', centerX - 7, flameY, 14, 1);
  art.fill('steelDark', centerX - 5, flameY + 4, 10, 3);
  art.fill('steelDark', centerX - 1, flameY + 7, 2, 8);
  art.fill('steelDark', centerX - 6, flameY + 15, 12, 2);
  art.fill('flame', centerX - 6, flameY - 2, 12, 2);
  ditherDisc(art, 'lamp', centerX, flameY - 6, 22, 2);
}

function drawChandelier(art: PixelCanvas, centerX: number): void {
  art.fill('steelDark', centerX, 0, 1, 26);
  art.fill('steelDark', centerX - 18, 26, 36, 3);
  art.fill('steel', centerX - 18, 26, 36, 1);
  art.fill('steelDark', centerX - 14, 29, 28, 2);
  for (const candleX of [-17, -8, 2, 12, 16]) {
    art.fill('bone', centerX + candleX, 20, 2, 6);
    art.fill('flame', centerX + candleX, 17, 2, 3);
    art.fill('flameBright', centerX + candleX, 18, 1, 1);
  }
  art.fill('steelDark', centerX - 1, 31, 3, 5);
}

function drawWindowLightOnFloor(art: PixelCanvas, centerX: number): void {
  for (let row = 0; row < 40; row++) {
    ditherRect(art, 'cloud', centerX - 12 + Math.round(row * 0.9), WALL_BASE_Y + 6 + row, 24, 1, 4 - Math.floor(row / 12));
  }
}

export function drawHallBackdrop(): HTMLCanvasElement {
  const art = createPixelCanvas(LOGICAL_WIDTH, LOGICAL_HEIGHT);
  drawWall(art);
  drawFloor(art);
  const window = castleSpot('stained-window');
  drawWindowLightOnFloor(art, window.x + 6);
  drawWindowLightOnFloor(art, 440);
  drawStainedWindow(art, window.x, window.y, window.width, window.height);
  drawStainedWindow(art, 430, window.y, window.width, window.height);
  drawPrincessPortrait(art);
  drawFoundingTapestry(art);
  drawChandelier(art, 170);
  drawChandelier(art, 314);
  drawTorchHolder(art, 96, 74);
  drawTorchHolder(art, 388, 74);
  drawCarpet(art);
  drawDais(art);
  drawHallThrones(art);
  drawBrazier(art, 138, 156);
  drawBrazier(art, 346, 156);
  drawPillar(art, 14, 190, 20);
  drawPillar(art, 466, 190, 20);
  return art.canvas;
}
