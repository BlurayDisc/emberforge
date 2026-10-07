import { MATERIAL, darken, lighten, type HeroColors } from './heroPalette';
import type { SpritePainter } from './spritePainter';
import { goldRampOf, interpolatedRows, paintShadedRows, steelRampOf, type FormRow } from './warriorShading';

const BLADE_TIP = { x: 35, y: 2 } as const;
const BLADE_ROOT = { x: 32, y: 31 } as const;

function pauldronRows(mirrored: boolean): FormRow[] {
  const rows: FormRow[] = [
    [12, 24, 28], [13, 23, 30], [14, 22, 32], [15, 22, 33], [16, 22, 33], [17, 23, 34], [18, 23, 34],
  ];
  return rows.map(([y, left, right]) => (mirrored ? [y + 1, 34 - right, 34 - left] : [y, left, right]));
}

export function paintKnightPauldrons(painter: SpritePainter, colors: HeroColors): void {
  const steel = steelRampOf(colors);
  const gold = goldRampOf(colors);
  paintShadedRows(painter, steel, pauldronRows(true), -0.05);
  paintShadedRows(painter, steel, pauldronRows(false), 0.1);
  paintShadedRows(painter, steel, [[19, 25, 33], [20, 26, 33], [21, 26, 32]], 0.12);
  paintShadedRows(painter, steel, [[19, 1, 9], [20, 1, 8]], -0.05);
  painter.span(gold.base, 23, 33, 17);
  painter.span(gold.shade, 28, 33, 17);
  painter.span(gold.base, 1, 11, 17);
  painter.span(gold.light, 1, 6, 17);
  painter.span(gold.shade, 26, 32, 20);
  painter.dot(gold.rim, 25, 19);
  painter.dot(gold.rim, 8, 18);
  painter.dot(gold.base, 33, 14);
  painter.dot(gold.base, 1, 14);
  const coolRim = lighten(colors.cloth, 1.6);
  for (const [rimX, rimY] of [[33, 15], [34, 17], [34, 18], [31, 21], [31, 23], [32, 26], [32, 28]] as const) painter.dot(coolRim, rimX, rimY);
  painter.dot(lighten(colors.cloth, 1.95), 4, 13);
  painter.dot(lighten(colors.cloth, 1.95), 25, 13);
  painter.dot(lighten(colors.cloth, 1.95), 3, 14);
}

export function paintKnightSwordArm(painter: SpritePainter, colors: HeroColors): void {
  const steel = steelRampOf(colors);
  const gold = goldRampOf(colors);
  paintShadedRows(painter, steel, interpolatedRows(20, 26, 31, 28, 26, 31), 0.1);
  paintShadedRows(painter, steel, interpolatedRows(29, 27, 32, 34, 29, 34), 0.1);
  painter.span(gold.base, 26, 31, 24);
  painter.span(gold.shade, 29, 31, 24);
  painter.span(colors.clothDeep, 27, 32, 29);
  painter.span(gold.base, 28, 33, 31);
}

export function paintKnightSword(painter: SpritePainter, colors: HeroColors): void {
  const gold = goldRampOf(colors);
  const blade = lighten(colors.cloth, 1.45);
  const bladeShade = darken(colors.cloth, 0.78);
  const bladeLength = BLADE_ROOT.y - BLADE_TIP.y;
  for (let y = BLADE_TIP.y; y <= BLADE_ROOT.y; y++) {
    const centerX = BLADE_TIP.x + Math.round(((BLADE_ROOT.x - BLADE_TIP.x) * (y - BLADE_TIP.y)) / bladeLength);
    const isPoint = y <= BLADE_TIP.y + 2;
    if (y === BLADE_TIP.y) painter.dot(MATERIAL.white, centerX, y);
    else if (isPoint) painter.span(blade, centerX - 1, centerX, y);
    else {
      painter.dot(MATERIAL.white, centerX - 1, y);
      painter.dot(blade, centerX, y);
      painter.dot(bladeShade, centerX + 1, y);
    }
  }
  painter.rect(gold.base, 29, 32, 9, 2);
  painter.rect(gold.rim, 29, 32, 3, 1);
  painter.rect(gold.shade, 33, 33, 5, 1);
  painter.dot(gold.shade, 29, 34);
  painter.dot(gold.shade, 37, 34);
  painter.rect(MATERIAL.leather, 33, 34, 2, 4);
  painter.rect(gold.base, 32, 39, 4, 2);
  painter.rect(gold.shade, 34, 40, 2, 1);
}

export function paintKnightFist(painter: SpritePainter, colors: HeroColors): void {
  const steel = steelRampOf(colors);
  paintShadedRows(painter, steel, [[34, 30, 36], [35, 30, 36], [36, 30, 36], [37, 31, 36]], 0.05);
  for (const fingerGap of [32, 34]) painter.rect(colors.clothDeep, fingerGap, 35, 1, 2);
  painter.span(colors.clothDeep, 31, 36, 37);
}
