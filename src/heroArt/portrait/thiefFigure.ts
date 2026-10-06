import { type HeroColors } from '../heroPalette';
import { paintThiefHead } from '../headgear/thiefHead';
import { bodyHalfWidth } from '../maleHeadArt';
import { paintThiefArm } from '../thiefParts';
import type { SpritePainter } from '../spritePainter';
import { PORTRAIT_CENTER_X, finishPortrait, startPortrait } from './portraitFrame';

const CENTER_X = PORTRAIT_CENTER_X - 1;
const HEAD_TOP = 2;
const TORSO_TOP = 13;
const BLADE_STEEL = '#9fb4c0';

function paintCloakAndScarf(painter: SpritePainter, colors: HeroColors): void {
  for (let row = 0; row < 34; row++) {
    const halfWidth = 6 + Math.floor(row * 0.22);
    const ragged = row % 5 === 4 ? 1 : 0;
    painter.span(colors.clothDeep, CENTER_X - halfWidth + ragged, CENTER_X + halfWidth - ragged, TORSO_TOP + row);
  }
  painter.rect(colors.clothShade, 3, 13, 8, 3);
  painter.rect(colors.clothDeep, 3, 15, 8, 1);
  painter.rect(colors.clothShade, 1, 16, 5, 3);
  painter.rect(colors.clothShade, 0, 19, 4, 2);
  painter.rect(colors.clothDeep, 0, 20, 4, 1);
}

function paintCrouchedLegs(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.clothShade, 15, 30, 10, 41, 6);
  painter.line(colors.clothShade, 21, 30, 26, 41, 6);
  painter.line(colors.cloth, 10, 41, 9, 53, 5);
  painter.line(colors.cloth, 26, 41, 27, 53, 5);
  painter.rect(colors.clothShade, 6, 47, 7, 7);
  painter.rect(colors.clothShade, 24, 47, 7, 7);
  painter.rect(colors.trim, 6, 47, 7, 1);
  painter.rect(colors.trim, 24, 47, 7, 1);
  painter.rect(colors.trim, 6, 49, 7, 1);
  painter.rect(colors.trim, 24, 49, 7, 1);
  painter.rect(colors.clothDeep, 3, 54, 10, 3);
  painter.rect(colors.clothDeep, 24, 54, 10, 3);
}

function paintJerkin(painter: SpritePainter, colors: HeroColors): void {
  const shoulderHalfWidth = bodyHalfWidth(colors, 6);
  for (let row = 0; row < 17; row++) {
    const halfWidth = Math.max(3, shoulderHalfWidth - Math.floor(row / 5));
    const isChest = row < 6;
    painter.span(isChest ? colors.skin : colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, TORSO_TOP + row);
    painter.dot(isChest ? colors.skinShade : colors.clothShade, CENTER_X + halfWidth, TORSO_TOP + row);
  }
  painter.line(colors.clothShade, CENTER_X - 4, TORSO_TOP, CENTER_X + 4, TORSO_TOP + 13);
  painter.line(colors.clothShade, CENTER_X + 4, TORSO_TOP, CENTER_X - 4, TORSO_TOP + 13);
  painter.dot(colors.trim, CENTER_X, TORSO_TOP + 6);
  painter.rect(colors.clothShade, CENTER_X - 5, TORSO_TOP + 14, 11, 2);
  painter.rect(colors.trim, CENTER_X - 1, TORSO_TOP + 14, 3, 2);
  painter.rect(colors.trim, CENTER_X + 5, TORSO_TOP + 15, 3, 5);
  painter.rect(colors.clothShade, CENTER_X - 8, TORSO_TOP + 15, 3, 4);
  painter.rect(colors.clothShade, CENTER_X - 5, TORSO_TOP + 16, 11, 5);
  painter.rect(colors.clothDeep, CENTER_X - 5, TORSO_TOP + 19, 11, 2);
}

function paintDagger(painter: SpritePainter, colors: HeroColors, handX: number, handY: number, tipX: number, tipY: number): void {
  painter.line(BLADE_STEEL, handX, handY - 1, tipX, tipY, 3);
  painter.line(colors.trim, handX, handY - 2, tipX, tipY - 1);
  painter.rect(colors.trim, handX - 2, handY - 1, 5, 1);
  painter.rect(colors.clothShade, handX - 1, handY, 2, 3);
}

function paintArms(painter: SpritePainter, colors: HeroColors): void {
  paintThiefArm(painter, colors, { shoulderX: CENTER_X + 8, shoulderY: TORSO_TOP + 2, handX: 33, handY: 29, thickness: 4 });
  paintThiefArm(painter, colors, { shoulderX: CENTER_X - 8, shoulderY: TORSO_TOP + 2, handX: 4, handY: 29, thickness: 4 });
  painter.rect(colors.clothShade, 31, 29, 4, 4);
  painter.rect(colors.clothShade, 2, 29, 4, 4);
  paintDagger(painter, colors, 33, 30, 37, 16);
  paintDagger(painter, colors, 4, 30, 1, 16);
}

export function drawThiefFigure(colors: HeroColors): HTMLCanvasElement {
  const drawing = startPortrait();
  const { painter } = drawing;
  paintCloakAndScarf(painter, colors);
  if (colors.appearance.gender === 'female') {
    painter.rect(colors.hair, 4, 9, 6, 4);
    painter.rect(colors.hair, 2, 12, 4, 8);
    painter.rect(colors.hairShade, 2, 17, 4, 3);
  }
  paintCrouchedLegs(painter, colors);
  paintJerkin(painter, colors);
  paintThiefHead(painter, colors, CENTER_X, HEAD_TOP);
  paintArms(painter, colors);
  return finishPortrait(drawing);
}
