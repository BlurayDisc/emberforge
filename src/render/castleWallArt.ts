import { createRandom } from '../kernel/random';
import { LOGICAL_WIDTH } from '../kernel/stageSize';
import { ditherFade, ditherRect } from './castleDither';
import type { PaletteColor } from './palette';
import type { PixelCanvas } from './pixelCanvas';

export const CURTAIN_WALL_TOP_Y = 166;
export const CURTAIN_WALL_BASE_Y = 190;
export const GATEHOUSE_X = 330;
export const GATEHOUSE_TOWER_TOP = 144;
const TOWER_TOP = GATEHOUSE_TOWER_TOP;

function drawStoneFace(art: PixelCanvas, x: number, y: number, width: number, height: number, lit: boolean): void {
  art.fill(lit ? 'stoneLight' : 'stone', x, y, width, height);
  for (let row = 0; row < height; row += 5) {
    art.fill('stoneDark', x, y + row, width, 1);
    const offset = (row / 5) % 2 === 0 ? 0 : 5;
    for (let column = offset; column < width; column += 10) art.fill('stoneDark', x + column, y + row, 1, 5);
  }
  ditherFade(art, 'shadow', x, y + Math.floor(height / 2), width, Math.ceil(height / 2), 0, 9);
}

function drawMerlons(art: PixelCanvas, x: number, y: number, width: number, merlonWidth: number, gapWidth: number): void {
  for (let merlonX = x; merlonX < x + width; merlonX += merlonWidth + gapWidth) {
    const visibleWidth = Math.min(merlonWidth, x + width - merlonX);
    art.fill('outline', merlonX - 1, y - 7, visibleWidth + 2, 8);
    art.fill('stone', merlonX, y - 6, visibleWidth, 7);
    art.fill('stoneLight', merlonX, y - 6, visibleWidth, 1);
    art.fill('stoneDark', merlonX + visibleWidth - 2, y - 5, 2, 6);
  }
}

export function drawCurtainWall(art: PixelCanvas): void {
  const height = CURTAIN_WALL_BASE_Y - CURTAIN_WALL_TOP_Y;
  art.fill('outline', 0, CURTAIN_WALL_TOP_Y - 1, LOGICAL_WIDTH, height + 2);
  drawStoneFace(art, 0, CURTAIN_WALL_TOP_Y, LOGICAL_WIDTH, height, false);
  art.fill('stoneLight', 0, CURTAIN_WALL_TOP_Y, LOGICAL_WIDTH, 2);
  drawMerlons(art, 0, CURTAIN_WALL_TOP_Y, LOGICAL_WIDTH, 9, 6);
  for (let slit = 18; slit < LOGICAL_WIDTH; slit += 46) {
    art.fill('void', slit, CURTAIN_WALL_TOP_Y + 8, 2, 9);
    art.fill('stoneDark', slit - 1, CURTAIN_WALL_TOP_Y + 7, 4, 1);
  }
}

interface TowerLook {
  roof: PaletteColor;
  roofDark: PaletteColor;
  roofHeight: number;
}

export function drawRoundTower(art: PixelCanvas, centerX: number, topY: number, baseY: number, width: number, look: TowerLook): void {
  const left = centerX - width / 2;
  const height = baseY - topY;
  art.fill('outline', left - 1, topY - 1, width + 2, height + 2);
  drawStoneFace(art, left, topY, width, height, false);
  art.fill('stoneLight', left + Math.round(width * 0.62), topY, Math.round(width * 0.38), height);
  for (let row = 0; row < height; row += 5) art.fill('stoneDark', left + Math.round(width * 0.62), topY + row, Math.round(width * 0.38), 1);
  art.fill('stoneDark', left, topY, Math.round(width * 0.22), height);
  ditherFade(art, 'shadow', left, topY + height - 14, width, 14, 0, 10);
  art.fill('stoneLight', left - 2, topY, width + 4, 2);
  art.fill('stoneDark', left - 2, topY + 2, width + 4, 1);
  for (let row = 0; row < look.roofHeight; row++) {
    const progress = row / (look.roofHeight - 1);
    const halfWidth = Math.round(1 + progress * (width / 2 + 3));
    art.fill('outline', centerX - halfWidth - 1, topY - look.roofHeight + row, halfWidth * 2 + 2, 1);
    art.fill(row % 3 === 2 ? look.roofDark : look.roof, centerX - halfWidth, topY - look.roofHeight + row, halfWidth * 2, 1);
    art.fill(look.roofDark, centerX - halfWidth, topY - look.roofHeight + row, 2, 1);
  }
  art.fill('timber', centerX, topY - look.roofHeight - 10, 1, 11);
}

export const SLATE_ROOF: TowerLook = { roof: 'roofSlate', roofDark: 'roofSlateDark', roofHeight: 20 };
export const RED_ROOF: TowerLook = { roof: 'roofRed', roofDark: 'roofRedDark', roofHeight: 14 };

export function drawGatehouse(art: PixelCanvas): void {
  const lift = TOWER_TOP - 120;
  const towerWidth = 22;
  const gateWidth = 24;
  const left = GATEHOUSE_X - gateWidth / 2 - towerWidth;
  const right = GATEHOUSE_X + gateWidth / 2;
  drawRoundTower(art, left + towerWidth / 2, TOWER_TOP, CURTAIN_WALL_BASE_Y, towerWidth, RED_ROOF);
  drawRoundTower(art, right + towerWidth / 2, TOWER_TOP, CURTAIN_WALL_BASE_Y, towerWidth, RED_ROOF);
  art.fill('outline', GATEHOUSE_X - gateWidth / 2 - 1, 136 + lift, gateWidth + 2, CURTAIN_WALL_BASE_Y - 136 + lift);
  drawStoneFace(art, GATEHOUSE_X - gateWidth / 2, 136 + lift, gateWidth, CURTAIN_WALL_BASE_Y - 136 + lift, false);
  drawMerlons(art, GATEHOUSE_X - gateWidth / 2, 138 + lift, gateWidth, 6, 3);
  art.fill('void', GATEHOUSE_X - 8, 150 + lift, 16, CURTAIN_WALL_BASE_Y - 150 + lift);
  art.fill('void', GATEHOUSE_X - 6, 146 + lift, 12, 5);
  art.fill('stoneLight', GATEHOUSE_X - 10, 148 + lift, 20, 2);
  for (let bar = GATEHOUSE_X - 7; bar < GATEHOUSE_X + 8; bar += 3) art.fill('stoneDark', bar, 150 + lift, 1, 14);
  art.fill('stoneDark', GATEHOUSE_X - 8, 158 + lift, 16, 1);
  art.fill('blood', GATEHOUSE_X - 3, 138 + lift, 6, 8);
  art.fill('gold', GATEHOUSE_X - 1, 140, 2, 4);
  for (const windowX of [left + 9, right + 9]) art.fill('void', windowX, 142 + lift, 3, 8);
}

// The wall hides the near side of the ward. Only roofs and a stretch of yard show between the merlons of the parapet.
export function drawWard(art: PixelCanvas): void {
  const random = createRandom(53).fork('ward');
  art.fill('pathDark', 0, CURTAIN_WALL_BASE_Y, LOGICAL_WIDTH, 30);
  for (let cobble = 0; cobble < 420; cobble++) art.fill(random.chance(0.5) ? 'pathLight' : 'soil', random.nextInt(0, LOGICAL_WIDTH - 2), random.nextInt(CURTAIN_WALL_BASE_Y, CURTAIN_WALL_BASE_Y + 29), 2, 1);
  ditherRect(art, 'shadow', 0, CURTAIN_WALL_BASE_Y, LOGICAL_WIDTH, 5, 9);
  const roofs: ReadonlyArray<readonly [number, number, PaletteColor, PaletteColor]> = [
    [112, 38, 'roofRed', 'roofRedDark'], [166, 30, 'roofSlate', 'roofSlateDark'], [232, 42, 'roofRed', 'roofRedDark'],
    [300, 26, 'roofSlate', 'roofSlateDark'], [380, 36, 'roofRed', 'roofRedDark'], [440, 28, 'roofSlate', 'roofSlateDark'],
  ];
  for (const [centerX, width, roof, roofDark] of roofs) {
    art.fill('outline', centerX - width / 2 - 1, CURTAIN_WALL_BASE_Y + 6, width + 2, 24);
    art.fill('plaster', centerX - width / 2, CURTAIN_WALL_BASE_Y + 18, width, 12);
    for (let row = 0; row < 12; row++) {
      const inset = Math.floor(row * 0.7);
      art.fill(row % 3 === 2 ? roofDark : roof, centerX - width / 2 + inset, CURTAIN_WALL_BASE_Y + 6 + row, width - inset * 2, 1);
    }
    art.fill('timber', centerX - 2, CURTAIN_WALL_BASE_Y + 22, 4, 8);
    art.fill('lamp', centerX - width / 2 + 4, CURTAIN_WALL_BASE_Y + 21, 3, 3);
  }
  art.fill('stoneDark', 0, CURTAIN_WALL_BASE_Y - 1, LOGICAL_WIDTH, 1);
}
