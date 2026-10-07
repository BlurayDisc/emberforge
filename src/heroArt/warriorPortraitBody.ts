import { MATERIAL, darken, lighten, type HeroColors } from './heroPalette';
import type { SpritePainter } from './spritePainter';
import { goldRampOf, interpolatedRows, paintShadedRows, steelRampOf, tabardRamp } from './warriorShading';

const SABATON_ROWS = ['.GGGGG....', '.mMMMd....', '.mMMMdd...', 'qMMMMMMdd.', 'qqMMMMMMMd', 'bbbbbbbbbb'];

// The leg on the left of the picture carries the weight and stays straight. The other leg is relaxed and stepped out.
export function paintKnightLegs(painter: SpritePainter, colors: HeroColors): void {
  const steel = steelRampOf(colors);
  const gold = goldRampOf(colors);
  paintShadedRows(painter, steel, interpolatedRows(36, 10, 17, 44, 6, 13), 0.05);
  paintShadedRows(painter, steel, interpolatedRows(45, 5, 12, 51, 4, 9));
  paintShadedRows(painter, steel, interpolatedRows(36, 16, 24, 44, 17, 24), 0.1);
  paintShadedRows(painter, steel, interpolatedRows(45, 17, 24, 51, 18, 23), 0.1);
  paintShadedRows(painter, steel, [[43, 4, 13], [44, 4, 13], [45, 4, 13], [46, 5, 12]]);
  paintShadedRows(painter, steel, [[43, 15, 25], [44, 15, 25], [45, 15, 25], [46, 16, 24]], 0.08);
  painter.span(gold.base, 4, 13, 44);
  painter.span(gold.base, 15, 25, 44);
  painter.dot(gold.rim, 4, 44);
  painter.dot(gold.rim, 15, 44);
  painter.dot(gold.shade, 13, 44);
  painter.dot(gold.shade, 25, 44);
  painter.span(colors.clothDeep, 6, 12, 48);
  painter.span(colors.clothDeep, 18, 23, 48);
  paintSabaton(painter, colors, 0, true);
  paintSabaton(painter, colors, 17, false);
}

function paintSabaton(painter: SpritePainter, colors: HeroColors, left: number, pointsLeft: boolean): void {
  const rows = pointsLeft ? SABATON_ROWS.map((row) => [...row].reverse().join('')) : SABATON_ROWS;
  painter.grid(rows, { G: colors.trim, q: colors.cloth, M: colors.clothShade, m: darken(colors.clothShade, 0.8), d: colors.clothDeep, b: MATERIAL.boot }, left, 51);
}

export function paintKnightCape(painter: SpritePainter): void {
  const cape = tabardRamp();
  const flow = [...interpolatedRows(16, 22, 31, 26, 22, 34), ...interpolatedRows(27, 22, 35, 40, 22, 35), ...interpolatedRows(41, 22, 34, 46, 22, 32)];
  paintShadedRows(painter, cape, flow, 0.4);
  for (const foldX of [30, 33]) painter.rect(darken(cape.deep, 0.85), foldX, 24, 1, 20);
  for (const gapX of [29, 33]) painter.rect(darken(cape.deep, 0.85), gapX, 45, 1, 2);
}

export function paintKnightTorso(painter: SpritePainter, colors: HeroColors): void {
  const steel = steelRampOf(colors);
  const gold = goldRampOf(colors);
  const breastplate = [
    ...interpolatedRows(14, 11, 23, 16, 9, 25),
    ...interpolatedRows(17, 8, 26, 22, 8, 26),
    ...interpolatedRows(23, 9, 25, 29, 12, 22),
  ];
  paintShadedRows(painter, steel, breastplate);
  for (const rowY of [26, 28]) painter.span(colors.clothShade, 11, 23, rowY);
  painter.span(colors.clothDeep, 12, 22, 29);
  painter.rect(lighten(colors.cloth, 1.85), 10, 17, 1, 4);
  painter.rect(lighten(colors.cloth, 1.85), 11, 21, 1, 3);
  painter.rect(colors.clothShade, 24, 18, 1, 5);
  paintShadedRows(painter, steel, interpolatedRows(30, 11, 23, 31, 11, 23));
  painter.rect(MATERIAL.leather, 11, 30, 13, 2);
  painter.rect(MATERIAL.leatherLight, 11, 30, 6, 1);
  painter.rect(gold.base, 15, 30, 5, 2);
  painter.rect(gold.rim, 15, 30, 2, 1);
  painter.rect(gold.shade, 19, 31, 1, 1);
  const tasset = interpolatedRows(32, 9, 25, 38, 8, 26);
  paintShadedRows(painter, steel, tasset);
  for (const lameEdge of [13, 17, 21]) painter.rect(colors.clothDeep, lameEdge, 32, 1, 7);
  painter.span(colors.clothDeep, 9, 25, 34);
  painter.span(colors.clothDeep, 8, 26, 37);
  painter.span(gold.base, 8, 26, 38);
  painter.span(gold.shade, 17, 26, 38);
}

export function paintKnightTabard(painter: SpritePainter, colors: HeroColors): void {
  const cloth = tabardRamp();
  const gold = goldRampOf(colors);
  paintShadedRows(painter, cloth, interpolatedRows(15, 14, 20, 29, 14, 21), 0.04);
  paintShadedRows(painter, cloth, interpolatedRows(32, 14, 21, 41, 12, 23), 0.02);
  painter.rect(cloth.deep, 17, 35, 1, 6);
  painter.rect(cloth.deep, 20, 22, 1, 7);
  painter.rect(cloth.light, 14, 16, 1, 12);
  painter.rect(cloth.light, 15, 33, 1, 7);
  for (const [notchX, notchY] of [[13, 41], [16, 41], [19, 41], [22, 41]] as const) painter.rect(cloth.deep, notchX, notchY, 1, 1);
  painter.rect(gold.base, 12, 39, 12, 1);
  painter.rect(gold.shade, 17, 39, 7, 1);
  painter.rect(gold.base, 16, 18, 2, 7);
  painter.rect(gold.base, 14, 20, 6, 2);
  painter.rect(gold.shade, 17, 21, 3, 1);
  painter.rect(gold.shade, 17, 22, 1, 3);
  painter.dot(gold.rim, 16, 18);
  painter.dot(gold.rim, 14, 20);
}
