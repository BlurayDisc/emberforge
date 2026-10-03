import type { PaletteColor } from './palette';
import type { PixelCanvas } from './pixelCanvas';

export interface BuildingColors {
  wall: PaletteColor;
  wallDark: PaletteColor;
  roof: PaletteColor;
  roofDark: PaletteColor;
}

export const STONE_COLORS: BuildingColors = { wall: 'stone', wallDark: 'stoneDark', roof: 'stoneLight', roofDark: 'stoneDark' };

export function drawBrickWalls(art: PixelCanvas, x: number, y: number, width: number, height: number, colors: BuildingColors): void {
  art.fill(colors.wall, x, y, width, height);
  for (let row = 0; row < height; row += 4) {
    art.fill(colors.wallDark, x, y + row, width, 1);
    const offset = (row / 4) % 2 === 0 ? 0 : 4;
    for (let column = offset; column < width; column += 8) art.fill(colors.wallDark, x + column, y + row, 1, 4);
  }
  art.fill('outline', x, y + height - 2, width, 2);
}

export function drawTimberWalls(art: PixelCanvas, x: number, y: number, width: number, height: number, colors: BuildingColors): void {
  art.fill(colors.wall, x, y, width, height);
  art.fill('timber', x, y, width, 2);
  art.fill('timber', x, y + Math.round(height / 2), width, 2);
  art.fill('timber', x, y + height - 3, width, 3);
  for (let column = 0; column <= width - 3; column += Math.round((width - 3) / 4)) art.fill('timber', x + column, y, 3, height);
}

export function drawRoof(art: PixelCanvas, x: number, y: number, width: number, height: number, colors: BuildingColors): void {
  for (let row = 0; row < height; row++) {
    const progress = row / (height - 1);
    const halfWidth = Math.round(6 + progress * (width / 2 - 6));
    const left = x + width / 2 - halfWidth;
    art.fill(colors.roof, left, y + row, halfWidth * 2, 1);
    if (row % 3 === 2) art.fill(colors.roofDark, left, y + row, halfWidth * 2, 1);
    else for (let tile = row % 2 === 0 ? 0 : 3; tile < halfWidth * 2; tile += 6) art.fill(colors.roofDark, left + tile, y + row, 1, 1);
    art.fill(colors.roofDark, left, y + row, 2, 1);
    art.fill(colors.roofDark, left + halfWidth * 2 - 2, y + row, 2, 1);
  }
}

export function drawDoor(art: PixelCanvas, centerX: number, baseY: number, doorWidth: number, doorHeight: number, color: PaletteColor): void {
  const left = centerX - doorWidth / 2;
  art.fill('timber', left - 1, baseY - doorHeight - 1, doorWidth + 2, doorHeight + 1);
  art.fill(color, left, baseY - doorHeight, doorWidth, doorHeight);
  art.fill('outline', left, baseY - doorHeight, 1, 1);
  art.fill('outline', left + doorWidth - 1, baseY - doorHeight, 1, 1);
  art.fill('gold', left + doorWidth - 4, baseY - doorHeight / 2, 2, 2);
}

export function drawWindow(art: PixelCanvas, x: number, y: number, glow: PaletteColor): void {
  art.fill('timber', x - 1, y - 1, 12, 12);
  art.fill(glow, x, y, 10, 10);
  art.fill('timber', x + 4, y, 2, 10);
  art.fill('timber', x, y + 4, 10, 2);
}

export function drawHangingSign(art: PixelCanvas, x: number, y: number): void {
  art.fill('timber', x, y, 1, 14);
  art.fill('timber', x, y, 9, 1);
  art.fill('timber', x + 8, y, 1, 3);
  art.fill('goblin', x + 5, y + 3, 8, 8);
  art.fill('outline', x + 5, y + 3, 8, 1);
  art.fill('gold', x + 7, y + 5, 4, 4);
  art.fill('parchment', x + 7, y + 4, 4, 1);
}

export function drawChimneyWithSmoke(art: PixelCanvas, x: number, y: number): void {
  art.fill('brickDark', x, y, 8, 14);
  art.fill('brick', x + 1, y, 6, 14);
  art.fill('stone', x - 1, y, 10, 2);
  art.fill('ash', x + 2, y - 5, 3, 3);
  art.fill('stoneLight', x + 5, y - 10, 4, 4);
}

export function drawAwning(art: PixelCanvas, x: number, y: number, width: number): void {
  for (let stripe = 0; stripe < width; stripe += 4) {
    art.fill(Math.floor(stripe / 4) % 2 === 0 ? 'blood' : 'awningCream', x + stripe, y, 4, 7);
    art.fill('roofRedDark', x + stripe, y + 7, 4, 1);
  }
  art.fill('outline', x, y + 8, width, 1);
}

export function drawCratesAndBarrel(art: PixelCanvas, x: number, baseY: number): void {
  art.fill('timber', x, baseY - 9, 9, 9);
  art.fill('pathDark', x + 1, baseY - 8, 7, 7);
  art.fill('timber', x + 4, baseY - 8, 1, 7);
  art.fill('brickDark', x + 12, baseY - 11, 8, 11);
  art.fill('gold', x + 12, baseY - 8, 8, 1);
  art.fill('gold', x + 12, baseY - 4, 8, 1);
}

export function drawTorch(art: PixelCanvas, x: number, y: number): void {
  art.fill('timber', x, y + 3, 2, 8);
  art.fill('lamp', x - 1, y, 4, 4);
  art.fill('blood', x, y + 1, 2, 2);
}

export function drawGateTower(art: PixelCanvas, x: number, y: number, width: number, height: number): void {
  drawBrickWalls(art, x, y, width, height, STONE_COLORS);
  for (let tooth = 0; tooth < width; tooth += 6) art.fill('stone', x + tooth, y - 4, 4, 4);
}

export function drawGateArch(art: PixelCanvas, centerX: number, baseY: number): void {
  art.fill('stoneLight', centerX - 13, baseY - 31, 26, 31);
  art.fill('void', centerX - 10, baseY - 28, 20, 28);
  art.fill('void', centerX - 8, baseY - 31, 16, 3);
  for (let bar = centerX - 8; bar < centerX + 8; bar += 4) art.fill('stoneDark', bar, baseY - 28, 1, 20);
  art.fill('stoneDark', centerX - 10, baseY - 20, 20, 1);
}
