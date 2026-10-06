import { pickHeroAppearance } from '../content/heroAppearance';
import type { ClassId } from '../model/hero';
import { addHeroOutline, createHeroCanvas } from './heroCanvas';
import { paintElfHead, paintElfPonytail } from './headgear/archerHead';
import { paintBarbarianHead } from './headgear/barbarianHead';
import { paintFighterHead } from './headgear/fighterHead';
import { paintMageHead } from './headgear/mageHead';
import { paintPriestHead } from './headgear/priestHead';
import { paintThiefHead } from './headgear/thiefHead';
import { MATERIAL, darken, heroColorsOf, type HeroColors, type Hex } from './heroPalette';
import { createSpritePainter, type SpritePainter } from './spritePainter';
import { paintWarriorHelm, paintWarriorPauldrons } from './warriorParts';

export const BUST_SIZE = 32;
const CENTER_X = 16;
const BOTTOM_ROW = BUST_SIZE - 1;
const ORB_GLOW = ['#5a3aa0', '#8ab0ff', '#e8f0ff'] as const;
const HOLY_LIGHT = '#fff3b0';
const FUR = '#8a6a48';
const FUR_LIGHT = '#b89a70';
const BLADE_STEEL = '#d8e0e8';

function paintShoulders(painter: SpritePainter, top: number, startHalfWidth: number, fill: Hex, shade: Hex, maxHalfWidth = 13): void {
  for (let row = top; row <= BOTTOM_ROW; row++) {
    const halfWidth = Math.min(maxHalfWidth, startHalfWidth + Math.floor((row - top) * 0.8));
    painter.span(fill, CENTER_X - halfWidth, CENTER_X + halfWidth, row);
    painter.dot(shade, CENTER_X + halfWidth, row);
    painter.dot(shade, CENTER_X + halfWidth - 1, row);
  }
}

function paintOrb(painter: SpritePainter, centerX: number, centerY: number, radius: number): void {
  [radius, radius - 1, Math.max(1, radius - 3)].forEach((ringRadius, index) => {
    for (let y = -ringRadius; y <= ringRadius; y++) {
      for (let x = -ringRadius; x <= ringRadius; x++) {
        if (x * x + y * y <= ringRadius * ringRadius + 1) painter.dot(ORB_GLOW[index] as `#${string}`, centerX + x, centerY + y);
      }
    }
  });
}

function paintWarriorBust(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.cloth, 25, 2, 3, 18);
  painter.rect(MATERIAL.white, 25, 2, 1, 18);
  painter.rect(darken(colors.cloth, 0.8), 27, 3, 1, 17);
  paintShoulders(painter, 18, 7, colors.cloth, colors.clothShade);
  painter.span(colors.trim, CENTER_X - 6, CENTER_X + 6, 19);
  painter.rect(colors.clothShade, CENTER_X, 20, 1, 12);
  paintWarriorHelm(painter, colors, CENTER_X - 6, 4);
  paintWarriorPauldrons(painter, colors, CENTER_X + 3, CENTER_X - 12, 15);
  painter.rect(colors.trim, 1, 22, 11, 10);
  painter.rect(colors.clothShade, 2, 23, 9, 9);
  painter.rect(colors.cloth, 2, 23, 5, 9);
  painter.rect(MATERIAL.red, 5, 23, 2, 9);
  painter.rect(MATERIAL.redDark, 6, 23, 1, 9);
  painter.rect(colors.trim, 4, 26, 4, 3);
}

function paintArcherBust(painter: SpritePainter, colors: HeroColors): void {
  for (const featherX of [6, 8, 10]) painter.rect(MATERIAL.red, featherX, 2, 1, 4);
  painter.line(MATERIAL.leather, 7, 6, 11, 18, 3);
  paintElfPonytail(painter, colors, 10, 7, 20, 3);
  painter.rect(colors.skin, 8, 18, 16, 5);
  paintShoulders(painter, 18, 5, colors.cloth, colors.clothShade, 7);
  painter.rect(colors.skin, 6, 20, 3, 12);
  painter.rect(colors.skin, 23, 20, 3, 12);
  painter.rect(colors.skinShade, 8, 20, 1, 12);
  painter.rect(colors.trim, CENTER_X, 18, 1, 14);
  painter.rect(MATERIAL.leather, CENTER_X - 5, 28, 11, 2);
  paintElfHead(painter, colors, CENTER_X, 4);
  for (let row = 2; row <= 30; row++) painter.dot(MATERIAL.wood, 28 - Math.round((Math.abs(row - 16) / 14) ** 2 * 4), row);
}

function paintMageBust(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.hair, 6, 14, 5, 16);
  painter.rect(colors.hair, 22, 14, 5, 16);
  painter.rect(colors.hairShade, 6, 14, 1, 16);
  painter.rect(MATERIAL.wood, 3, 8, 2, 24);
  painter.rect(colors.trim, 2, 7, 4, 2);
  painter.rect('#5a8fe0', 3, 3, 2, 4);
  paintShoulders(painter, 20, 5, colors.cloth, colors.clothShade);
  painter.span(colors.skin, CENTER_X - 1, CENTER_X + 1, 19);
  painter.dot(colors.trim, CENTER_X - 2, 20);
  painter.dot(colors.trim, CENTER_X + 2, 20);
  painter.span(colors.trim, CENTER_X - 7, CENTER_X + 7, 27);
  paintMageHead(painter, colors, CENTER_X, 8);
  paintOrb(painter, 26, 24, 4);
}

function paintPriestBust(painter: SpritePainter, colors: HeroColors): void {
  if (colors.appearance.gender === 'female') {
    painter.rect(colors.hair, 6, 12, 5, 12);
    painter.rect(colors.hair, 22, 12, 5, 12);
  }
  paintShoulders(painter, 17, 5, colors.cloth, colors.clothShade);
  painter.rect(MATERIAL.red, CENTER_X - 1, 17, 3, 15);
  painter.rect(colors.trim, CENTER_X - 2, 17, 1, 15);
  painter.rect(colors.trim, CENTER_X + 2, 17, 1, 15);
  painter.rect(colors.trim, CENTER_X - 1, 23, 3, 1);
  painter.rect(MATERIAL.wood, 28, 12, 2, 20);
  for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) if (x * x + y * y <= 17) painter.dot(x * x + y * y <= 8 ? HOLY_LIGHT : colors.trim, 27 + x, 8 + y);
  paintPriestHead(painter, colors, CENTER_X, 6);
}

function paintThiefBust(painter: SpritePainter, colors: HeroColors): void {
  paintShoulders(painter, 16, 6, colors.cloth, colors.clothShade);
  painter.line(MATERIAL.leather, CENTER_X - 7, 17, CENTER_X + 4, 31, 2);
  painter.line(BLADE_STEEL, 4, 31, 10, 21, 2);
  painter.line(BLADE_STEEL, 28, 31, 22, 21, 2);
  painter.rect(MATERIAL.red, CENTER_X - 6, 16, 12, 2);
  painter.rect(MATERIAL.red, CENTER_X + 3, 18, 3, 6);
  paintThiefHead(painter, colors, CENTER_X, 5);
  if (colors.appearance.gender === 'female') painter.rect(colors.hair, 4, 12, 5, 8);
}

function paintBarbarianBust(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(MATERIAL.wood, 27, 8, 2, 24);
  for (let row = 3; row <= 15; row++) painter.span('#c0c8d0', 28 - Math.max(1, 5 - Math.floor(Math.abs(row - 9) * 0.7)), 27, row);
  paintShoulders(painter, 19, 7, colors.skin, colors.skinShade);
  painter.span(colors.skinShade, CENTER_X - 6, CENTER_X - 1, 24);
  painter.span(colors.skinShade, CENTER_X + 1, CENTER_X + 6, 24);
  painter.rect(colors.skinShade, CENTER_X, 20, 1, 12);
  painter.line(MATERIAL.leather, CENTER_X - 10, 19, CENTER_X + 6, 31, 3);
  painter.rect(FUR, 3, 17, 10, 5);
  painter.rect(FUR_LIGHT, 3, 17, 10, 1);
  painter.rect(FUR, 19, 17, 10, 5);
  painter.rect(FUR_LIGHT, 19, 17, 10, 1);
  paintBarbarianHead(painter, colors, CENTER_X, 7);
  if (colors.appearance.gender === 'female') painter.rect(colors.hair, 6, 12, 2, 12);
}

function paintFighterBust(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(MATERIAL.red, 3, 8, 7, 3);
  painter.rect(MATERIAL.red, 1, 11, 4, 3);
  painter.rect(MATERIAL.redDark, 0, 14, 3, 2);
  paintShoulders(painter, 17, 6, colors.cloth, colors.clothShade);
  painter.rect(colors.skin, CENTER_X - 1, 17, 3, 6);
  painter.line(colors.clothDeep, CENTER_X - 4, 17, CENTER_X, 23);
  painter.line(colors.clothDeep, CENTER_X + 4, 17, CENTER_X, 23);
  painter.rect(colors.skin, 21, 22, 6, 5);
  painter.rect('#e8e4d4', 21, 22, 6, 1);
  painter.rect(MATERIAL.red, 24, 21, 6, 6);
  for (const [sparkX, sparkY] of [[29, 17], [30, 21], [26, 18]] as const) painter.dot(HOLY_LIGHT, sparkX, sparkY);
  paintFighterHead(painter, colors, CENTER_X, 5);
}

const BUST_DRAWERS: Readonly<Record<ClassId, (painter: SpritePainter, colors: HeroColors) => void>> = {
  warrior: paintWarriorBust,
  archer: paintArcherBust,
  mage: paintMageBust,
  priest: paintPriestBust,
  thief: paintThiefBust,
  barbarian: paintBarbarianBust,
  fighter: paintFighterBust,
};

export function drawHeroBust(classId: ClassId, heroName: string): HTMLCanvasElement {
  const art = createHeroCanvas(BUST_SIZE, BUST_SIZE);
  BUST_DRAWERS[classId](createSpritePainter(art), heroColorsOf(pickHeroAppearance(classId, heroName)));
  addHeroOutline(art);
  return art.canvas;
}
