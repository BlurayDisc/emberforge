import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';

export const ARROW_Y = 13;
const BOW_GRIP_X = 32;
const BOW_CENTER_Y = 14;
const BOW_HALF_HEIGHT = 14;
const BOW_BEND = 6;
const NOCK_X = 12;
const BOW_STRING = '#e8e0cc';
const ARROW_SHAFT = '#c8a878';
const ARROW_HEAD = '#e8eef4';

function paintLimb(painter: SpritePainter, colors: HeroColors, fromX: number, fromY: number, toX: number, toY: number): void {
  painter.line(colors.skinShade, fromX, fromY + 1, toX, toY + 1, 3);
  painter.line(colors.skin, fromX, fromY, toX, toY, 2);
  painter.line(lighten(colors.skin, 1.2), fromX, fromY, toX, toY);
}

function paintBracer(painter: SpritePainter, colors: HeroColors, fromX: number, toX: number, y: number): void {
  painter.rect(MATERIAL.leather, fromX, y, toX - fromX + 1, 3);
  painter.span(MATERIAL.leatherLight, fromX, toX, y);
  painter.span(darken(MATERIAL.leather, 0.7), fromX, toX, y + 2);
  painter.rect(colors.trim, fromX + 1, y, 1, 3);
}

export function paintDrawArm(painter: SpritePainter, colors: HeroColors): void {
  paintLimb(painter, colors, 10, 17, 4, 15);
  paintLimb(painter, colors, 5, 14, 12, 13);
  paintBracer(painter, colors, 6, 10, 13);
  painter.rect(colors.skin, 11, 12, 3, 3);
  painter.rect(colors.skinShade, 11, 14, 3, 1);
  painter.dot(lighten(colors.skin, 1.2), 11, 12);
}

export function paintBowArm(painter: SpritePainter, colors: HeroColors): void {
  paintLimb(painter, colors, 20, 16, 30, 15);
  paintBracer(painter, colors, 25, 29, 14);
  painter.rect(colors.skin, 30, 14, 3, 4);
  painter.span(colors.skinShade, 30, 32, 17);
  painter.dot(lighten(colors.skin, 1.2), 30, 14);
}

export function paintBowAndArrow(painter: SpritePainter, colors: HeroColors): void {
  const bowX = (row: number): number => BOW_GRIP_X - Math.round((Math.abs(row - BOW_CENTER_Y) / BOW_HALF_HEIGHT) ** 2 * BOW_BEND);
  const topY = BOW_CENTER_Y - BOW_HALF_HEIGHT;
  const bottomY = BOW_CENTER_Y + BOW_HALF_HEIGHT;
  for (let row = topY; row <= bottomY; row++) {
    painter.dot(lighten(colors.trim, 1.25), bowX(row), row);
    painter.dot(colors.trim, bowX(row) + 1, row);
    painter.dot(darken(colors.trim, 0.6), bowX(row) + 2, row);
  }
  painter.dot(MATERIAL.white, bowX(topY) - 1, topY);
  painter.dot(MATERIAL.white, bowX(bottomY) - 1, bottomY);
  painter.line(BOW_STRING, bowX(topY) - 1, topY, NOCK_X, ARROW_Y);
  painter.line(BOW_STRING, bowX(bottomY) - 1, bottomY, NOCK_X, ARROW_Y);
  painter.rect(ARROW_SHAFT, NOCK_X, ARROW_Y, BOW_GRIP_X + 3 - NOCK_X, 1);
  painter.span(lighten(ARROW_SHAFT), NOCK_X + 4, BOW_GRIP_X - 4, ARROW_Y);
  painter.rect(colors.trim, NOCK_X, ARROW_Y - 1, 3, 1);
  painter.rect(MATERIAL.white, NOCK_X + 1, ARROW_Y + 1, 3, 1);
  painter.rect(ARROW_HEAD, BOW_GRIP_X + 3, ARROW_Y, 3, 1);
  painter.rect(ARROW_HEAD, BOW_GRIP_X + 3, ARROW_Y - 1, 1, 3);
  painter.dot(darken(ARROW_HEAD, 0.7), BOW_GRIP_X + 4, ARROW_Y + 1);
  painter.rect(MATERIAL.leather, BOW_GRIP_X - 1, ARROW_Y + 1, 3, 4);
}
