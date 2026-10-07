import { MATERIAL, OUTLINE, darken, lighten, type HeroColors } from './heroPalette';
import type { SpritePainter } from './spritePainter';
import { goldRampOf, paintShadedRows, tabardRamp, type FormRow, type ToneRamp } from './warriorShading';

const SHIELD_CENTER_X = 6;
const SHIELD_TOP = 21;
const SHIELD_TAPER_START = 31;
const SHIELD_TIP = 46;
const CROSSBAR_TOP = SHIELD_TOP + 6;

function halfWidthAt(row: number): number {
  if (row === SHIELD_TOP) return 4;
  if (row < SHIELD_TAPER_START) return 5;
  return Math.max(0, 5 - Math.floor(((row - SHIELD_TAPER_START) * 5) / (SHIELD_TIP - SHIELD_TAPER_START + 1)));
}

function shieldRows(inset: number): FormRow[] {
  const rows: FormRow[] = [];
  for (let row = SHIELD_TOP + inset; row <= SHIELD_TIP - inset * 2; row++) {
    const half = halfWidthAt(row) - inset;
    if (half >= 0) rows.push([row, SHIELD_CENTER_X - half, SHIELD_CENTER_X + half]);
  }
  return rows;
}

// A dark field makes the shield stand out from the bright plate of the body.
function shieldFieldRamp(colors: HeroColors): ToneRamp {
  return { rim: lighten(colors.cloth, 1.2), light: colors.cloth, base: colors.clothShade, shade: darken(colors.clothShade, 0.78), deep: colors.clothDeep };
}

function paintShieldOutline(painter: SpritePainter): void {
  for (const [row, left, right] of shieldRows(0)) painter.span(OUTLINE, left - 1, right + 1, row);
  painter.span(OUTLINE, SHIELD_CENTER_X - 3, SHIELD_CENTER_X + 3, SHIELD_TOP - 1);
  painter.dot(OUTLINE, SHIELD_CENTER_X, SHIELD_TIP + 1);
}

function paintGoldRim(painter: SpritePainter, colors: HeroColors): void {
  const gold = goldRampOf(colors);
  for (const [row, left, right] of shieldRows(0)) {
    painter.span(gold.base, left, right, row);
    painter.dot(gold.light, left, row);
    painter.dot(gold.shade, right, row);
  }
  painter.span(gold.light, SHIELD_CENTER_X - 4, SHIELD_CENTER_X + 1, SHIELD_TOP);
  painter.dot(gold.rim, SHIELD_CENTER_X - 4, SHIELD_TOP);
}

function paintRedCross(painter: SpritePainter): void {
  const red = tabardRamp();
  const verticalBar = shieldRows(1).filter(([row]) => row > SHIELD_TOP && row < SHIELD_TIP - 3).map(([row]): FormRow => [row, SHIELD_CENTER_X - 1, SHIELD_CENTER_X + 1]);
  paintShadedRows(painter, red, verticalBar);
  const crossbar: FormRow[] = [0, 1, 2, 3].map((offset) => [CROSSBAR_TOP + offset, SHIELD_CENTER_X - 4, SHIELD_CENTER_X + 4]);
  paintShadedRows(painter, red, crossbar);
  painter.span(red.light, SHIELD_CENTER_X - 4, SHIELD_CENTER_X + 4, CROSSBAR_TOP);
  painter.span(red.deep, SHIELD_CENTER_X - 4, SHIELD_CENTER_X + 4, CROSSBAR_TOP + 3);
}

function paintBoss(painter: SpritePainter, colors: HeroColors): void {
  const gold = goldRampOf(colors);
  painter.rect(gold.shade, SHIELD_CENTER_X - 2, CROSSBAR_TOP - 1, 5, 5);
  painter.rect(gold.base, SHIELD_CENTER_X - 2, CROSSBAR_TOP - 1, 4, 4);
  painter.rect(gold.light, SHIELD_CENTER_X - 2, CROSSBAR_TOP - 1, 2, 2);
  painter.dot(MATERIAL.white, SHIELD_CENTER_X - 2, CROSSBAR_TOP - 1);
  painter.dot(gold.shade, SHIELD_CENTER_X, CROSSBAR_TOP + 1);
}

export function paintKnightShield(painter: SpritePainter, colors: HeroColors): void {
  paintShieldOutline(painter);
  paintGoldRim(painter, colors);
  paintShadedRows(painter, shieldFieldRamp(colors), shieldRows(1), -0.04);
  paintRedCross(painter);
  paintBoss(painter, colors);
  for (const [dentX, dentY] of [[3, 27], [9, 38], [4, 40]] as const) painter.dot(darken(colors.clothDeep, 0.8), dentX, dentY);
  for (const rivetY of [SHIELD_TOP + 2, SHIELD_TOP + 14]) {
    painter.dot(lighten(colors.cloth, 1.5), SHIELD_CENTER_X - 3, rivetY);
    painter.dot(darken(colors.clothDeep, 0.8), SHIELD_CENTER_X + 3, rivetY);
  }
}
