import { addHeroOutline, createHeroCanvas } from '../heroCanvas';
import { MATERIAL, type HeroColors } from '../heroPalette';
import { paintThiefHead } from '../headgear/thiefHead';
import { bodyHalfWidth } from '../maleHeadArt';
import { createSpritePainter, type SpritePainter } from '../spritePainter';

const DRAWING_WIDTH = 30;
const DRAWING_HEIGHT = 38;
const OUTLINE_MARGIN = 1;
export const THIEF_SPRITE_SIZE = { width: DRAWING_WIDTH + 2 * OUTLINE_MARGIN, height: DRAWING_HEIGHT + 2 * OUTLINE_MARGIN } as const;

const CENTER_X = 14;
const HEAD_TOP = 3;
const TORSO_TOP = 14;
const BLADE_STEEL = '#d8e0e8';

function paintScarfTail(painter: SpritePainter): void {
  painter.rect(MATERIAL.red, 4, 14, 6, 2);
  painter.rect(MATERIAL.redDark, 4, 15, 6, 1);
  painter.rect(MATERIAL.red, 2, 16, 4, 2);
  painter.rect(MATERIAL.red, 1, 18, 3, 1);
}

function paintCrouchedLegs(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.clothShade, 12, 25, 9, 31, 4);
  painter.line(colors.clothShade, 17, 25, 20, 31, 4);
  painter.line(colors.cloth, 9, 31, 8, 35, 4);
  painter.line(colors.cloth, 20, 31, 21, 35, 4);
  painter.rect(MATERIAL.leather, 7, 34, 4, 2);
  painter.rect(MATERIAL.leather, 19, 34, 4, 2);
  painter.rect(MATERIAL.boot, 5, 36, 6, 2);
  painter.rect(MATERIAL.boot, 19, 36, 6, 2);
  painter.rect(MATERIAL.leatherLight, 8, 31, 3, 1);
  painter.rect(MATERIAL.leatherLight, 19, 31, 3, 1);
}

function paintJerkin(painter: SpritePainter, colors: HeroColors): void {
  const shoulderHalfWidth = bodyHalfWidth(colors, 3);
  for (let row = 0; row < 12; row++) {
    const halfWidth = Math.max(2, shoulderHalfWidth - Math.floor(row / 4));
    painter.span(colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, TORSO_TOP + row);
    painter.dot(colors.clothShade, CENTER_X + halfWidth, TORSO_TOP + row);
  }
  painter.line(MATERIAL.leather, CENTER_X - 3, TORSO_TOP, CENTER_X + 3, TORSO_TOP + 9);
  painter.line(MATERIAL.leather, CENTER_X + 3, TORSO_TOP, CENTER_X - 3, TORSO_TOP + 9);
  painter.dot(colors.trim, CENTER_X, TORSO_TOP + 4);
  painter.rect(MATERIAL.leather, CENTER_X - 4, TORSO_TOP + 10, 9, 2);
  painter.rect(colors.trim, CENTER_X - 1, TORSO_TOP + 10, 3, 2);
  painter.rect(MATERIAL.leatherLight, CENTER_X + 4, TORSO_TOP + 11, 2, 3);
  painter.rect(colors.clothShade, CENTER_X - 4, TORSO_TOP + 12, 9, 3);
  painter.rect(colors.clothDeep, CENTER_X - 4, TORSO_TOP + 14, 9, 1);
}

function paintDagger(painter: SpritePainter, colors: HeroColors, handX: number, handY: number, tipX: number, tipY: number): void {
  painter.line(BLADE_STEEL, handX, handY - 1, tipX, tipY, 2);
  painter.line(MATERIAL.white, handX, handY - 2, tipX, tipY - 1);
  painter.rect(colors.trim, handX - 1, handY - 1, 3, 1);
  painter.rect(MATERIAL.leather, handX, handY, 1, 2);
}

function paintArms(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.cloth, CENTER_X + 3, TORSO_TOP + 1, 22, 24, 3);
  painter.line(colors.cloth, CENTER_X - 3, TORSO_TOP + 1, 6, 24, 3);
  painter.line(colors.clothShade, CENTER_X + 4, TORSO_TOP + 3, 22, 25);
  painter.line(colors.clothShade, CENTER_X - 4, TORSO_TOP + 3, 6, 25);
  painter.rect(MATERIAL.leather, 21, 24, 3, 3);
  painter.rect(MATERIAL.leather, 5, 24, 3, 3);
  paintDagger(painter, colors, 22, 25, 27, 15);
  paintDagger(painter, colors, 6, 25, 2, 15);
}

export function drawThiefSprite(colors: HeroColors): HTMLCanvasElement {
  const art = createHeroCanvas(THIEF_SPRITE_SIZE.width, THIEF_SPRITE_SIZE.height);
  const painter = createSpritePainter(art, OUTLINE_MARGIN, OUTLINE_MARGIN);
  paintScarfTail(painter);
  if (colors.appearance.gender === 'female') {
    painter.rect(colors.hair, 5, 9, 4, 3);
    painter.rect(colors.hair, 3, 11, 3, 5);
    painter.rect(colors.hairShade, 3, 14, 3, 2);
  }
  paintCrouchedLegs(painter, colors);
  paintJerkin(painter, colors);
  paintThiefHead(painter, colors, CENTER_X, HEAD_TOP);
  paintArms(painter, colors);
  addHeroOutline(art);
  return art.canvas;
}
