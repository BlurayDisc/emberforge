import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';
import { paintWarriorHelm, paintWarriorPauldrons } from '../warriorParts';
import { PORTRAIT_CENTER_X, finishPortrait, startPortrait } from './portraitFrame';

const CENTER_X = PORTRAIT_CENTER_X - 1;
const SWORD_CENTER_X = 32;
const SHIELD_CENTER_X = 7;
const SHIELD_TOP = 19;
const SHIELD_BOTTOM = 56;
const SHIELD_TAPER_START = 43;

function paintLegs(painter: SpritePainter, colors: HeroColors): void {
  for (const left of [CENTER_X - 6, CENTER_X + 1]) {
    painter.rect(colors.clothShade, left, 36, 6, 17);
    painter.rect(colors.cloth, left, 36, 4, 17);
    painter.rect(lighten(colors.cloth), left, 37, 1, 14);
    painter.rect(colors.trim, left, 42, 6, 1);
    painter.rect(colors.cloth, left - 1, 41, 8, 4);
    painter.rect(lighten(colors.cloth), left, 41, 3, 1);
    painter.rect(colors.clothShade, left - 1, 44, 8, 1);
    painter.rect(MATERIAL.boot, left - 1, 53, 8, 4);
    painter.rect(MATERIAL.leather, left - 1, 53, 8, 1);
    painter.rect(colors.trim, left - 1, 54, 8, 1);
  }
}

function paintTorso(painter: SpritePainter, colors: HeroColors): void {
  for (let row = 11; row <= 29; row++) {
    const halfWidth = 9 - Math.floor((row - 11) * 0.22);
    painter.span(colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, row);
    painter.span(colors.clothShade, CENTER_X + halfWidth - 1, CENTER_X + halfWidth, row);
  }
  painter.span(colors.clothLight, CENTER_X - 7, CENTER_X - 3, 14);
  painter.span(colors.clothLight, CENTER_X + 3, CENTER_X + 7, 14);
  painter.span(colors.clothShade, CENTER_X - 7, CENTER_X - 3, 20);
  painter.span(colors.clothShade, CENTER_X + 3, CENTER_X + 7, 20);
  painter.rect(MATERIAL.leather, CENTER_X - 7, 29, 15, 2);
  painter.rect(colors.trim, CENTER_X - 2, 29, 5, 2);
  for (let strip = 0; strip < 4; strip++) {
    const left = CENTER_X - 8 + strip * 4;
    painter.rect(colors.cloth, left, 31, 4, 6);
    painter.rect(colors.clothShade, left + 3, 31, 1, 6);
    painter.rect(colors.trim, left, 36, 4, 1);
  }
  paintTabard(painter, colors);
}

// The tabard hangs over the breastplate and over the belt, down to the thighs.
function paintTabard(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(MATERIAL.red, CENTER_X - 3, 12, 7, 18);
  painter.rect(MATERIAL.redDark, CENTER_X + 3, 12, 1, 18);
  painter.rect(colors.trim, CENTER_X - 3, 12, 7, 1);
  painter.rect(colors.trim, CENTER_X - 1, 18, 3, 1);
  painter.rect(colors.trim, CENTER_X, 17, 1, 3);
  painter.rect(MATERIAL.red, CENTER_X - 3, 31, 7, 10);
  painter.rect(MATERIAL.redDark, CENTER_X + 3, 31, 1, 10);
  painter.rect(colors.trim, CENTER_X - 3, 40, 7, 1);
  painter.rect(MATERIAL.leather, CENTER_X - 7, 29, 15, 2);
  painter.rect(colors.trim, CENTER_X - 2, 29, 5, 2);
}

function paintSwordArm(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.cloth, 27, 19, 6, 12);
  painter.rect(lighten(colors.cloth), 28, 19, 1, 10);
  painter.rect(colors.clothShade, 31, 19, 2, 12);
  painter.rect(colors.trim, 27, 19, 6, 1);
  painter.rect(colors.trim, 27, 25, 6, 1);
  painter.rect(colors.clothShade, 27, 29, 6, 2);
  painter.rect(colors.cloth, 29, 31, 6, 5);
  painter.rect(colors.clothShade, 29, 35, 6, 1);
  painter.rect(lighten(colors.cloth), 29, 31, 6, 1);
  for (const knuckleX of [31, 33]) painter.rect(colors.clothShade, knuckleX, 32, 1, 3);
}

function paintSword(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.cloth, SWORD_CENTER_X - 1, 3, 3, 28);
  painter.rect(MATERIAL.white, SWORD_CENTER_X - 1, 3, 1, 28);
  painter.rect(darken(colors.cloth, 0.8), SWORD_CENTER_X + 1, 4, 1, 27);
  painter.rect(MATERIAL.white, SWORD_CENTER_X, 1, 1, 2);
  painter.rect(colors.cloth, SWORD_CENTER_X, 2, 1, 2);
  painter.rect(colors.cloth, SWORD_CENTER_X, 15, 1, 1);
  painter.rect(colors.clothShade, SWORD_CENTER_X, 6, 1, 20);
  painter.rect(colors.trim, SWORD_CENTER_X - 4, 31, 9, 2);
  painter.rect(MATERIAL.goldDark, SWORD_CENTER_X - 4, 32, 9, 1);
  painter.rect(MATERIAL.leather, SWORD_CENTER_X, 36, 1, 2);
  painter.rect(colors.trim, SWORD_CENTER_X - 1, 38, 3, 3);
}

function shieldHalfWidth(row: number): number {
  if (row < SHIELD_TOP + 2) return 5 + (row - SHIELD_TOP);
  if (row < SHIELD_TAPER_START) return 7;
  return Math.max(0, 7 - Math.floor((row - SHIELD_TAPER_START) * 0.58));
}

function paintShield(painter: SpritePainter, colors: HeroColors): void {
  for (let row = SHIELD_TOP; row <= SHIELD_BOTTOM; row++) {
    const halfWidth = shieldHalfWidth(row);
    painter.span(colors.trim, SHIELD_CENTER_X - halfWidth, SHIELD_CENTER_X + halfWidth, row);
    if (halfWidth >= 2 && row > SHIELD_TOP && row < SHIELD_BOTTOM - 1) {
      painter.span(colors.clothShade, SHIELD_CENTER_X - halfWidth + 1, SHIELD_CENTER_X + halfWidth - 1, row);
      painter.span(colors.cloth, SHIELD_CENTER_X - halfWidth + 1, SHIELD_CENTER_X + halfWidth - 3, row);
    }
  }
  painter.rect(MATERIAL.red, SHIELD_CENTER_X - 1, SHIELD_TOP + 2, 3, 30);
  painter.rect(MATERIAL.redDark, SHIELD_CENTER_X + 1, SHIELD_TOP + 2, 1, 30);
  painter.rect(MATERIAL.red, SHIELD_CENTER_X - 5, SHIELD_TOP + 10, 11, 4);
  painter.rect(MATERIAL.redDark, SHIELD_CENTER_X - 5, SHIELD_TOP + 13, 11, 1);
  painter.rect(MATERIAL.goldDark, SHIELD_CENTER_X - 3, SHIELD_TOP + 8, 7, 7);
  painter.rect(colors.trim, SHIELD_CENTER_X - 3, SHIELD_TOP + 8, 6, 6);
  painter.rect(MATERIAL.white, SHIELD_CENTER_X - 2, SHIELD_TOP + 9, 2, 1);
  for (const [dentX, dentY] of [[3, 26], [11, 38], [4, 45], [9, 50]] as const) painter.rect(darken(colors.clothShade, 0.6), dentX, dentY, 2, 1);
  for (const row of [SHIELD_TOP + 3, SHIELD_TOP + 5, SHIELD_TOP + 7]) painter.dot(MATERIAL.white, 3, row);
}

export function drawWarriorFigure(colors: HeroColors): HTMLCanvasElement {
  const drawing = startPortrait();
  const { painter } = drawing;
  paintLegs(painter, colors);
  paintTorso(painter, colors);
  paintSwordArm(painter, colors);
  paintWarriorHelm(painter, colors, CENTER_X - 6, 0);
  paintWarriorPauldrons(painter, colors, CENTER_X + 4, CENTER_X - 14, 10);
  paintSword(painter, colors);
  paintShield(painter, colors);
  return finishPortrait(drawing);
}
