import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';
import { paintSpikedShoulder } from '../gruntParts';
import { paintBarbarianHead } from '../headgear/barbarianHead';
import { PORTRAIT_CENTER_X, finishPortrait, startPortrait } from './portraitFrame';

const CENTER_X = PORTRAIT_CENTER_X - 1;
const HEAD_TOP = 5;
const TORSO_TOP = 16;
const AXE_HAFT_X = 31;
const BONE = '#e8e4d4';
const FUR = '#8a6a48';
const FUR_LIGHT = '#b89a70';
const AXE_STEEL = '#c0c8d0';
const AXE_STEEL_SHADE = '#6f7a8c';
const AXE_STEEL_DEEP = '#454e60';

function paintLegs(painter: SpritePainter, colors: HeroColors): void {
  for (const left of [CENTER_X - 7, CENTER_X + 1]) {
    painter.rect(FUR, left, 36, 7, 8);
    painter.rect(FUR_LIGHT, left, 36, 7, 1);
    painter.rect(darken(FUR, 0.75), left, 42, 7, 2);
    painter.rect(MATERIAL.leather, left, 44, 7, 11);
    painter.rect(MATERIAL.leatherLight, left, 44, 7, 1);
    for (const strapRow of [46, 49, 52]) painter.rect(MATERIAL.boot, left, strapRow, 7, 1);
    painter.rect(MATERIAL.boot, left - 1, 55, 9, 2);
    painter.rect(FUR_LIGHT, left - 1, 54, 9, 1);
  }
  painter.rect(darken(FUR, 0.7), CENTER_X, 36, 1, 8);
  painter.rect(colors.skinShade, CENTER_X - 6, 45, 1, 1);
}

function paintTorso(painter: SpritePainter, colors: HeroColors): void {
  for (let row = 0; row < 20; row++) {
    const halfWidth = 10 - Math.floor(row * 0.25);
    painter.span(colors.skin, CENTER_X - halfWidth, CENTER_X + halfWidth, TORSO_TOP + row);
    painter.span(colors.skinShade, CENTER_X + halfWidth - 1, CENTER_X + halfWidth, TORSO_TOP + row);
  }
  painter.span(colors.skinShade, CENTER_X - 8, CENTER_X - 1, TORSO_TOP + 6);
  painter.span(colors.skinShade, CENTER_X + 1, CENTER_X + 8, TORSO_TOP + 6);
  painter.rect(colors.skinShade, CENTER_X, TORSO_TOP + 2, 1, 5);
  for (const row of [10, 13, 16]) {
    painter.span(colors.skinShade, CENTER_X - 4, CENTER_X - 1, TORSO_TOP + row);
    painter.span(colors.skinShade, CENTER_X + 1, CENTER_X + 4, TORSO_TOP + row);
  }
  painter.rect(colors.skinShade, CENTER_X, TORSO_TOP + 9, 1, 9);
  painter.line(MATERIAL.leather, CENTER_X - 10, TORSO_TOP + 1, CENTER_X + 6, TORSO_TOP + 16, 3);
  painter.rect(MATERIAL.leather, CENTER_X - 10, TORSO_TOP + 18, 21, 3);
  painter.rect(BONE, CENTER_X - 2, TORSO_TOP + 17, 5, 4);
  painter.rect(MATERIAL.boot, CENTER_X - 1, TORSO_TOP + 18, 1, 1);
  painter.rect(MATERIAL.boot, CENTER_X + 1, TORSO_TOP + 18, 1, 1);
  paintSpikedShoulder(painter, CENTER_X - 13, TORSO_TOP - 1, 10, 6);
  paintSpikedShoulder(painter, CENTER_X + 4, TORSO_TOP - 1, 10, 6);
}

function paintAxe(painter: SpritePainter): void {
  painter.rect(MATERIAL.wood, AXE_HAFT_X, 4, 2, 53);
  painter.rect(MATERIAL.woodDark, AXE_HAFT_X + 1, 4, 1, 53);
  for (let row = 4; row <= 24; row++) {
    const reach = Math.max(1, 7 - Math.floor(Math.abs(row - 14) * 0.7));
    painter.span(AXE_STEEL, AXE_HAFT_X - reach, AXE_HAFT_X - 1, row);
    painter.dot(MATERIAL.white, AXE_HAFT_X - reach, row);
    painter.span(AXE_STEEL_SHADE, AXE_HAFT_X + 2, AXE_HAFT_X + 1 + Math.min(reach, 4), row);
  }
  painter.rect(AXE_STEEL_DEEP, AXE_HAFT_X - 1, 11, 1, 6);
  painter.rect(MATERIAL.leather, AXE_HAFT_X - 1, 25, 4, 2);
}

function paintArms(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.skin, CENTER_X - 15, TORSO_TOP + 1, 5, 15);
  painter.rect(colors.skinShade, CENTER_X - 15, TORSO_TOP + 12, 5, 4);
  painter.rect(lighten(colors.skin, 1.12), CENTER_X - 14, TORSO_TOP + 2, 2, 4);
  painter.rect(MATERIAL.leather, CENTER_X - 15, TORSO_TOP + 16, 5, 3);
  painter.rect(colors.skin, CENTER_X - 16, TORSO_TOP + 19, 6, 4);
  painter.rect(colors.skinShade, CENTER_X - 16, TORSO_TOP + 22, 6, 1);
  painter.rect(colors.skin, CENTER_X + 10, TORSO_TOP + 1, 6, 5);
  painter.line(colors.skin, CENTER_X + 12, TORSO_TOP + 5, AXE_HAFT_X, 30, 4);
  painter.rect(colors.skin, AXE_HAFT_X - 2, 29, 7, 5);
  painter.rect(colors.skinShade, AXE_HAFT_X - 2, 33, 7, 1);
  painter.rect(MATERIAL.leather, AXE_HAFT_X - 2, 28, 7, 1);
}

function paintBraids(painter: SpritePainter, colors: HeroColors): void {
  if (colors.appearance.gender !== 'female') return;
  painter.rect(colors.hair, CENTER_X - 9, HEAD_TOP + 5, 3, 18);
  painter.rect(colors.hair, CENTER_X + 7, HEAD_TOP + 5, 3, 18);
  for (const braidRow of [8, 12, 16]) {
    painter.rect(colors.hairShade, CENTER_X - 9, HEAD_TOP + braidRow, 3, 1);
    painter.rect(colors.hairShade, CENTER_X + 7, HEAD_TOP + braidRow, 3, 1);
  }
  painter.rect(MATERIAL.red, CENTER_X - 9, HEAD_TOP + 23, 3, 1);
  painter.rect(MATERIAL.red, CENTER_X + 7, HEAD_TOP + 23, 3, 1);
}

export function drawBarbarianFigure(colors: HeroColors): HTMLCanvasElement {
  const drawing = startPortrait();
  const { painter } = drawing;
  paintAxe(painter);
  paintLegs(painter, colors);
  paintTorso(painter, colors);
  paintArms(painter, colors);
  paintBraids(painter, colors);
  paintBarbarianHead(painter, colors, CENTER_X, HEAD_TOP, 6);
  return finishPortrait(drawing);
}
