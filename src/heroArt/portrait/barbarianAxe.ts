import { MATERIAL, OUTLINE, darken, lighten, type HeroColors } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';

const HAFT_BUTT = { x: 3, y: 54 };
const HAFT_TIP = { x: 27, y: 4 };
const BLADE_TOP = 5;
const BLADE_BOTTOM = 24;
const BLADE_REACH = 10;
const HAFT_LIGHT = '#d6a668';
const HAFT_MID = '#a87444';
const HAFT_DARK = '#6b4528';
const STEEL = '#aab4c4';
const STEEL_LIGHT = '#dfe6ee';
const STEEL_SHADE = '#6f7a8c';
const STEEL_DEEP = '#454e60';

export const UPPER_FIST = { x: 16, y: 30 };
export const LOWER_FIST = { x: 10, y: 42 };

export function haftXAt(row: number): number {
  const progress = (row - HAFT_BUTT.y) / (HAFT_TIP.y - HAFT_BUTT.y);
  return Math.round(HAFT_BUTT.x + (HAFT_TIP.x - HAFT_BUTT.x) * progress);
}

export function paintAxeHaft(painter: SpritePainter): void {
  painter.line(OUTLINE, HAFT_BUTT.x - 2, HAFT_BUTT.y, HAFT_TIP.x - 2, HAFT_TIP.y, 1);
  painter.line(OUTLINE, HAFT_BUTT.x + 4, HAFT_BUTT.y, HAFT_TIP.x + 4, HAFT_TIP.y, 1);
  painter.line(HAFT_DARK, HAFT_BUTT.x + 2, HAFT_BUTT.y, HAFT_TIP.x + 2, HAFT_TIP.y, 2);
  painter.line(HAFT_MID, HAFT_BUTT.x, HAFT_BUTT.y, HAFT_TIP.x, HAFT_TIP.y, 2);
  painter.line(HAFT_LIGHT, HAFT_BUTT.x - 1, HAFT_BUTT.y, HAFT_TIP.x - 1, HAFT_TIP.y, 1);
  painter.rect(STEEL_SHADE, HAFT_BUTT.x - 1, HAFT_BUTT.y, 4, 2);
  painter.dot(STEEL_LIGHT, HAFT_BUTT.x - 1, HAFT_BUTT.y);
}

function bladeReachAt(row: number): number {
  const progress = (row - BLADE_TOP) / (BLADE_BOTTOM - BLADE_TOP);
  return Math.max(2, Math.round(BLADE_REACH * Math.pow(Math.sin(Math.PI * progress), 0.7)));
}

// A bearded axe head. The cutting edge bulges to the right and gets a white rim light.
export function paintAxeHead(painter: SpritePainter): void {
  for (let row = BLADE_TOP; row <= BLADE_BOTTOM; row++) {
    const haftX = haftXAt(row);
    const reach = bladeReachAt(row);
    const edgeX = haftX + reach;
    const isLowerHalf = row > (BLADE_TOP + BLADE_BOTTOM) / 2;
    painter.span(isLowerHalf ? STEEL_SHADE : STEEL, haftX + 2, edgeX, row);
    if (reach > 5) painter.span(STEEL_SHADE, haftX + 2, haftX + 4, row);
    painter.span(STEEL_DEEP, haftX + 1, haftX + 1, row);
    const nextEdgeX = haftXAt(row + 1) + bladeReachAt(row + 1);
    painter.span(OUTLINE, Math.min(edgeX, nextEdgeX) + 1, edgeX + 1, row);
    painter.dot(MATERIAL.white, edgeX, row);
    if (reach > 4) painter.dot(STEEL_LIGHT, edgeX - 1, row);
  }
  const tipX = HAFT_TIP.x;
  painter.rect(STEEL, tipX, HAFT_TIP.y - 3, 2, 4);
  painter.dot(STEEL_LIGHT, tipX, HAFT_TIP.y - 3);
  painter.dot(MATERIAL.white, tipX, HAFT_TIP.y - 4);
  painter.dot(STEEL_DEEP, tipX + 1, HAFT_TIP.y);
  painter.rect(STEEL_DEEP, haftXAt(BLADE_BOTTOM + 1), BLADE_BOTTOM + 1, 3, 2);
  painter.rect(STEEL_SHADE, haftXAt(BLADE_BOTTOM + 3) - 1, BLADE_BOTTOM + 3, 3, 1);
  painter.rect(MATERIAL.leather, haftXAt(14) + 1, 14, 3, 3);
  painter.dot(MATERIAL.red, haftXAt(15) + 1, 15);
  painter.dot(MATERIAL.red, haftXAt(16) + 1, 16);
}

function paintLimb(painter: SpritePainter, colors: HeroColors, from: { x: number; y: number }, to: { x: number; y: number }, thickness: number): void {
  painter.line(darken(colors.skinShade, 0.8), from.x, from.y, to.x, to.y, thickness);
  painter.line(colors.skinShade, from.x + 1, from.y + 1, to.x + 1, to.y + 1, thickness - 2);
  painter.line(colors.skin, from.x, from.y, to.x, to.y, thickness - 2);
  painter.line(lighten(colors.skin, 1.12), from.x, from.y, to.x, to.y, 1);
}

function paintFist(painter: SpritePainter, colors: HeroColors, fist: { x: number; y: number }): void {
  const gap = darken(colors.skinShade, 0.7);
  painter.rect(darken(colors.skinShade, 0.6), fist.x - 4, fist.y - 3, 9, 7);
  painter.rect(colors.skin, fist.x - 3, fist.y - 2, 7, 5);
  painter.rect(MATERIAL.leather, fist.x - 3, fist.y + 3, 7, 1);
  painter.rect(lighten(colors.skin, 1.12), fist.x - 3, fist.y - 2, 6, 1);
  painter.rect(colors.skinShade, fist.x - 3, fist.y + 2, 7, 1);
  for (const gapOffset of [-1, 1, 3]) painter.rect(gap, fist.x + gapOffset, fist.y - 1, 1, 3);
  painter.rect(colors.skin, fist.x - 4, fist.y - 1, 2, 3);
  painter.dot(lighten(colors.skin, 1.2), fist.x - 4, fist.y - 1);
}

function paintBracer(painter: SpritePainter, centerX: number, centerY: number): void {
  painter.rect(MATERIAL.leather, centerX - 3, centerY - 2, 6, 4);
  painter.rect(MATERIAL.leatherLight, centerX - 3, centerY - 2, 6, 1);
  painter.rect(MATERIAL.boot, centerX - 3, centerY + 1, 6, 1);
  painter.dot(STEEL_LIGHT, centerX - 2, centerY - 1);
  painter.dot(STEEL_LIGHT, centerX, centerY - 1);
  painter.dot(STEEL_LIGHT, centerX + 2, centerY - 1);
}

export function paintArmLimbs(painter: SpritePainter, colors: HeroColors): void {
  const lowerShoulder = { x: 5, y: 21 };
  const lowerElbow = { x: 3, y: 30 };
  paintLimb(painter, colors, lowerShoulder, lowerElbow, 6);
  paintLimb(painter, colors, lowerElbow, { x: LOWER_FIST.x - 2, y: LOWER_FIST.y - 2 }, 5);
  paintBracer(painter, 6, 36);
  painter.rect(colors.skinShade, 3, 27, 3, 1);
  painter.dot(lighten(colors.skin, 1.2), 6, 24);

  const upperShoulder = { x: 27, y: 21 };
  const upperElbow = { x: 30, y: 31 };
  paintLimb(painter, colors, upperShoulder, upperElbow, 6);
  paintLimb(painter, colors, upperElbow, { x: UPPER_FIST.x + 3, y: UPPER_FIST.y }, 5);
  paintBracer(painter, 25, 30);
  painter.rect(colors.skinShade, 29, 27, 3, 1);
}

export function paintHands(painter: SpritePainter, colors: HeroColors): void {
  paintFist(painter, colors, LOWER_FIST);
  paintFist(painter, colors, UPPER_FIST);
}
