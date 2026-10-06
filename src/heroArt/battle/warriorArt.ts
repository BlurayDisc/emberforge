import { addHeroOutline, createHeroCanvas } from '../heroCanvas';
import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import { paintWarriorHelm, paintWarriorPauldrons } from '../warriorParts';
import { createSpritePainter, type SpritePainter } from '../spritePainter';

const DRAWING_WIDTH = 34;
const DRAWING_HEIGHT = 40;
const OUTLINE_MARGIN = 1;
export const WARRIOR_SPRITE_SIZE = { width: DRAWING_WIDTH + 2 * OUTLINE_MARGIN, height: DRAWING_HEIGHT + 2 * OUTLINE_MARGIN } as const;



function paintLegs(painter: SpritePainter, colors: HeroColors): void {
  for (const left of [12, 18]) {
    painter.rect(colors.clothShade, left, 28, 5, 8);
    painter.rect(colors.cloth, left, 28, 3, 8);
    painter.rect(lighten(colors.cloth), left, 29, 1, 6);
    painter.rect(colors.trim, left, 31, 5, 1);
    const bootLeft = left === 12 ? 11 : 18;
    painter.rect(MATERIAL.boot, bootLeft, 36, 6, 3);
    painter.rect(MATERIAL.leather, bootLeft, 36, 6, 1);
  }
}

function paintTorso(painter: SpritePainter, colors: HeroColors): void {
  for (let row = 13; row <= 27; row++) {
    const halfWidth = 7 - Math.floor((row - 13) * 0.3);
    painter.span(colors.cloth, 17 - halfWidth, 17 + halfWidth, row);
    painter.span(colors.clothShade, 17 + halfWidth - 1, 17 + halfWidth, row);
  }
  painter.span(colors.clothLight, 11, 15, 14);
  painter.span(colors.clothLight, 19, 23, 14);
  painter.span(colors.clothShade, 11, 15, 18);
  painter.span(colors.clothShade, 19, 23, 18);
  painter.rect(MATERIAL.leather, 12, 27, 11, 2);
  painter.rect(colors.trim, 16, 27, 3, 2);
  painter.rect(colors.cloth, 11, 29, 13, 1);
  paintTabard(painter, colors);
}

// The tabard hangs over the breastplate and over the belt, down to the thighs.
function paintTabard(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(MATERIAL.red, 15, 14, 5, 13);
  painter.rect(MATERIAL.redDark, 19, 14, 1, 13);
  painter.rect(colors.trim, 15, 14, 5, 1);
  painter.rect(colors.trim, 16, 18, 3, 1);
  painter.rect(colors.trim, 17, 17, 1, 3);
  painter.rect(MATERIAL.red, 14, 29, 7, 4);
  painter.rect(MATERIAL.redDark, 20, 29, 1, 4);
  painter.rect(colors.trim, 14, 32, 7, 1);
}

function paintSwordArm(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.cloth, 23, 17, 5, 9);
  painter.rect(lighten(colors.cloth), 24, 17, 1, 7);
  painter.rect(colors.clothShade, 26, 17, 2, 9);
  painter.rect(colors.trim, 23, 21, 5, 1);
  painter.rect(colors.trim, 23, 17, 5, 1);
  painter.rect(colors.clothShade, 23, 25, 5, 1);
}

function paintFist(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.cloth, 26, 26, 6, 4);
  painter.rect(colors.clothShade, 26, 29, 6, 1);
  painter.rect(lighten(colors.cloth), 26, 26, 6, 1);
  for (const knuckleX of [28, 30]) painter.rect(colors.clothShade, knuckleX, 27, 1, 2);
}

function paintSword(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.cloth, 28, 4, 3, 21);
  painter.rect(MATERIAL.white, 28, 4, 1, 21);
  painter.rect(darken(colors.cloth, 0.8), 30, 5, 1, 20);
  painter.rect(MATERIAL.white, 29, 2, 1, 2);
  painter.rect(colors.cloth, 29, 3, 1, 2);
  painter.rect(colors.trim, 26, 25, 7, 1);
  painter.rect(MATERIAL.goldDark, 26, 26, 7, 1);
  painter.rect(MATERIAL.leather, 29, 30, 1, 2);
  painter.rect(colors.trim, 28, 32, 3, 2);
}


const SHIELD_CENTER_X = 7;
const SHIELD_TOP = 14;
const SHIELD_BOTTOM = 39;
const SHIELD_TAPER_START = 30;

function shieldHalfWidth(row: number): number {
  if (row < SHIELD_TOP + 2) return 4 + (row - SHIELD_TOP);
  if (row < SHIELD_TAPER_START) return 6;
  return Math.max(0, 6 - Math.floor((row - SHIELD_TAPER_START) * 0.7));
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
  painter.rect(MATERIAL.red, SHIELD_CENTER_X - 1, SHIELD_TOP + 2, 3, 21);
  painter.rect(MATERIAL.red, SHIELD_CENTER_X - 4, SHIELD_TOP + 8, 9, 3);
  painter.rect(MATERIAL.redDark, SHIELD_CENTER_X + 1, SHIELD_TOP + 2, 1, 21);
  painter.rect(MATERIAL.redDark, SHIELD_CENTER_X - 4, SHIELD_TOP + 10, 9, 1);
  painter.rect(MATERIAL.goldDark, SHIELD_CENTER_X - 2, SHIELD_TOP + 7, 5, 5);
  painter.rect(colors.trim, SHIELD_CENTER_X - 2, SHIELD_TOP + 7, 4, 4);
  painter.dot(MATERIAL.white, SHIELD_CENTER_X - 1, SHIELD_TOP + 8);
  for (const [dentX, dentY] of [[3, 19], [10, 30], [4, 33]] as const) painter.dot(darken(colors.clothShade, 0.6), dentX, dentY);
  for (const row of [SHIELD_TOP + 3, SHIELD_TOP + 5]) painter.dot(MATERIAL.white, 3, row);
}

export function drawWarriorSprite(colors: HeroColors): HTMLCanvasElement {
  const art = createHeroCanvas(WARRIOR_SPRITE_SIZE.width, WARRIOR_SPRITE_SIZE.height);
  const painter = createSpritePainter(art, OUTLINE_MARGIN, OUTLINE_MARGIN);
  paintLegs(painter, colors);
  paintTorso(painter, colors);
  paintSwordArm(painter, colors);
  paintWarriorHelm(painter, colors, 10, 0);
  paintWarriorPauldrons(painter, colors, 22, 4, 10);
  paintSword(painter, colors);
  paintFist(painter, colors);
  paintShield(painter, colors);
  addHeroOutline(art);
  return art.canvas;
}
