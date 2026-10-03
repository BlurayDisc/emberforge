import type { BuildingStyle } from '../content/buildings';
import type { PaletteColor } from './palette';
import { addOutline, createPixelCanvas, type PixelCanvas } from './pixelCanvas';

interface BuildingColors {
  wall: PaletteColor;
  wallDark: PaletteColor;
  roof: PaletteColor;
  roofDark: PaletteColor;
}

const COLORS_BY_STYLE: Record<BuildingStyle, BuildingColors> = {
  tavern: { wall: 'plaster', wallDark: 'pathDark', roof: 'roofRed', roofDark: 'roofRedDark' },
  workshop: { wall: 'brick', wallDark: 'brickDark', roof: 'roofSlate', roofDark: 'roofSlateDark' },
  merchant: { wall: 'plaster', wallDark: 'pathDark', roof: 'roofSlate', roofDark: 'roofSlateDark' },
  gate: { wall: 'stone', wallDark: 'stoneDark', roof: 'stoneLight', roofDark: 'stoneDark' },
  keep: { wall: 'stone', wallDark: 'stoneDark', roof: 'roofRed', roofDark: 'roofRedDark' },
};

function drawBrickWalls(art: PixelCanvas, x: number, y: number, width: number, height: number, colors: BuildingColors): void {
  art.fill(colors.wall, x, y, width, height);
  for (let row = 0; row < height; row += 4) {
    art.fill(colors.wallDark, x, y + row, width, 1);
    const offset = (row / 4) % 2 === 0 ? 0 : 4;
    for (let column = offset; column < width; column += 8) art.fill(colors.wallDark, x + column, y + row, 1, 4);
  }
  art.fill('outline', x, y + height - 2, width, 2);
}

function drawTimberWalls(art: PixelCanvas, x: number, y: number, width: number, height: number, colors: BuildingColors): void {
  art.fill(colors.wall, x, y, width, height);
  art.fill('timber', x, y, width, 2);
  art.fill('timber', x, y + Math.round(height / 2), width, 2);
  art.fill('timber', x, y + height - 3, width, 3);
  for (let column = 0; column <= width - 3; column += Math.round((width - 3) / 4)) art.fill('timber', x + column, y, 3, height);
}

function drawRoof(art: PixelCanvas, x: number, y: number, width: number, height: number, colors: BuildingColors): void {
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

function drawDoor(art: PixelCanvas, centerX: number, baseY: number, doorWidth: number, doorHeight: number, color: PaletteColor): void {
  const left = centerX - doorWidth / 2;
  art.fill('timber', left - 1, baseY - doorHeight - 1, doorWidth + 2, doorHeight + 1);
  art.fill(color, left, baseY - doorHeight, doorWidth, doorHeight);
  art.fill('outline', left, baseY - doorHeight, 1, 1);
  art.fill('outline', left + doorWidth - 1, baseY - doorHeight, 1, 1);
  art.fill('gold', left + doorWidth - 4, baseY - doorHeight / 2, 2, 2);
}

function drawWindow(art: PixelCanvas, x: number, y: number, glow: PaletteColor): void {
  art.fill('timber', x - 1, y - 1, 12, 12);
  art.fill(glow, x, y, 10, 10);
  art.fill('timber', x + 4, y, 2, 10);
  art.fill('timber', x, y + 4, 10, 2);
}

function drawHangingSign(art: PixelCanvas, x: number, y: number): void {
  art.fill('timber', x, y, 1, 14);
  art.fill('timber', x, y, 9, 1);
  art.fill('timber', x + 8, y, 1, 3);
  art.fill('goblin', x + 5, y + 3, 8, 8);
  art.fill('outline', x + 5, y + 3, 8, 1);
  art.fill('gold', x + 7, y + 5, 4, 4);
  art.fill('parchment', x + 7, y + 4, 4, 1);
}

function drawChimneyWithSmoke(art: PixelCanvas, x: number, y: number): void {
  art.fill('brickDark', x, y, 8, 14);
  art.fill('brick', x + 1, y, 6, 14);
  art.fill('stone', x - 1, y, 10, 2);
  art.fill('ash', x + 2, y - 5, 3, 3);
  art.fill('stoneLight', x + 5, y - 10, 4, 4);
}

function drawAwning(art: PixelCanvas, x: number, y: number, width: number): void {
  for (let stripe = 0; stripe < width; stripe += 4) {
    art.fill(Math.floor(stripe / 4) % 2 === 0 ? 'blood' : 'awningCream', x + stripe, y, 4, 7);
    art.fill('roofRedDark', x + stripe, y + 7, 4, 1);
  }
  art.fill('outline', x, y + 8, width, 1);
}

function drawCratesAndBarrel(art: PixelCanvas, x: number, baseY: number): void {
  art.fill('timber', x, baseY - 9, 9, 9);
  art.fill('pathDark', x + 1, baseY - 8, 7, 7);
  art.fill('timber', x + 4, baseY - 8, 1, 7);
  art.fill('brickDark', x + 12, baseY - 11, 8, 11);
  art.fill('gold', x + 12, baseY - 8, 8, 1);
  art.fill('gold', x + 12, baseY - 4, 8, 1);
}

function drawTorch(art: PixelCanvas, x: number, y: number): void {
  art.fill('timber', x, y + 3, 2, 8);
  art.fill('lamp', x - 1, y, 4, 4);
  art.fill('blood', x, y + 1, 2, 2);
}

function drawGateTower(art: PixelCanvas, x: number, y: number, width: number, height: number): void {
  drawBrickWalls(art, x, y, width, height, COLORS_BY_STYLE.gate);
  for (let tooth = 0; tooth < width; tooth += 6) art.fill('stone', x + tooth, y - 4, 4, 4);
}

function drawGateArch(art: PixelCanvas, centerX: number, baseY: number): void {
  art.fill('stoneLight', centerX - 13, baseY - 31, 26, 31);
  art.fill('void', centerX - 10, baseY - 28, 20, 28);
  art.fill('void', centerX - 8, baseY - 31, 16, 3);
  for (let bar = centerX - 8; bar < centerX + 8; bar += 4) art.fill('stoneDark', bar, baseY - 28, 1, 20);
  art.fill('stoneDark', centerX - 10, baseY - 20, 20, 1);
}

function drawTavern(art: PixelCanvas, width: number, height: number): void {
  const colors = COLORS_BY_STYLE.tavern;
  const roofHeight = Math.round(height * 0.42);
  const wallTop = roofHeight;
  const wallHeight = height - roofHeight;
  drawTimberWalls(art, 6, wallTop, width - 12, wallHeight, colors);
  drawRoof(art, 0, 0, width, roofHeight + 2, colors);
  drawWindow(art, 16, wallTop + 8, 'lamp');
  drawWindow(art, width - 26, wallTop + 8, 'lamp');
  drawDoor(art, width / 2, height - 1, 14, 22, 'brickDark');
  drawHangingSign(art, width - 12, wallTop + 4);
}

function drawWorkshop(art: PixelCanvas, width: number, height: number): void {
  const colors = COLORS_BY_STYLE.workshop;
  const roofHeight = Math.round(height * 0.42);
  drawChimneyWithSmoke(art, width - 22, 4);
  drawBrickWalls(art, 6, roofHeight, width - 12, height - roofHeight, colors);
  drawRoof(art, 0, 0, width, roofHeight + 2, colors);
  drawWindow(art, 16, roofHeight + 8, 'blood');
  drawWindow(art, width - 26, roofHeight + 8, 'lamp');
  drawDoor(art, width / 2, height - 1, 14, 22, 'brickDark');
  art.fill('stoneDark', 8, height - 8, 12, 4);
  art.fill('steel', 9, height - 9, 10, 2);
}

function drawMerchant(art: PixelCanvas, width: number, height: number): void {
  const colors = COLORS_BY_STYLE.merchant;
  const roofHeight = Math.round(height * 0.4);
  drawTimberWalls(art, 6, roofHeight, width - 12, height - roofHeight, colors);
  drawRoof(art, 0, 0, width, roofHeight + 2, colors);
  drawWindow(art, 14, roofHeight + 6, 'lamp');
  drawWindow(art, width - 24, roofHeight + 6, 'lamp');
  drawDoor(art, width / 2, height - 1, 14, 20, 'brickDark');
  drawAwning(art, width / 2 - 14, roofHeight + 2, 28);
  drawCratesAndBarrel(art, 4, height - 1);
}

function drawGate(art: PixelCanvas, width: number, height: number): void {
  const towerWidth = 18;
  drawGateTower(art, 0, 14, towerWidth, height - 14);
  drawGateTower(art, width - towerWidth, 14, towerWidth, height - 14);
  art.fill('stone', towerWidth, 22, width - towerWidth * 2, height - 22);
  drawGateArch(art, width / 2, height - 1);
  drawTorch(art, towerWidth + 2, height - 30);
  drawTorch(art, width - towerWidth - 4, height - 30);
  art.fill('blood', width / 2 - 3, 24, 6, 8);
  art.fill('gold', width / 2 - 1, 26, 2, 4);
}

function drawKeep(art: PixelCanvas, width: number, height: number): void {
  const towerWidth = 24;
  const centerLeft = Math.round(width / 2 - 18);
  drawBrickWalls(art, 0, 30, width, height - 30, COLORS_BY_STYLE.keep);
  for (let tooth = 0; tooth < width; tooth += 8) art.fill('stone', tooth, 26, 5, 5);
  drawGateTower(art, 0, 14, towerWidth, height - 14);
  drawGateTower(art, width - towerWidth, 14, towerWidth, height - 14);
  drawGateTower(art, centerLeft, 0, 36, height);
  for (const tower of [4, width - towerWidth + 4, centerLeft + 4]) art.fill('void', tower + 6, 22, 3, 8);
  art.fill('void', centerLeft + 14, 12, 8, 12);
  drawGateArch(art, width / 2, height - 1);
  art.fill('timber', centerLeft + 17, -10, 2, 12);
  art.fill('blood', centerLeft + 19, -10, 10, 6);
  art.fill('gold', centerLeft + 22, -8, 3, 2);
  for (const bannerX of [towerWidth + 6, width - towerWidth - 12]) {
    art.fill('blood', bannerX, 44, 6, 16);
    art.fill('gold', bannerX + 2, 48, 2, 4);
  }
}

const DRAWERS: Record<BuildingStyle, (art: PixelCanvas, width: number, height: number) => void> = {
  tavern: drawTavern,
  workshop: drawWorkshop,
  merchant: drawMerchant,
  gate: drawGate,
  keep: drawKeep,
};

export function drawBuildingArt(style: BuildingStyle, width: number, height: number): HTMLCanvasElement {
  const padding = 1;
  const art = createPixelCanvas(width + padding * 2, height + padding * 2);
  const shifted = {
    ...art,
    fill: (color: PaletteColor, x: number, y: number, fillWidth: number, fillHeight: number) =>
      art.fill(color, x + padding, y + padding, fillWidth, fillHeight),
  };
  DRAWERS[style](shifted, width, height);
  addOutline(art, 'outline');
  return art.canvas;
}
