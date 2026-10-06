import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import { bodyHalfWidth, paintHumanHead } from '../maleHeadArt';
import type { SpritePainter } from '../spritePainter';
import { PORTRAIT_CENTER_X, finishPortrait, startPortrait } from './portraitFrame';

const CENTER_X = PORTRAIT_CENTER_X - 1;
const HEAD_TOP = 3;
const TORSO_TOP = 14;
const IMPACT_SPARK = '#fff3b0';
const FLAME = '#ff9a3a';
const FLAME_CORE = '#ffd86a';
const WRAP = '#e8e4d4';

function paintHeadband(painter: SpritePainter): void {
  painter.span(MATERIAL.red, CENTER_X - 5, CENTER_X + 5, HEAD_TOP + 3);
  painter.span(MATERIAL.redDark, CENTER_X - 5, CENTER_X + 5, HEAD_TOP + 4);
  painter.rect(MATERIAL.red, 5, HEAD_TOP + 3, 7, 3);
  painter.rect(MATERIAL.red, 2, HEAD_TOP + 6, 5, 3);
  painter.rect(MATERIAL.redDark, 0, HEAD_TOP + 9, 4, 2);
  painter.dot(MATERIAL.gold, CENTER_X, HEAD_TOP + 3);
}

function paintStanceLegs(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.clothShade, 15, 32, 8, 43, 6);
  painter.line(colors.clothShade, 21, 32, 28, 43, 6);
  painter.line(colors.cloth, 8, 43, 6, 54, 5);
  painter.line(colors.cloth, 28, 43, 31, 54, 5);
  painter.line(lighten(colors.cloth), 14, 33, 8, 43);
  painter.rect(WRAP, 3, 50, 7, 3);
  painter.rect(WRAP, 28, 50, 7, 3);
  painter.rect(MATERIAL.boot, 1, 54, 10, 3);
  painter.rect(MATERIAL.boot, 28, 54, 10, 3);
}

function paintGi(painter: SpritePainter, colors: HeroColors): void {
  const shoulderHalfWidth = bodyHalfWidth(colors, 4) + 1;
  for (let row = 0; row < 18; row++) {
    const halfWidth = Math.max(4, shoulderHalfWidth - Math.floor(row / 4));
    painter.span(colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, TORSO_TOP + row);
    painter.dot(colors.clothShade, CENTER_X + halfWidth, TORSO_TOP + row);
  }
  painter.rect(colors.skin, CENTER_X - 1, TORSO_TOP, 3, 6);
  painter.rect(colors.skinShade, CENTER_X, TORSO_TOP + 1, 1, 5);
  painter.line(colors.clothDeep, CENTER_X - 4, TORSO_TOP, CENTER_X, TORSO_TOP + 6);
  painter.line(colors.clothDeep, CENTER_X + 4, TORSO_TOP, CENTER_X, TORSO_TOP + 6);
  painter.rect(MATERIAL.boot, CENTER_X - 5, TORSO_TOP + 15, 11, 3);
  painter.rect(MATERIAL.redDark, CENTER_X + 5, TORSO_TOP + 17, 2, 6);
  painter.rect(MATERIAL.red, CENTER_X + 5, TORSO_TOP + 17, 1, 5);
  painter.rect(colors.clothShade, CENTER_X - 6, TORSO_TOP + 18, 13, 4);
  painter.rect(colors.cloth, CENTER_X - 6, TORSO_TOP + 18, 6, 2);
}

function paintFists(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.skin, CENTER_X + 4, TORSO_TOP + 2, 30, TORSO_TOP + 2, 4);
  painter.line(colors.skinShade, CENTER_X + 4, TORSO_TOP + 4, 30, TORSO_TOP + 4);
  painter.rect(WRAP, 26, TORSO_TOP, 3, 5);
  painter.rect(colors.trim, 30, TORSO_TOP - 1, 6, 6);
  painter.rect(WRAP, 30, TORSO_TOP - 1, 6, 1);
  painter.rect(darken(colors.trim, 0.65), 30, TORSO_TOP + 4, 6, 1);
  painter.rect(FLAME, 31, TORSO_TOP - 5, 4, 4);
  painter.rect(FLAME_CORE, 32, TORSO_TOP - 4, 2, 3);
  painter.dot(FLAME, 32, TORSO_TOP - 7);
  for (const [sparkX, sparkY] of [[36, 9], [37, 13], [36, 19], [30, 5]] as const) painter.dot(IMPACT_SPARK, sparkX, sparkY);
  painter.line(colors.skin, CENTER_X - 4, TORSO_TOP + 2, 8, TORSO_TOP + 9, 4);
  painter.line(colors.skinShade, CENTER_X - 4, TORSO_TOP + 4, 8, TORSO_TOP + 11);
  painter.rect(WRAP, 10, TORSO_TOP + 8, 3, 5);
  painter.rect(colors.trim, 3, TORSO_TOP + 7, 6, 6);
  painter.rect(WRAP, 3, TORSO_TOP + 7, 6, 1);
  painter.rect(darken(colors.trim, 0.65), 3, TORSO_TOP + 12, 6, 1);
  painter.rect(FLAME, 4, TORSO_TOP + 3, 4, 4);
  painter.rect(FLAME_CORE, 5, TORSO_TOP + 4, 2, 3);
}

export function drawFighterFigure(colors: HeroColors): HTMLCanvasElement {
  const drawing = startPortrait();
  const { painter } = drawing;
  if (colors.appearance.gender === 'female') {
    painter.rect(colors.hair, CENTER_X - 9, 11, 3, 10);
    painter.rect(colors.hair, CENTER_X + 7, 11, 3, 10);
  }
  paintStanceLegs(painter, colors);
  paintGi(painter, colors);
  paintHumanHead(painter, colors, CENTER_X - 6, HEAD_TOP);
  paintHeadband(painter);
  paintFists(painter, colors);
  painter.rect(lighten(colors.cloth), CENTER_X - 4, TORSO_TOP + 6, 2, 3);
  return finishPortrait(drawing);
}
