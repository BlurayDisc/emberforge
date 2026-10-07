import { paintMageHead } from '../headgear/mageHead';
import { darken, lighten, type HeroColors, type Hex } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';
import { litByFire } from './mageFireLight';
import { FIGURE_CENTER_X, paintCastingArm, paintFireball, paintStaff, paintStaffArm } from './mageFigureProps';
import { finishPortrait, startPortrait } from './portraitFrame';

const HEAD_TOP = 3;
const SKIRT_TOP = 24;
const HEM_ROW = 55;
const BOOT: Hex = '#3a2418';

function paintHair(painter: SpritePainter, colors: HeroColors): void {
  const hairBase = lighten(colors.hair, 1.12);
  const hairLight = litByFire(lighten(colors.hair, 1.2), 0.6);
  const hairGlint = litByFire('#ffe9a0', 0.1);
  const hairDeep = darken(colors.hair, 0.5);
  const hairMid = darken(colors.hair, 0.78);
  const leftLock = (row: number): number => 9 + Math.round(Math.sin(row * 0.4) * 1.5) - (row > 28 ? 1 : 0);
  for (let row = 10; row <= 40; row++) {
    const left = leftLock(row);
    const width = row < 28 ? 5 : row < 34 ? 4 : 3;
    painter.span(hairBase, left, left + width - 1, row);
    painter.dot(hairDeep, left, row);
    painter.dot(hairLight, left + 1, row);
    if (row % 5 === 2) painter.dot(hairGlint, left + 1, row);
    if (row % 4 === 1) painter.dot(hairLight, left + 2, row);
    painter.span(hairMid, left + width - 2, left + width - 1, row);
    painter.dot(hairDeep, left + width - 1, row);
  }
  painter.span(hairBase, leftLock(41), leftLock(41) + 1, 41);
  painter.dot(hairDeep, leftLock(41) + 1, 41);
  painter.dot(hairDeep, leftLock(42), 42);
  for (let row = 10; row <= 24; row++) {
    const left = 23 + Math.round(Math.sin(row * 0.5) * 0.8);
    painter.span(hairBase, left, left + 2, row);
    painter.dot(hairLight, left, row);
    painter.dot(hairMid, left + 1, row);
    painter.dot(hairDeep, left + 2, row);
  }
  painter.dot(hairDeep, 24, 25);
}

function paintBodice(painter: SpritePainter, colors: HeroColors): void {
  const halfWidths = [5, 5, 4, 4, 3, 3, 3, 3, 3, 4];
  halfWidths.forEach((halfWidth, index) => {
    const row = 14 + index;
    painter.span(colors.cloth, FIGURE_CENTER_X - halfWidth, FIGURE_CENTER_X + halfWidth, row);
    painter.dot(colors.clothLight, FIGURE_CENTER_X - halfWidth, row);
    painter.span(colors.clothShade, FIGURE_CENTER_X + 2, FIGURE_CENTER_X + halfWidth - 1, row);
    painter.dot(litByFire(colors.clothLight, 0.5), FIGURE_CENTER_X + halfWidth, row);
  });
  painter.rect(colors.skin, FIGURE_CENTER_X - 1, 14, 3, 1);
  painter.rect(colors.skin, FIGURE_CENTER_X - 2, 15, 5, 1);
  painter.rect(colors.skin, FIGURE_CENTER_X - 1, 16, 3, 1);
  painter.dot(colors.skinShade, FIGURE_CENTER_X + 2, 15);
  painter.dot(colors.skinShade, FIGURE_CENTER_X + 1, 16);
  painter.dot(colors.trim, FIGURE_CENTER_X - 3, 15);
  painter.dot(colors.trim, FIGURE_CENTER_X - 2, 16);
  painter.dot(colors.trim, FIGURE_CENTER_X - 2, 17);
  painter.dot(darken(colors.trim, 0.75), FIGURE_CENTER_X + 3, 15);
  painter.dot(darken(colors.trim, 0.75), FIGURE_CENTER_X + 2, 16);
  painter.dot(darken(colors.trim, 0.75), FIGURE_CENTER_X + 2, 17);
  painter.span(colors.clothShade, FIGURE_CENTER_X - 3, FIGURE_CENTER_X + 3, 19);
  painter.dot(colors.clothLight, FIGURE_CENTER_X - 3, 18);
  painter.rect(colors.trim, FIGURE_CENTER_X - 4, 12 + 10, 9, 2);
  painter.rect(darken(colors.trim, 0.75), FIGURE_CENTER_X - 4, 23, 9, 1);
  painter.rect('#e02a3a', FIGURE_CENTER_X - 1, 22, 3, 2);
  painter.dot('#ff8a8a', FIGURE_CENTER_X - 1, 22);
  painter.rect(colors.trim, FIGURE_CENTER_X - 6, 13, 3, 2);
  painter.rect(darken(colors.trim, 0.75), FIGURE_CENTER_X + 4, 13, 3, 2);
  painter.span(lighten(colors.trim, 1.3), FIGURE_CENTER_X - 6, FIGURE_CENTER_X - 4, 13);
}

function skirtHalfWidth(row: number): number {
  return 4 + Math.round((row - SKIRT_TOP) * 0.23);
}

function paintSkirt(painter: SpritePainter, colors: HeroColors): void {
  const foldLight = lighten(colors.cloth, 1.22);
  for (let row = SKIRT_TOP; row <= HEM_ROW; row++) {
    const halfWidth = skirtHalfWidth(row);
    const left = FIGURE_CENTER_X - halfWidth - (row > 50 ? 1 : 0) + (row < 28 ? 0 : 0);
    const right = FIGURE_CENTER_X + halfWidth;
    painter.span(colors.cloth, left, right, row);
    painter.span(colors.clothShade, FIGURE_CENTER_X + 2, right, row);
    painter.dot(colors.clothDeep, right, row);
    painter.dot(colors.clothDeep, left, row);
    if (row % 3 !== 0) painter.dot(foldLight, left + 1, row);
    painter.dot(litByFire(colors.cloth, 0.55), right - 1, row);
  }
  const folds = [[-5, -8], [-1, -3], [3, 5]] as const;
  for (const [topOffset, hemOffset] of folds) {
    painter.line(colors.clothShade, FIGURE_CENTER_X + topOffset, SKIRT_TOP + 1, FIGURE_CENTER_X + hemOffset, HEM_ROW - 2);
    painter.line(foldLight, FIGURE_CENTER_X + topOffset - 1, SKIRT_TOP + 3, FIGURE_CENTER_X + topOffset - 2, HEM_ROW - 28);
  }
  painter.line(colors.clothDeep, FIGURE_CENTER_X - 2, SKIRT_TOP + 2, FIGURE_CENTER_X - 4, 44);
  painter.rect(colors.trim, FIGURE_CENTER_X - 12, HEM_ROW - 1, 24, 1);
  painter.rect(colors.clothDeep, FIGURE_CENTER_X - 12, HEM_ROW, 24, 1);
  for (let x = FIGURE_CENTER_X - 11; x <= FIGURE_CENTER_X + 11; x += 4) painter.dot(lighten(colors.trim, 1.3), x, HEM_ROW - 1);
  }

function paintLegAndBoots(painter: SpritePainter, colors: HeroColors): void {
  const slitLeft = FIGURE_CENTER_X + 1;
  painter.rect(colors.clothDeep, slitLeft, 35, 5, 20);
  painter.rect(colors.skin, slitLeft + 1, 36, 3, 15);
  painter.rect(colors.skinShade, slitLeft + 3, 36, 1, 15);
  painter.rect(litByFire(colors.skin, 0.35), slitLeft + 3, 38, 1, 8);
  painter.rect(lighten(colors.skin, 1.15), slitLeft + 1, 37, 1, 9);
  painter.rect(colors.trim, slitLeft, 35, 1, 18);
  painter.rect(darken(colors.trim, 0.75), slitLeft + 4, 35, 1, 18);
  painter.rect(colors.trim, slitLeft, 35, 5, 1);
  painter.rect(BOOT, slitLeft + 1, 49, 3, 6);
  painter.rect(colors.trim, slitLeft + 1, 49, 3, 1);
  painter.rect(lighten(BOOT, 1.5), slitLeft + 1, 50, 1, 4);
  painter.rect(BOOT, slitLeft + 1, 55, 6, 2);
  painter.rect(lighten(BOOT, 1.5), slitLeft + 1, 55, 4, 1);
  painter.rect(BOOT, FIGURE_CENTER_X - 7, 55, 5, 2);
  painter.rect(lighten(BOOT, 1.5), FIGURE_CENTER_X - 7, 55, 3, 1);
}

function paintFaceFireLight(painter: SpritePainter, colors: HeroColors): void {
  for (const [x, y] of [[21, 8], [21, 9], [21, 10], [20, 11]] as const) painter.dot(litByFire(colors.skin, 0.4), x, y);
  painter.dot(litByFire(colors.skinShade, 0.4), 20, 12);
  painter.rect(darken(colors.hair, 0.8), FIGURE_CENTER_X - 2, 13, 5, 1);
}

export function drawMageFigure(colors: HeroColors): HTMLCanvasElement {
  const drawing = startPortrait();
  const { painter } = drawing;
  paintStaff(painter, colors);
  paintHair(painter, colors);
  paintSkirt(painter, colors);
  paintLegAndBoots(painter, colors);
  paintBodice(painter, colors);
  paintStaffArm(painter, colors);
  paintMageHead(painter, colors, FIGURE_CENTER_X, HEAD_TOP);
  paintFaceFireLight(painter, colors);
  paintCastingArm(painter, colors);
  paintFireball(painter);
  return finishPortrait(drawing);
}
