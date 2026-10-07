import { paintArcherCloak, paintArcherHood, paintArcherMantle } from '../headgear/archerCloak';
import { paintElfHead, paintElfPonytail } from '../headgear/archerHead';
import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';
import { paintBowAndArrow, paintBowArm, paintDrawArm } from './archerFigureArms';
import { finishPortrait, startPortrait } from './portraitFrame';

const CENTER_X = 14;
const HEAD_TOP = 2;
const BOOT_TOP_Y = 43;
const SOLE_Y = 56;

function paintQuiver(painter: SpritePainter): void {
  painter.line(MATERIAL.leatherLight, 5, 12, 9, 26, 4);
  painter.line(MATERIAL.leather, 7, 12, 11, 26, 2);
  painter.line(darken(MATERIAL.leather, 0.6), 8, 13, 11, 25);
  painter.line(MATERIAL.gold, 5, 12, 6, 14, 1);
  for (let arrowIndex = 0; arrowIndex < 3; arrowIndex++) {
    const fletchingX = 3 + arrowIndex * 2;
    const fletchingY = 6 + arrowIndex * 2;
    painter.rect(MATERIAL.leatherLight, fletchingX + 1, fletchingY + 3, 1, 3);
    painter.rect(MATERIAL.red, fletchingX, fletchingY, 1, 3);
    painter.rect(MATERIAL.white, fletchingX + 1, fletchingY, 1, 3);
  }
}

function paintBoot(painter: SpritePainter, colors: HeroColors, shinX: number, footX: number): void {
  const shinTop = BOOT_TOP_Y;
  painter.line(MATERIAL.leather, shinX, shinTop, footX, SOLE_Y - 3, 4);
  painter.line(MATERIAL.leatherLight, shinX, shinTop, footX, SOLE_Y - 3);
  painter.line(darken(MATERIAL.leather, 0.6), shinX + 3, shinTop, footX + 3, SOLE_Y - 3);
  painter.rect(MATERIAL.leather, footX, SOLE_Y - 3, 8, 3);
  painter.rect(MATERIAL.leatherLight, footX, SOLE_Y - 3, 7, 1);
  painter.rect(MATERIAL.boot, footX, SOLE_Y, 8, 1);
  painter.span(darken(MATERIAL.leather, 0.6), footX + 5, footX + 7, SOLE_Y - 2);
  painter.dot(MATERIAL.goldDark, footX + 4, SOLE_Y - 3);
  painter.rect(colors.cloth, shinX - 1, shinTop - 1, 6, 2);
  painter.span(lighten(colors.cloth, 1.3), shinX - 1, shinX + 3, shinTop - 1);
  painter.span(colors.trim, shinX - 1, shinX + 4, shinTop + 1);
}

function paintLegs(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.skinShade, 12, 30, 7, BOOT_TOP_Y, 4);
  painter.line(colors.skin, 11, 30, 6, BOOT_TOP_Y, 3);
  painter.line(lighten(colors.skin, 1.15), 11, 33, 6, BOOT_TOP_Y - 1);
  painter.line(colors.skinShade, 17, 30, 22, BOOT_TOP_Y, 4);
  painter.line(colors.skin, 16, 30, 21, BOOT_TOP_Y, 3);
  painter.line(lighten(colors.skin, 1.15), 16, 33, 21, BOOT_TOP_Y - 1);
  paintBoot(painter, colors, 4, 3);
  paintBoot(painter, colors, 21, 23);
}

function paintBodice(painter: SpritePainter, colors: HeroColors): void {
  const halfWidths = [5, 5, 5, 4, 4, 3, 3, 3, 3, 4];
  halfWidths.forEach((halfWidth, index) => {
    const row = 15 + index;
    painter.span(colors.cloth, CENTER_X - halfWidth + 1, CENTER_X + halfWidth + 1, row);
    painter.span(colors.clothShade, CENTER_X + halfWidth - 1, CENTER_X + halfWidth + 1, row);
    painter.dot(lighten(colors.cloth, 1.3), CENTER_X - halfWidth + 1, row);
  });
  painter.span(colors.clothLight, CENTER_X - 3, CENTER_X - 1, 17);
  painter.span(colors.clothLight, CENTER_X + 1, CENTER_X + 3, 17);
  painter.span(colors.clothShade, CENTER_X - 3, CENTER_X + 3, 18);
  painter.rect(colors.trim, CENTER_X + 1, 15, 1, 9);
  for (const row of [19, 21]) {
    painter.dot(MATERIAL.leather, CENTER_X, row);
    painter.dot(MATERIAL.leather, CENTER_X + 2, row + 1);
  }
  painter.rect(MATERIAL.leather, CENTER_X - 3, 24, 9, 2);
  painter.span(MATERIAL.leatherLight, CENTER_X - 3, CENTER_X + 5, 24);
  painter.rect(colors.trim, CENTER_X, 24, 3, 2);
  painter.dot(MATERIAL.white, CENTER_X + 1, 24);
}

function paintSkirt(painter: SpritePainter, colors: HeroColors): void {
  const halfWidths = [4, 5, 5, 6, 6, 7, 7];
  halfWidths.forEach((halfWidth, index) => {
    const row = 26 + index;
    const left = CENTER_X - halfWidth + 1;
    const right = CENTER_X + halfWidth;
    painter.span(colors.cloth, left, right, row);
    painter.span(colors.clothShade, right - 2, right, row);
    painter.dot(lighten(colors.cloth, 1.3), left, row);
    if (index > 1) painter.dot(colors.clothShade, CENTER_X - 2, row);
    if (index > 2) painter.dot(colors.clothShade, CENTER_X + 3, row);
  });
  painter.span(colors.trim, CENTER_X - 6, CENTER_X + 7, 33);
  painter.span(darken(colors.trim, 0.65), CENTER_X - 6, CENTER_X + 7, 34);
}

export function drawArcherFigure(colors: HeroColors): HTMLCanvasElement {
  const drawing = startPortrait();
  const { painter } = drawing;
  paintArcherCloak(painter, colors, { centerX: 12, shoulderY: 14, hemY: 52, shoulderHalfWidth: 7, hemHalfWidth: 10, hemSway: 4 });
  paintQuiver(painter);
  paintElfPonytail(painter, colors, 8, 6, 32, 3);
  paintArcherHood(painter, colors, CENTER_X, HEAD_TOP, 11);
  paintLegs(painter, colors);
  paintSkirt(painter, colors);
  paintBodice(painter, colors);
  paintArcherMantle(painter, colors, CENTER_X + 1, 13, 7);
  paintBowAndArrow(painter, colors);
  paintElfHead(painter, colors, CENTER_X, HEAD_TOP);
  paintDrawArm(painter, colors);
  paintBowArm(painter, colors);
  return finishPortrait(drawing);
}
