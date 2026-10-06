import { addHeroOutline, createHeroCanvas } from '../heroCanvas';
import { paintElfHead, paintElfPonytail } from '../headgear/archerHead';
import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import { createSpritePainter, type SpritePainter } from '../spritePainter';

const DRAWING_WIDTH = 30;
const DRAWING_HEIGHT = 38;
const OUTLINE_MARGIN = 1;
export const ARCHER_SPRITE_SIZE = { width: DRAWING_WIDTH + 2 * OUTLINE_MARGIN, height: DRAWING_HEIGHT + 2 * OUTLINE_MARGIN } as const;

const CENTER_X = 14;
const ARROW_Y = 12;
const BOW_GRIP_X = 25;
const BOW_TOP_Y = 3;
const BOW_BOTTOM_Y = 23;
const STRING_HAND_X = 12;
const BOW_STRING = '#e8e0cc';
const ARROW_SHAFT = '#c8a878';

function paintHair(painter: SpritePainter, colors: HeroColors): void {
  paintElfPonytail(painter, colors, 10, 5, 22);
}

function paintLegs(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.skin, 11, 24, 3, 6);
  painter.rect(colors.skinShade, 13, 24, 1, 6);
  painter.line(colors.skin, 16, 24, 18, 30, 3);
  painter.line(colors.skinShade, 18, 24, 20, 30);
  painter.rect(MATERIAL.leather, 11, 29, 3, 7);
  painter.rect(MATERIAL.leatherLight, 11, 29, 3, 1);
  painter.rect(colors.trim, 11, 30, 3, 1);
  painter.rect(darken(MATERIAL.leather, 0.7), 13, 31, 1, 5);
  painter.line(MATERIAL.leather, 18, 30, 19, 35, 3);
  painter.rect(MATERIAL.leatherLight, 17, 29, 3, 1);
  painter.rect(colors.trim, 17, 30, 3, 1);
  painter.rect(MATERIAL.boot, 8, 36, 6, 2);
  painter.rect(MATERIAL.boot, 17, 36, 7, 2);
  painter.rect(MATERIAL.leatherLight, 8, 36, 6, 1);
  painter.rect(MATERIAL.leatherLight, 17, 36, 7, 1);
}

function paintOutfit(painter: SpritePainter, colors: HeroColors): void {
  const halfWidthByRow = [4, 4, 4, 3, 3, 2, 2, 3];
  halfWidthByRow.forEach((halfWidth, index) => {
    const row = 12 + index;
    painter.span(colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, row);
    painter.dot(colors.clothShade, CENTER_X + halfWidth, row);
  });
  painter.span(colors.clothLight, CENTER_X - 3, CENTER_X - 1, 14);
  painter.span(colors.clothLight, CENTER_X + 1, CENTER_X + 3, 14);
  painter.span(colors.clothShade, CENTER_X - 3, CENTER_X + 3, 15);
  painter.rect(colors.trim, CENTER_X, 13, 1, 6);
  painter.dot(MATERIAL.leather, CENTER_X - 1, 14);
  painter.dot(MATERIAL.leather, CENTER_X + 1, 16);
  painter.rect(MATERIAL.leather, CENTER_X - 3, 19, 7, 1);
  painter.rect(colors.trim, CENTER_X - 1, 19, 3, 1);
  const skirtHalfWidths = [3, 4, 4, 5];
  skirtHalfWidths.forEach((halfWidth, index) => {
    painter.span(colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, 20 + index);
    painter.dot(colors.clothShade, CENTER_X + halfWidth, 20 + index);
  });
  painter.span(colors.trim, CENTER_X - 5, CENTER_X + 5, 23);
  painter.span(colors.clothShade, CENTER_X - 4, CENTER_X + 4, 22);
}

function paintBowAndArrow(painter: SpritePainter): void {
  const bowX = (row: number): number => BOW_GRIP_X - Math.round((Math.abs(row - ARROW_Y) / 10) ** 2 * 4);
  for (let row = BOW_TOP_Y; row <= BOW_BOTTOM_Y; row++) {
    painter.dot(MATERIAL.wood, bowX(row), row);
    painter.dot(MATERIAL.woodDark, bowX(row) + 1, row);
  }
  painter.rect(MATERIAL.leather, BOW_GRIP_X - 1, ARROW_Y - 2, 3, 5);
  painter.line(BOW_STRING, bowX(BOW_TOP_Y), BOW_TOP_Y, STRING_HAND_X, ARROW_Y);
  painter.line(BOW_STRING, bowX(BOW_BOTTOM_Y), BOW_BOTTOM_Y, STRING_HAND_X, ARROW_Y);
  painter.rect(ARROW_SHAFT, STRING_HAND_X, ARROW_Y, 15, 1);
  painter.rect(MATERIAL.red, STRING_HAND_X, ARROW_Y - 1, 2, 1);
  painter.rect(MATERIAL.red, STRING_HAND_X, ARROW_Y + 1, 2, 1);
  painter.rect('#e8eef4', BOW_GRIP_X + 3, ARROW_Y, 3, 1);
  painter.dot('#e8eef4', BOW_GRIP_X + 3, ARROW_Y - 1);
}

function paintArms(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.skin, 18, 13, 6, 2);
  painter.rect(colors.skinShade, 18, 14, 6, 1);
  painter.rect(colors.skin, 5, 13, 6, 2);
  painter.rect(colors.skinShade, 5, 14, 6, 1);
  painter.rect(colors.skin, 10, 12, 3, 2);
  painter.rect(colors.skinShade, 10, 13, 3, 1);
  painter.rect(MATERIAL.leather, 7, 13, 1, 2);
  painter.rect(colors.trim, 8, 13, 1, 2);
}

export function drawArcherSprite(colors: HeroColors): HTMLCanvasElement {
  const art = createHeroCanvas(ARCHER_SPRITE_SIZE.width, ARCHER_SPRITE_SIZE.height);
  const painter = createSpritePainter(art, OUTLINE_MARGIN, OUTLINE_MARGIN);
  paintHair(painter, colors);
  paintLegs(painter, colors);
  paintOutfit(painter, colors);
  paintElfHead(painter, colors, CENTER_X, 1);
  paintArms(painter, colors);
  paintBowAndArrow(painter);
  painter.rect(lighten(colors.cloth), CENTER_X - 4, 12, 9, 1);
  addHeroOutline(art);
  return art.canvas;
}
