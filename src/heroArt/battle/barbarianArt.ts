import { addHeroOutline, createHeroCanvas } from '../heroCanvas';
import { MATERIAL, OUTLINE, darken, lighten, type HeroColors } from '../heroPalette';
import { paintBarbarianHead } from '../headgear/barbarianHead';
import { paintSpikedShoulder } from '../gruntParts';
import { createSpritePainter, type SpritePainter } from '../spritePainter';

const DRAWING_WIDTH = 32;
const DRAWING_HEIGHT = 38;
const OUTLINE_MARGIN = 1;
export const BARBARIAN_SPRITE_SIZE = { width: DRAWING_WIDTH + 2 * OUTLINE_MARGIN, height: DRAWING_HEIGHT + 2 * OUTLINE_MARGIN } as const;

const CENTER_X = 15;
const HEAD_TOP = 3;
const TORSO_TOP = 15;
const HAFT_BUTT = { x: 3, y: 36 };
const HAFT_TIP = { x: 26, y: 3 };
const BLADE_TOP = 6;
const BLADE_BOTTOM = 20;
const BLADE_REACH = 6;
const UPPER_FIST = { x: 12, y: 24 };
const LOWER_FIST = { x: 8, y: 31 };
const BONE = '#e8e4d4';
const FUR = '#8a6a48';
const FUR_LIGHT = '#b89a70';
const FUR_DEEP = '#5e4630';
const STEEL = '#aab4c4';
const STEEL_SHADE = '#6f7a8c';
const STEEL_DEEP = '#454e60';
const HAFT_LIGHT = '#d6a668';
const HAFT_MID = '#a87444';
const HAFT_DARK = '#6b4528';

function haftXAt(row: number): number {
  const progress = (row - HAFT_BUTT.y) / (HAFT_TIP.y - HAFT_BUTT.y);
  return Math.round(HAFT_BUTT.x + (HAFT_TIP.x - HAFT_BUTT.x) * progress);
}

function bladeReachAt(row: number): number {
  const progress = (row - BLADE_TOP) / (BLADE_BOTTOM - BLADE_TOP);
  return Math.max(2, Math.round(BLADE_REACH * Math.pow(Math.sin(Math.PI * progress), 0.7)));
}

function paintLegs(painter: SpritePainter, colors: HeroColors): void {
  for (let row = 28; row < 37; row++) {
    const spread = Math.floor((row - 28) / 4);
    const isBoot = row >= 32;
    const base = isBoot ? MATERIAL.boot : colors.cloth;
    const lit = isBoot ? MATERIAL.leather : lighten(colors.cloth, 1.18);
    const shade = isBoot ? darken(MATERIAL.boot, 0.7) : colors.clothShade;
    painter.span(base, CENTER_X - 7 - spread, CENTER_X - 2 - spread, row);
    painter.span(base, CENTER_X + 2 + spread, CENTER_X + 7 + spread, row);
    painter.dot(lit, CENTER_X - 7 - spread, row);
    painter.dot(lit, CENTER_X + 2 + spread, row);
    painter.dot(shade, CENTER_X - 2 - spread, row);
    painter.dot(shade, CENTER_X + 7 + spread, row);
  }
  painter.span(FUR_LIGHT, CENTER_X - 7, CENTER_X - 2, 31);
  painter.span(FUR_LIGHT, CENTER_X + 2, CENTER_X + 7, 31);
  painter.span(FUR_DEEP, CENTER_X - 7, CENTER_X - 2, 32);
  painter.span(FUR_DEEP, CENTER_X + 2, CENTER_X + 7, 32);
  painter.span(MATERIAL.leatherLight, CENTER_X - 10, CENTER_X - 5, 36);
  painter.span(MATERIAL.leatherLight, CENTER_X + 5, CENTER_X + 10, 36);
}

function paintTorso(painter: SpritePainter, colors: HeroColors): void {
  const highlight = lighten(colors.skin, 1.12);
  for (let row = 0; row < 14; row++) {
    const halfWidth = 7 - Math.floor(row * 0.15);
    painter.span(colors.skin, CENTER_X - halfWidth, CENTER_X + halfWidth, TORSO_TOP + row);
    painter.span(colors.skinShade, CENTER_X + halfWidth - 1, CENTER_X + halfWidth, TORSO_TOP + row);
  }
  painter.span(highlight, CENTER_X - 5, CENTER_X - 2, TORSO_TOP + 2);
  painter.span(colors.skinShade, CENTER_X - 6, CENTER_X - 1, TORSO_TOP + 5);
  painter.span(colors.skinShade, CENTER_X + 1, CENTER_X + 6, TORSO_TOP + 5);
  painter.rect(colors.skinShade, CENTER_X, TORSO_TOP + 2, 1, 11);
  for (const row of [8, 10, 12]) {
    painter.span(colors.skinShade, CENTER_X - 3, CENTER_X - 1, TORSO_TOP + row);
    painter.span(colors.skinShade, CENTER_X + 1, CENTER_X + 3, TORSO_TOP + row);
  }
  for (const strapX of [CENTER_X - 5, CENTER_X + 4]) {
    painter.rect(MATERIAL.leather, strapX, TORSO_TOP, 2, 11);
    painter.dot(BONE, strapX, TORSO_TOP + 4);
  }
  painter.rect(MATERIAL.boot, CENTER_X - 7, TORSO_TOP + 11, 15, 3);
  painter.rect(MATERIAL.leather, CENTER_X - 7, TORSO_TOP + 11, 15, 1);
  painter.rect(BONE, CENTER_X - 2, TORSO_TOP + 11, 5, 3);
  painter.dot(MATERIAL.boot, CENTER_X - 1, TORSO_TOP + 12);
  painter.dot(MATERIAL.boot, CENTER_X + 1, TORSO_TOP + 12);
  painter.rect(colors.cloth, CENTER_X - 2, TORSO_TOP + 14, 5, 4);
  painter.span(colors.trim, CENTER_X - 2, CENTER_X + 2, TORSO_TOP + 17);
}

function paintFurMantle(painter: SpritePainter): void {
  for (let column = CENTER_X - 8; column <= CENTER_X + 8; column++) {
    const hangRows = 3 + (column % 3 === 0 ? 1 : 0);
    painter.rect(FUR, column, TORSO_TOP - 2, 1, hangRows);
    painter.dot(FUR_DEEP, column, TORSO_TOP - 3 + hangRows);
    if (column < CENTER_X) painter.dot(FUR_LIGHT, column, TORSO_TOP - 2);
  }
}

function paintAxeHaft(painter: SpritePainter): void {
  painter.line(OUTLINE, HAFT_BUTT.x + 3, HAFT_BUTT.y, HAFT_TIP.x + 3, HAFT_TIP.y, 1);
  painter.line(HAFT_DARK, HAFT_BUTT.x + 1, HAFT_BUTT.y, HAFT_TIP.x + 1, HAFT_TIP.y, 2);
  painter.line(HAFT_MID, HAFT_BUTT.x, HAFT_BUTT.y, HAFT_TIP.x, HAFT_TIP.y, 1);
  painter.line(HAFT_LIGHT, HAFT_BUTT.x - 1, HAFT_BUTT.y, HAFT_TIP.x - 1, HAFT_TIP.y, 1);
  painter.rect(STEEL_SHADE, HAFT_BUTT.x - 1, HAFT_BUTT.y, 3, 2);
}

function paintAxeHead(painter: SpritePainter): void {
  for (let row = BLADE_TOP; row <= BLADE_BOTTOM; row++) {
    const haftX = haftXAt(row);
    const edgeX = haftX + bladeReachAt(row);
    const nextEdgeX = haftXAt(row + 1) + bladeReachAt(row + 1);
    painter.span(row > 13 ? STEEL_SHADE : STEEL, haftX + 2, edgeX, row);
    painter.dot(STEEL_DEEP, haftX + 1, row);
    painter.span(OUTLINE, Math.min(edgeX, nextEdgeX) + 1, edgeX + 1, row);
    painter.dot(MATERIAL.white, edgeX, row);
  }
  painter.rect(STEEL, HAFT_TIP.x, HAFT_TIP.y - 2, 2, 3);
  painter.dot(MATERIAL.white, HAFT_TIP.x, HAFT_TIP.y - 2);
}

function paintLimb(painter: SpritePainter, colors: HeroColors, from: { x: number; y: number }, to: { x: number; y: number }, thickness: number): void {
  painter.line(darken(colors.skinShade, 0.8), from.x, from.y, to.x, to.y, thickness);
  painter.line(colors.skin, from.x, from.y, to.x, to.y, thickness - 1);
  painter.line(lighten(colors.skin, 1.12), from.x, from.y, to.x, to.y, 1);
}

function paintArmLimbs(painter: SpritePainter, colors: HeroColors): void {
  paintLimb(painter, colors, { x: 4, y: 16 }, { x: 2, y: 22 }, 4);
  paintLimb(painter, colors, { x: 2, y: 22 }, { x: LOWER_FIST.x - 2, y: LOWER_FIST.y - 1 }, 4);
  painter.rect(MATERIAL.leather, 3, 25, 4, 2);
  painter.dot(BONE, 4, 25);
  paintLimb(painter, colors, { x: 24, y: 16 }, { x: 25, y: 22 }, 4);
  paintLimb(painter, colors, { x: 25, y: 22 }, { x: UPPER_FIST.x + 3, y: UPPER_FIST.y }, 4);
  painter.rect(MATERIAL.leather, 20, 22, 2, 4);
}

function paintHands(painter: SpritePainter, colors: HeroColors): void {
  for (const fist of [LOWER_FIST, UPPER_FIST]) {
    painter.rect(darken(colors.skinShade, 0.6), fist.x - 2, fist.y - 2, 6, 5);
    painter.rect(colors.skin, fist.x - 1, fist.y - 1, 4, 3);
    painter.dot(colors.skinShade, fist.x, fist.y);
    painter.dot(colors.skinShade, fist.x + 2, fist.y + 1);
  }
}

function paintBraids(painter: SpritePainter, colors: HeroColors): void {
  if (colors.appearance.gender !== 'female') return;
  for (const side of [-1, 1]) {
    const braidX = CENTER_X + side * 7 - 1;
    painter.rect(colors.hair, braidX, HEAD_TOP + 7, 2, 11);
    painter.rect(colors.hairShade, braidX, HEAD_TOP + 10, 2, 1);
    painter.rect(colors.hairShade, braidX, HEAD_TOP + 13, 2, 1);
    painter.rect(MATERIAL.red, braidX, HEAD_TOP + 17, 2, 1);
  }
}

export function drawBarbarianSprite(colors: HeroColors): HTMLCanvasElement {
  const art = createHeroCanvas(BARBARIAN_SPRITE_SIZE.width, BARBARIAN_SPRITE_SIZE.height);
  const painter = createSpritePainter(art, OUTLINE_MARGIN, OUTLINE_MARGIN);
  paintLegs(painter, colors);
  paintTorso(painter, colors);
  paintArmLimbs(painter, colors);
  paintFurMantle(painter);
  paintSpikedShoulder(painter, CENTER_X - 11, TORSO_TOP - 2, 7, 5);
  paintSpikedShoulder(painter, CENTER_X + 5, TORSO_TOP - 2, 7, 5);
  paintAxeHaft(painter);
  paintHands(painter, colors);
  paintAxeHead(painter);
  paintBraids(painter, colors);
  paintBarbarianHead(painter, colors, CENTER_X, HEAD_TOP, 4);
  addHeroOutline(art);
  return art.canvas;
}
