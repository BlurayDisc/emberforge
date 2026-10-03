import { ditherRect } from './castleDither';
import { drawBrickWalls, drawTorch, STONE_COLORS } from './buildingParts';
import type { PaletteColor } from './palette';
import type { PixelCanvas } from './pixelCanvas';

interface RoofColors {
  roof: PaletteColor;
  roofDark: PaletteColor;
}

const SLATE: RoofColors = { roof: 'roofSlate', roofDark: 'roofSlateDark' };
const RED: RoofColors = { roof: 'roofRed', roofDark: 'roofRedDark' };

function drawConeRoof(art: PixelCanvas, centerX: number, baseY: number, width: number, height: number, colors: RoofColors): void {
  for (let row = 0; row < height; row++) {
    const progress = row / (height - 1);
    const halfWidth = Math.round(1 + progress * (width / 2 - 1));
    const left = centerX - halfWidth;
    const y = baseY - height + row;
    art.fill(row % 3 === 2 ? colors.roofDark : colors.roof, left, y, halfWidth * 2, 1);
    art.fill(colors.roofDark, left, y, Math.max(1, Math.round(halfWidth * 0.55)), 1);
    if (row % 3 !== 2) art.fill('snow', left + halfWidth * 2 - 2, y, 1, 1);
  }
  art.fill(colors.roofDark, centerX - width / 2 - 1, baseY - 1, width + 2, 2);
}

function drawFlag(art: PixelCanvas, poleX: number, topY: number): void {
  art.fill('timber', poleX, topY, 1, 14);
  art.fill('blood', poleX + 1, topY, 9, 6);
  art.fill('roofRedDark', poleX + 1, topY + 5, 9, 1);
  art.fill('gold', poleX + 4, topY + 2, 3, 2);
  art.fill('blood', poleX + 10, topY + 1, 2, 4);
}

function drawTowerBody(art: PixelCanvas, left: number, top: number, width: number, height: number): void {
  drawBrickWalls(art, left, top, width, height, STONE_COLORS);
  art.fill('stoneLight', left + Math.round(width * 0.66), top, Math.round(width * 0.34), height - 2);
  for (let row = 0; row < height - 2; row += 4) art.fill('stoneDark', left + Math.round(width * 0.66), top + row, Math.round(width * 0.34), 1);
  art.fill('stoneDark', left, top, Math.round(width * 0.2), height - 2);
  ditherRect(art, 'stoneDark', left + Math.round(width * 0.2), top, 4, height - 2, 6);
  ditherRect(art, 'shadow', left, top + height - 16, width, 14, 5);
  art.fill('stoneLight', left - 2, top, width + 4, 2);
  art.fill('stoneDark', left - 2, top + 2, width + 4, 1);
  for (let tooth = left - 2; tooth < left + width + 2; tooth += 6) art.fill('stone', tooth, top - 3, 4, 3);
}

function drawLitWindow(art: PixelCanvas, centerX: number, topY: number): void {
  art.fill('timber', centerX - 4, topY - 1, 8, 13);
  art.fill('lamp', centerX - 3, topY, 6, 11);
  art.fill('flame', centerX - 3, topY + 6, 6, 5);
  art.fill('timber', centerX - 1, topY, 2, 11);
  art.fill('timber', centerX - 3, topY + 4, 6, 1);
  art.fill('stoneLight', centerX - 5, topY - 2, 10, 1);
}

function drawArrowSlit(art: PixelCanvas, centerX: number, topY: number): void {
  art.fill('void', centerX - 1, topY, 2, 8);
  art.fill('void', centerX - 3, topY + 3, 6, 2);
}

function drawGate(art: PixelCanvas, centerX: number, baseY: number): void {
  art.fill('stoneLight', centerX - 15, baseY - 40, 30, 40);
  art.fill('stoneDark', centerX - 15, baseY - 40, 3, 40);
  for (let arch = 0; arch < 7; arch++) art.fill('stoneDark', centerX - 14 + arch * 2, baseY - 40 + arch % 2, 1, 1);
  art.fill('void', centerX - 11, baseY - 34, 22, 34);
  art.fill('void', centerX - 9, baseY - 38, 18, 4);
  art.fill('void', centerX - 6, baseY - 40, 12, 3);
  for (let bar = centerX - 9; bar < centerX + 10; bar += 3) art.fill('stoneDark', bar, baseY - 34, 1, 24);
  art.fill('stoneDark', centerX - 11, baseY - 26, 22, 1);
  art.fill('stoneDark', centerX - 11, baseY - 18, 22, 1);
  for (let tooth = centerX - 10; tooth < centerX + 11; tooth += 3) art.fill('stoneLight', tooth, baseY - 11, 1, 2);
  art.fill('timber', centerX - 14, baseY - 6, 28, 6);
  for (let plank = centerX - 14; plank < centerX + 14; plank += 4) art.fill('leatherDark', plank, baseY - 6, 1, 6);
  art.fill('leather', centerX - 14, baseY - 6, 28, 1);
}

function drawCoatOfArms(art: PixelCanvas, centerX: number, topY: number): void {
  art.fill('gold', centerX - 7, topY, 14, 18);
  art.fill('blood', centerX - 6, topY + 1, 12, 15);
  art.fill('roofRedDark', centerX - 6, topY + 12, 12, 4);
  art.fill('gold', centerX - 3, topY + 8, 6, 2);
  art.fill('gold', centerX - 2, topY + 10, 4, 3);
  art.fill('flameBright', centerX - 1, topY + 3, 2, 4);
  art.fill('flame', centerX - 2, topY + 5, 4, 3);
  for (let point = 0; point < 12; point += 3) art.fill(point % 6 === 0 ? 'gold' : 'blood', centerX - 6 + point, topY + 16, 3, 3);
}

// A royal castle seen from the front: a tall central tower over the gate, two round towers, and a banner on each side.
export function drawKeep(art: PixelCanvas, width: number, height: number): void {
  const centerX = Math.round(width / 2);
  const baseY = height - 1;
  const sideTowerWidth = 26;
  const sideTowerTop = 56;
  const centralWidth = 44;
  const centralTop = 34;

  drawBrickWalls(art, sideTowerWidth - 2, 66, width - sideTowerWidth * 2 + 4, height - 66, STONE_COLORS);
  for (let tooth = sideTowerWidth; tooth < width - sideTowerWidth; tooth += 8) art.fill('stone', tooth, 60, 5, 6);
  art.fill('stoneLight', sideTowerWidth - 2, 66, width - sideTowerWidth * 2 + 4, 2);

  for (const towerCenter of [sideTowerWidth / 2 + 2, width - sideTowerWidth / 2 - 2]) {
    drawConeRoof(art, towerCenter, sideTowerTop, sideTowerWidth + 6, 20, RED);
    drawTowerBody(art, towerCenter - sideTowerWidth / 2, sideTowerTop, sideTowerWidth, height - sideTowerTop);
    drawArrowSlit(art, towerCenter, sideTowerTop + 14);
    drawArrowSlit(art, towerCenter, sideTowerTop + 30);
  }
  drawFlag(art, 15, 22);
  drawFlag(art, width - 16, 22);

  drawConeRoof(art, centerX, centralTop, centralWidth + 8, 30, SLATE);
  drawTowerBody(art, centerX - centralWidth / 2, centralTop, centralWidth, height - centralTop);
  drawFlag(art, centerX, 0);
  drawLitWindow(art, centerX - 12, centralTop + 8);
  drawLitWindow(art, centerX + 12, centralTop + 8);
  drawCoatOfArms(art, centerX, centralTop + 24);
  drawGate(art, centerX, baseY);
  drawTorch(art, centerX - 22, baseY - 36);
  drawTorch(art, centerX + 20, baseY - 36);
  for (const bannerX of [sideTowerWidth + 6, width - sideTowerWidth - 12]) {
    art.fill('blood', bannerX, 74, 6, 16);
    art.fill('gold', bannerX + 2, 78, 2, 4);
    art.fill('roofRedDark', bannerX, 88, 6, 2);
  }
}
