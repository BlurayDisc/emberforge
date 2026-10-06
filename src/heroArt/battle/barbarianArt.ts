import { addHeroOutline, createHeroCanvas } from '../heroCanvas';
import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import { paintBarbarianHead } from '../headgear/barbarianHead';
import { paintSpikedShoulder } from '../gruntParts';
import { createSpritePainter, type SpritePainter } from '../spritePainter';

const DRAWING_WIDTH = 32;
const DRAWING_HEIGHT = 38;
const OUTLINE_MARGIN = 1;
export const BARBARIAN_SPRITE_SIZE = { width: DRAWING_WIDTH + 2 * OUTLINE_MARGIN, height: DRAWING_HEIGHT + 2 * OUTLINE_MARGIN } as const;

const CENTER_X = 15;
const HEAD_TOP = 3;
const TORSO_TOP = 14;
const AXE_HAFT_X = 27;
const BONE = '#e8e4d4';
const FUR = '#8a6a48';
const FUR_LIGHT = '#b89a70';
const AXE_STEEL = '#c0c8d0';
const AXE_STEEL_SHADE = '#6f7a8c';
const AXE_STEEL_DEEP = '#454e60';

function paintLegs(painter: SpritePainter, colors: HeroColors): void {
  for (const left of [CENTER_X - 6, CENTER_X + 1]) {
    painter.rect(FUR, left, 28, 6, 5);
    painter.rect(FUR_LIGHT, left, 28, 6, 1);
    painter.rect(MATERIAL.leather, left, 33, 6, 4);
    painter.rect(MATERIAL.leatherLight, left, 33, 6, 1);
    painter.rect(MATERIAL.boot, left - 1, 36, 7, 2);
  }
  painter.rect(darken(FUR, 0.7), CENTER_X, 28, 1, 5);
  painter.rect(colors.skinShade, CENTER_X - 5, 33, 1, 1);
}

function paintTorso(painter: SpritePainter, colors: HeroColors): void {
  for (let row = 0; row < 14; row++) {
    const halfWidth = 8 - Math.floor(row * 0.28);
    painter.span(colors.skin, CENTER_X - halfWidth, CENTER_X + halfWidth, TORSO_TOP + row);
    painter.dot(colors.skinShade, CENTER_X + halfWidth, TORSO_TOP + row);
    painter.dot(colors.skinShade, CENTER_X + halfWidth - 1, TORSO_TOP + row);
  }
  painter.span(colors.skinShade, CENTER_X - 6, CENTER_X - 1, TORSO_TOP + 5);
  painter.span(colors.skinShade, CENTER_X + 1, CENTER_X + 6, TORSO_TOP + 5);
  painter.rect(colors.skinShade, CENTER_X, TORSO_TOP + 2, 1, 4);
  for (const row of [8, 10, 12]) {
    painter.span(colors.skinShade, CENTER_X - 3, CENTER_X - 1, TORSO_TOP + row);
    painter.span(colors.skinShade, CENTER_X + 1, CENTER_X + 3, TORSO_TOP + row);
  }
  painter.rect(colors.skinShade, CENTER_X, TORSO_TOP + 7, 1, 6);
  painter.line(MATERIAL.leather, CENTER_X - 8, TORSO_TOP + 1, CENTER_X + 5, TORSO_TOP + 12, 2);
  painter.rect(MATERIAL.leather, CENTER_X - 8, TORSO_TOP + 13, 17, 2);
  painter.rect(BONE, CENTER_X - 1, TORSO_TOP + 13, 3, 2);
  painter.dot(MATERIAL.boot, CENTER_X, TORSO_TOP + 14);
  paintSpikedShoulder(painter, CENTER_X - 10, TORSO_TOP - 1, 8, 5);
  paintSpikedShoulder(painter, CENTER_X + 3, TORSO_TOP - 1, 8, 5);
}

function paintAxe(painter: SpritePainter): void {
  painter.rect(MATERIAL.wood, AXE_HAFT_X, 3, 2, 34);
  painter.rect(MATERIAL.woodDark, AXE_HAFT_X + 1, 3, 1, 34);
  for (let row = 2; row <= 16; row++) {
    const reach = Math.max(1, 6 - Math.floor(Math.abs(row - 9) * 0.9));
    painter.span(AXE_STEEL, AXE_HAFT_X - reach, AXE_HAFT_X - 1, row);
    painter.dot(MATERIAL.white, AXE_HAFT_X - reach, row);
    painter.span(AXE_STEEL_SHADE, AXE_HAFT_X + 2, AXE_HAFT_X + 1 + Math.min(reach, 3), row);
  }
  painter.rect(AXE_STEEL_DEEP, AXE_HAFT_X - 1, 8, 1, 3);
}

function paintArms(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.skin, CENTER_X - 11, TORSO_TOP + 1, 4, 11);
  painter.rect(colors.skinShade, CENTER_X - 11, TORSO_TOP + 9, 4, 3);
  painter.rect(lighten(colors.skin, 1.12), CENTER_X - 10, TORSO_TOP + 2, 2, 3);
  painter.rect(MATERIAL.leather, CENTER_X - 11, TORSO_TOP + 12, 4, 2);
  painter.rect(colors.skin, CENTER_X - 12, TORSO_TOP + 14, 5, 3);
  painter.rect(colors.skin, CENTER_X + 8, TORSO_TOP + 2, 5, 4);
  painter.rect(colors.skinShade, CENTER_X + 8, TORSO_TOP + 5, 5, 1);
  painter.rect(colors.skin, AXE_HAFT_X - 2, 21, 6, 4);
  painter.rect(colors.skinShade, AXE_HAFT_X - 2, 24, 6, 1);
  painter.rect(MATERIAL.leather, AXE_HAFT_X - 2, 20, 6, 1);
  painter.line(colors.skin, CENTER_X + 9, TORSO_TOP + 5, AXE_HAFT_X - 1, 21, 3);
}

function paintBeardOrBraids(painter: SpritePainter, colors: HeroColors): void {
  if (colors.appearance.gender === 'female') {
    painter.rect(colors.hair, CENTER_X - 8, HEAD_TOP + 5, 2, 12);
    painter.rect(colors.hair, CENTER_X + 7, HEAD_TOP + 5, 2, 12);
    painter.rect(colors.hairShade, CENTER_X - 8, HEAD_TOP + 8, 2, 1);
    painter.rect(colors.hairShade, CENTER_X + 7, HEAD_TOP + 11, 2, 1);
    painter.rect(MATERIAL.red, CENTER_X - 8, HEAD_TOP + 16, 2, 1);
    painter.rect(MATERIAL.red, CENTER_X + 7, HEAD_TOP + 16, 2, 1);
  }
}

export function drawBarbarianSprite(colors: HeroColors): HTMLCanvasElement {
  const art = createHeroCanvas(BARBARIAN_SPRITE_SIZE.width, BARBARIAN_SPRITE_SIZE.height);
  const painter = createSpritePainter(art, OUTLINE_MARGIN, OUTLINE_MARGIN);
  paintAxe(painter);
  paintLegs(painter, colors);
  paintTorso(painter, colors);
  paintArms(painter, colors);
  paintBeardOrBraids(painter, colors);
  paintBarbarianHead(painter, colors, CENTER_X, HEAD_TOP);
  addHeroOutline(art);
  return art.canvas;
}
