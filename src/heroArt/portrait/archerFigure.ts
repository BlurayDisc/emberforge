import { paintArcherCloak, paintArcherHood } from '../headgear/archerCloak';
import { paintElfHead, paintElfPonytail } from '../headgear/archerHead';
import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';
import { PORTRAIT_CENTER_X, finishPortrait, startPortrait } from './portraitFrame';

const CENTER_X = PORTRAIT_CENTER_X - 1;
const ARROW_Y = 11;
const BOW_GRIP_X = 34;
const BOW_TOP_Y = 0;
const BOW_BOTTOM_Y = 24;
const STRING_HAND_X = 15;
const BOW_STRING = '#e8e0cc';
const ARROW_SHAFT = '#c8a878';

function paintQuiverAndHair(painter: SpritePainter, colors: HeroColors): void {
  painter.line(MATERIAL.leather, 9, 7, 15, 24, 4);
  painter.line(MATERIAL.leatherLight, 8, 7, 14, 24);
  for (const featherX of [8, 10, 12]) painter.rect(MATERIAL.red, featherX, 3, 1, 4);
  paintElfPonytail(painter, colors, 13, 4, 30, 3);
}

function paintOutfit(painter: SpritePainter, colors: HeroColors): void {
  const bodiceHalfWidths = [4, 4, 4, 4, 3, 3, 3, 2, 2, 2, 3];
  bodiceHalfWidths.forEach((halfWidth, index) => {
    const row = 11 + index;
    painter.span(colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, row);
    painter.dot(colors.clothShade, CENTER_X + halfWidth, row);
  });
  painter.span(colors.clothLight, CENTER_X - 3, CENTER_X - 1, 14);
  painter.span(colors.clothLight, CENTER_X + 1, CENTER_X + 3, 14);
  painter.span(colors.clothShade, CENTER_X - 3, CENTER_X + 3, 15);
  painter.rect(colors.trim, CENTER_X, 12, 1, 9);
  for (const row of [14, 16, 18]) {
    painter.dot(MATERIAL.leather, CENTER_X - 1, row);
    painter.dot(MATERIAL.leather, CENTER_X + 1, row + 1);
  }
  painter.rect(MATERIAL.leather, CENTER_X - 3, 21, 8, 2);
  painter.rect(colors.trim, CENTER_X - 1, 21, 3, 2);
  painter.dot(MATERIAL.white, CENTER_X, 21);
  const skirtHalfWidths = [3, 4, 4, 5, 5, 6];
  skirtHalfWidths.forEach((halfWidth, index) => {
    painter.span(colors.cloth, CENTER_X - halfWidth + 1, CENTER_X + halfWidth + 1, 23 + index);
    painter.dot(colors.clothShade, CENTER_X + halfWidth + 1, 23 + index);
    if (index % 2 === 1) painter.span(colors.clothShade, CENTER_X - halfWidth + 2, CENTER_X, 23 + index);
  });
  painter.span(colors.trim, CENTER_X - 5, CENTER_X + 7, 28);
  painter.span(MATERIAL.goldDark, CENTER_X - 5, CENTER_X + 7, 29);
}

function paintLegs(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.skin, CENTER_X - 3, 30, 4, 9);
  painter.rect(colors.skinShade, CENTER_X, 30, 1, 9);
  painter.line(colors.skin, CENTER_X + 3, 30, CENTER_X + 6, 39, 4);
  painter.line(colors.skinShade, CENTER_X + 5, 30, CENTER_X + 8, 39);
  painter.rect(colors.clothShade, CENTER_X - 4, 38, 5, 16);
  painter.rect(colors.cloth, CENTER_X - 4, 38, 5, 2);
  painter.rect(colors.trim, CENTER_X - 4, 40, 5, 1);
  painter.rect(darken(colors.clothShade, 0.7), CENTER_X, 41, 1, 13);
  painter.line(colors.clothShade, CENTER_X + 7, 39, CENTER_X + 9, 53, 5);
  painter.rect(colors.cloth, CENTER_X + 5, 38, 5, 2);
  painter.rect(colors.trim, CENTER_X + 5, 40, 5, 1);
  painter.rect(darken(colors.clothShade, 0.7), CENTER_X - 8, 54, 9, 3);
  painter.rect(darken(colors.clothShade, 0.7), CENTER_X + 6, 54, 9, 3);
  painter.rect(colors.cloth, CENTER_X - 8, 54, 9, 1);
  painter.rect(colors.cloth, CENTER_X + 6, 54, 9, 1);
}

function paintArms(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.skin, CENTER_X + 4, 12, 12, 3);
  painter.rect(colors.skinShade, CENTER_X + 4, 14, 12, 1);
  painter.rect(colors.cloth, BOW_GRIP_X - 2, ARROW_Y - 1, 5, 6);
  painter.rect(colors.trim, BOW_GRIP_X - 2, ARROW_Y - 1, 5, 1);
  painter.rect(colors.skin, 5, 12, 11, 3);
  painter.rect(colors.skinShade, 5, 14, 11, 1);
  painter.rect(MATERIAL.leather, 8, 12, 2, 3);
  painter.rect(colors.trim, 10, 12, 1, 3);
  painter.rect(colors.skin, 13, 10, 4, 4);
  painter.rect(colors.skinShade, 13, 13, 4, 1);
}

function paintBowAndArrow(painter: SpritePainter, colors: HeroColors): void {
  const bowX = (row: number): number => BOW_GRIP_X - Math.round((Math.abs(row - ARROW_Y - 1) / 12) ** 2 * 5);
  for (let row = BOW_TOP_Y; row <= BOW_BOTTOM_Y; row++) {
    painter.rect(colors.trim, bowX(row), row, 2, 1);
    painter.dot(colors.clothShade, bowX(row) + 2, row);
  }
  painter.line(BOW_STRING, bowX(BOW_TOP_Y), BOW_TOP_Y, STRING_HAND_X, ARROW_Y);
  painter.line(BOW_STRING, bowX(BOW_BOTTOM_Y), BOW_BOTTOM_Y, STRING_HAND_X, ARROW_Y);
  painter.rect(ARROW_SHAFT, STRING_HAND_X, ARROW_Y, 21, 1);
  painter.rect(colors.trim, STRING_HAND_X, ARROW_Y - 1, 3, 1);
  painter.rect(colors.trim, STRING_HAND_X, ARROW_Y + 1, 3, 1);
  painter.rect('#e8eef4', BOW_GRIP_X + 3, ARROW_Y, 3, 1);
  painter.rect('#e8eef4', BOW_GRIP_X + 3, ARROW_Y - 1, 1, 3);
}

export function drawArcherFigure(colors: HeroColors): HTMLCanvasElement {
  const drawing = startPortrait();
  const { painter } = drawing;
  paintArcherCloak(painter, colors, { centerX: CENTER_X, shoulderY: 11, hemY: 54, shoulderHalfWidth: 6, hemHalfWidth: 9, hemSway: 5 });
  paintArcherHood(painter, colors, CENTER_X, 0, 12);
  paintQuiverAndHair(painter, colors);
  paintLegs(painter, colors);
  paintOutfit(painter, colors);
  paintElfHead(painter, colors, CENTER_X, 0);
  paintArms(painter, colors);
  paintBowAndArrow(painter, colors);
  painter.rect(lighten(colors.cloth), CENTER_X - 4, 11, 9, 1);
  return finishPortrait(drawing);
}
