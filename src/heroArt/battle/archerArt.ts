import { addHeroOutline, createHeroCanvas } from '../heroCanvas';
import { paintArcherCloak, paintArcherHood, paintArcherMantle } from '../headgear/archerCloak';
import { paintElfHead, paintElfPonytail } from '../headgear/archerHead';
import type { HeroPose } from '../heroPose';
import { MATERIAL, type HeroColors } from '../heroPalette';
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

function paintBoot(painter: SpritePainter, colors: HeroColors, shinX: number, footX: number): void {
  painter.line(MATERIAL.leather, shinX, 31, footX, 35, 3);
  painter.line(MATERIAL.leatherLight, shinX, 31, footX, 35);
  painter.rect(MATERIAL.leather, footX, 35, 6, 3);
  painter.rect(MATERIAL.leatherLight, footX, 35, 5, 1);
  painter.rect(MATERIAL.boot, footX, 37, 6, 1);
  painter.rect(colors.cloth, shinX - 1, 30, 4, 1);
  painter.rect(colors.trim, shinX - 1, 31, 4, 1);
}

function paintLegs(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.skinShade, 12, 24, 10, 31, 3);
  painter.line(colors.skin, 11, 24, 9, 31, 2);
  painter.line(colors.skinShade, 16, 24, 19, 31, 3);
  painter.line(colors.skin, 15, 24, 18, 31, 2);
  paintBoot(painter, colors, 8, 6);
  paintBoot(painter, colors, 18, 19);
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

const RELOAD_ARROW_FROM_X = 17;

// Ready: the string is drawn back with the arrow nocked. Released: the string springs straight and the arrow is gone.
// Reload: the string is straight and a new arrow slides onto the bow.
function paintBowAndArrow(painter: SpritePainter, colors: HeroColors, pose: HeroPose): void {
  const bowX = (row: number): number => BOW_GRIP_X - Math.round((Math.abs(row - ARROW_Y) / 10) ** 2 * 4);
  for (let row = BOW_TOP_Y; row <= BOW_BOTTOM_Y; row++) {
    painter.dot(colors.trim, bowX(row), row);
    painter.dot(colors.clothShade, bowX(row) + 1, row);
  }
  painter.rect(colors.cloth, BOW_GRIP_X - 1, ARROW_Y - 2, 3, 5);
  const isDrawn = pose === 'ready' || pose === 'charge';
  const stringHandX = isDrawn ? STRING_HAND_X : bowX(ARROW_Y);
  painter.line(BOW_STRING, bowX(BOW_TOP_Y), BOW_TOP_Y, stringHandX, ARROW_Y);
  painter.line(BOW_STRING, bowX(BOW_BOTTOM_Y), BOW_BOTTOM_Y, stringHandX, ARROW_Y);
  if (pose === 'released') return;
  const arrowFromX = isDrawn ? STRING_HAND_X : RELOAD_ARROW_FROM_X;
  painter.rect(ARROW_SHAFT, arrowFromX, ARROW_Y, BOW_GRIP_X + 3 - arrowFromX, 1);
  painter.rect(colors.trim, arrowFromX, ARROW_Y - 1, 2, 1);
  painter.rect(colors.trim, arrowFromX, ARROW_Y + 1, 2, 1);
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

export function drawArcherSprite(colors: HeroColors, pose: HeroPose = 'ready'): HTMLCanvasElement {
  const art = createHeroCanvas(ARCHER_SPRITE_SIZE.width, ARCHER_SPRITE_SIZE.height);
  const painter = createSpritePainter(art, OUTLINE_MARGIN, OUTLINE_MARGIN);
  paintArcherCloak(painter, colors, { centerX: CENTER_X, shoulderY: 12, hemY: 33, shoulderHalfWidth: 5, hemHalfWidth: 7, hemSway: 3 });
  paintArcherHood(painter, colors, CENTER_X, 1, 11);
  paintHair(painter, colors);
  paintLegs(painter, colors);
  paintOutfit(painter, colors);
  paintArcherMantle(painter, colors, CENTER_X + 1, 11, 5);
  paintBowAndArrow(painter, colors, pose);
  paintElfHead(painter, colors, CENTER_X, 1);
  paintArms(painter, colors);
  addHeroOutline(art);
  return art.canvas;
}
