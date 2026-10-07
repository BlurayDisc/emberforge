import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import { bodyHalfWidth, paintHumanHead } from '../maleHeadArt';
import type { SpritePainter } from '../spritePainter';
import { FIRE_GLOW, FIRE_GLOW_DEEP, paintEmbers, paintLargeFlame, paintSmallFlame } from './fighterFlame';
import { PORTRAIT_CENTER_X, finishPortrait, startPortrait } from './portraitFrame';

const CENTER_X = PORTRAIT_CENTER_X - 2;
const HEAD_TOP = 3;
const SHOULDER_ROW = 15;
const SASH_ROW = 31;
const WRAP = '#e8e4d4';
const WRAP_SHADE = '#b9b29a';

function paintHeadband(painter: SpritePainter): void {
  painter.span(MATERIAL.red, CENTER_X - 5, CENTER_X + 5, HEAD_TOP + 3);
  painter.span(MATERIAL.redDark, CENTER_X - 5, CENTER_X + 5, HEAD_TOP + 4);
  painter.span(lighten(MATERIAL.red), CENTER_X - 5, CENTER_X - 1, HEAD_TOP + 3);
  painter.rect(MATERIAL.redDark, CENTER_X - 7, HEAD_TOP + 3, 2, 3);
  painter.rect(MATERIAL.red, CENTER_X - 8, HEAD_TOP + 4, 2, 2);
  painter.line(MATERIAL.red, CENTER_X - 8, HEAD_TOP + 5, 7, HEAD_TOP + 6, 2);
  painter.line(MATERIAL.red, 7, HEAD_TOP + 6, 2, HEAD_TOP + 5, 2);
  painter.line(MATERIAL.redDark, 6, HEAD_TOP + 8, 1, HEAD_TOP + 11);
  painter.line(MATERIAL.red, CENTER_X - 8, HEAD_TOP + 6, 5, HEAD_TOP + 9, 2);
  painter.line(MATERIAL.red, 5, HEAD_TOP + 9, 2, HEAD_TOP + 13, 2);
  painter.dot(MATERIAL.redDark, 3, HEAD_TOP + 12);
  painter.dot(MATERIAL.gold, CENTER_X, HEAD_TOP + 3);
}

function paintBackLeg(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.clothDeep, 15, 33, 9, 45, 7);
  painter.line(colors.clothShade, 14, 33, 8, 44, 6);
  painter.line(colors.cloth, 12, 33, 7, 43, 2);
  painter.line(colors.clothShade, 8, 45, 4, 54, 5);
  painter.line(colors.clothDeep, 11, 46, 7, 55, 2);
  painter.rect(WRAP, 2, 49, 6, 4);
  painter.rect(WRAP_SHADE, 5, 50, 3, 3);
  painter.rect(MATERIAL.boot, 0, 54, 9, 3);
  painter.rect(MATERIAL.leather, 1, 54, 6, 1);
}

function paintFrontLeg(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.clothShade, 19, 33, 28, 42, 8);
  painter.line(colors.cloth, 18, 33, 26, 41, 4);
  painter.line(colors.clothLight, 18, 34, 22, 38);
  painter.line(colors.clothShade, 28, 43, 28, 53, 6);
  painter.line(colors.clothDeep, 24, 43, 28, 45);
  painter.line(colors.clothLight, 24, 42, 27, 42);
  painter.line(colors.clothDeep, 32, 44, 32, 53, 1);
  painter.line(colors.cloth, 27, 44, 27, 52, 2);
  painter.rect(WRAP, 26, 49, 7, 4);
  painter.rect(WRAP_SHADE, 26, 52, 7, 1);
  painter.rect(MATERIAL.boot, 25, 54, 11, 3);
  painter.rect(MATERIAL.leather, 26, 54, 8, 1);
}

function paintTorso(painter: SpritePainter, colors: HeroColors): void {
  const shoulderHalfWidth = bodyHalfWidth(colors, 5);
  for (let row = 0; row < SASH_ROW - SHOULDER_ROW; row++) {
    const halfWidth = Math.max(4, shoulderHalfWidth - Math.floor(row / 4));
    const y = SHOULDER_ROW + row;
    painter.span(colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, y);
    painter.dot(colors.clothLight, CENTER_X - halfWidth, y);
    painter.span(colors.clothShade, CENTER_X + halfWidth - 1, CENTER_X + halfWidth, y);
  }
  painter.rect(colors.skin, CENTER_X - 1, HEAD_TOP + 11, 3, 3);
  painter.rect(colors.skinShade, CENTER_X + 1, HEAD_TOP + 11, 1, 3);
  for (let row = 0; row < 9; row++) {
    const openHalfWidth = Math.max(0, 3 - Math.floor(row / 3));
    painter.span(colors.skin, CENTER_X - openHalfWidth, CENTER_X + openHalfWidth, SHOULDER_ROW + row);
    painter.dot(colors.skinShade, CENTER_X + openHalfWidth, SHOULDER_ROW + row);
    painter.dot(colors.clothDeep, CENTER_X - openHalfWidth - 1, SHOULDER_ROW + row);
    painter.dot(colors.clothDeep, CENTER_X + openHalfWidth + 1, SHOULDER_ROW + row);
  }
  painter.dot(FIRE_GLOW_DEEP, CENTER_X + 2, SHOULDER_ROW + 1);
  painter.line(colors.skinShade, CENTER_X - 3, SHOULDER_ROW + 5, CENTER_X - 1, SHOULDER_ROW + 6);
  painter.line(colors.skinShade, CENTER_X + 3, SHOULDER_ROW + 4, CENTER_X + 1, SHOULDER_ROW + 6);
  painter.line(colors.clothLight, CENTER_X - 4, SHOULDER_ROW, CENTER_X - 1, SHOULDER_ROW + 8);
  painter.rect(colors.clothShade, CENTER_X - 1, SHOULDER_ROW + 9, 3, 6);
  painter.line(colors.clothDeep, CENTER_X - 4, SHOULDER_ROW + 12, CENTER_X + 4, SHOULDER_ROW + 12);
}

function paintSash(painter: SpritePainter, colors: HeroColors): void {
  const sashDark = darken(colors.trim, 0.65);
  painter.rect(colors.trim, CENTER_X - 7, SASH_ROW, 15, 4);
  painter.rect(lighten(colors.trim), CENTER_X - 7, SASH_ROW, 15, 1);
  painter.rect(sashDark, CENTER_X - 7, SASH_ROW + 3, 15, 1);
  painter.rect(sashDark, CENTER_X + 5, SASH_ROW, 3, 4);
  painter.rect(colors.trim, CENTER_X - 3, SASH_ROW + 3, 4, 3);
  painter.rect(sashDark, CENTER_X - 3, SASH_ROW + 5, 4, 1);
  painter.rect(colors.trim, CENTER_X - 5, SASH_ROW + 4, 2, 6);
  painter.rect(sashDark, CENTER_X - 4, SASH_ROW + 6, 1, 4);
  painter.rect(colors.trim, CENTER_X - 8, SASH_ROW + 6, 2, 5);
  painter.rect(sashDark, CENTER_X - 7, SASH_ROW + 8, 1, 3);
}

function paintFrontArm(painter: SpritePainter, colors: HeroColors): void {
  paintLargeFlame(painter, 29, 7);
  paintEmbers(painter, [[28, 8], [37, 6], [33, 4], [36, 26], [32, 27]]);
  painter.line(colors.clothShade, CENTER_X + 5, 17, 22, 19, 5);
  painter.line(colors.cloth, CENTER_X + 5, 16, 21, 17, 3);
  painter.line(colors.clothLight, CENTER_X + 5, 16, 19, 16);
  painter.rect(colors.clothDeep, 21, 22, 3, 1);
  painter.line(colors.skin, 23, 18, 31, 19, 4);
  painter.line(colors.skinShade, 23, 21, 31, 22, 1);
  painter.line(colors.skinShade, 26, 20, 29, 20);
  painter.line(FIRE_GLOW_DEEP, 30, 18, 30, 21);
  painter.rect(WRAP, 26, 17, 2, 5);
  painter.rect(WRAP_SHADE, 26, 21, 2, 1);
  painter.rect(WRAP, 31, 16, 6, 6);
  painter.rect(WRAP_SHADE, 31, 21, 6, 1);
  painter.line(MATERIAL.redDark, 32, 19, 35, 19);
  painter.rect(FIRE_GLOW, 32, 16, 4, 1);
  painter.rect(colors.skin, 36, 17, 1, 3);
}

function paintRearArm(painter: SpritePainter, colors: HeroColors): void {
  paintSmallFlame(painter, 2, 16);
  paintEmbers(painter, [[1, 18], [10, 17], [3, 15]]);
  painter.line(colors.clothShade, CENTER_X - 5, 17, 8, 23, 5);
  painter.line(colors.clothLight, CENTER_X - 6, 17, 9, 21, 2);
  painter.rect(colors.clothDeep, 6, 26, 4, 1);
  painter.line(colors.skin, 8, 25, 9, 22, 3);
  painter.line(colors.skinShade, 11, 24, 11, 26);
  painter.rect(WRAP, 6, 24, 5, 2);
  painter.rect(WRAP, 6, 19, 6, 5);
  painter.rect(WRAP_SHADE, 6, 23, 6, 1);
  painter.rect(FIRE_GLOW, 7, 19, 4, 1);
  painter.line(MATERIAL.redDark, 7, 21, 10, 21);
}

export function drawFighterFigure(colors: HeroColors): HTMLCanvasElement {
  const drawing = startPortrait();
  const { painter } = drawing;
  if (colors.appearance.gender === 'female') {
    painter.rect(colors.hair, CENTER_X - 8, 11, 3, 9);
    painter.rect(colors.hair, CENTER_X + 6, 11, 3, 9);
  }
  paintBackLeg(painter, colors);
  paintFrontLeg(painter, colors);
  paintTorso(painter, colors);
  paintSash(painter, colors);
  paintHumanHead(painter, colors, CENTER_X - 6, HEAD_TOP);
  paintHeadband(painter);
  paintRearArm(painter, colors);
  paintFrontArm(painter, colors);
  return finishPortrait(drawing);
}
