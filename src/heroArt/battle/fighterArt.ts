import { addHeroOutline, createHeroCanvas } from '../heroCanvas';
import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import { bodyHalfWidth, paintHumanHead } from '../maleHeadArt';
import { FIRE_GLOW, FIRE_GLOW_DEEP, paintEmbers, paintSmallFlame } from '../portrait/fighterFlame';
import { createSpritePainter, type SpritePainter } from '../spritePainter';

const DRAWING_WIDTH = 30;
const DRAWING_HEIGHT = 38;
const OUTLINE_MARGIN = 1;
export const FIGHTER_SPRITE_SIZE = { width: DRAWING_WIDTH + 2 * OUTLINE_MARGIN, height: DRAWING_HEIGHT + 2 * OUTLINE_MARGIN } as const;

const CENTER_X = 14;
const HEAD_TOP = 3;
const TORSO_TOP = 14;
const WRAP = '#e8e4d4';

function paintHeadband(painter: SpritePainter): void {
  painter.span(MATERIAL.red, CENTER_X - 5, CENTER_X + 5, HEAD_TOP + 3);
  painter.span(MATERIAL.redDark, CENTER_X - 5, CENTER_X + 5, HEAD_TOP + 4);
  painter.rect(MATERIAL.red, 4, HEAD_TOP + 3, 6, 2);
  painter.rect(MATERIAL.red, 2, HEAD_TOP + 5, 4, 2);
  painter.rect(MATERIAL.redDark, 1, HEAD_TOP + 7, 3, 1);
  painter.rect(MATERIAL.red, 0, HEAD_TOP + 8, 3, 1);
  painter.dot(MATERIAL.gold, CENTER_X, HEAD_TOP + 3);
}

function paintStanceLegs(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.clothShade, 12, 25, 7, 31, 4);
  painter.line(colors.clothShade, 17, 25, 22, 31, 4);
  painter.line(colors.cloth, 7, 31, 6, 35, 4);
  painter.line(colors.cloth, 22, 31, 23, 35, 4);
  painter.rect(WRAP, 5, 34, 4, 1);
  painter.rect(WRAP, 21, 34, 4, 1);
  painter.rect(MATERIAL.boot, 3, 36, 7, 2);
  painter.rect(MATERIAL.boot, 20, 36, 7, 2);
}

function paintGi(painter: SpritePainter, colors: HeroColors): void {
  const shoulderHalfWidth = bodyHalfWidth(colors, 3) + 1;
  for (let row = 0; row < 11; row++) {
    const halfWidth = Math.max(3, shoulderHalfWidth - Math.floor(row / 3));
    painter.span(colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, TORSO_TOP + row);
    painter.dot(colors.clothShade, CENTER_X + halfWidth, TORSO_TOP + row);
  }
  painter.rect(colors.skin, CENTER_X - 1, TORSO_TOP, 3, 4);
  painter.rect(colors.skinShade, CENTER_X, TORSO_TOP + 1, 1, 3);
  painter.line(colors.clothDeep, CENTER_X - 3, TORSO_TOP, CENTER_X, TORSO_TOP + 4);
  painter.line(colors.clothDeep, CENTER_X + 3, TORSO_TOP, CENTER_X, TORSO_TOP + 4);
  painter.rect(MATERIAL.boot, CENTER_X - 4, TORSO_TOP + 10, 9, 2);
  painter.rect(MATERIAL.redDark, CENTER_X + 4, TORSO_TOP + 11, 2, 3);
  painter.rect(colors.trim, CENTER_X - 5, TORSO_TOP + 11, 11, 3);
  painter.rect(lighten(colors.trim), CENTER_X - 5, TORSO_TOP + 11, 11, 1);
  painter.rect(darken(colors.trim, 0.65), CENTER_X - 5, TORSO_TOP + 13, 11, 1);
  painter.rect(colors.trim, CENTER_X - 4, TORSO_TOP + 14, 2, 3);
}

function paintFists(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.skin, CENTER_X + 3, TORSO_TOP + 1, 23, TORSO_TOP - 1, 3);
  painter.line(colors.skinShade, CENTER_X + 3, TORSO_TOP + 2, 23, TORSO_TOP);
  painter.rect(WRAP, 20, TORSO_TOP - 3, 2, 4);
  painter.rect(colors.trim, 23, TORSO_TOP - 3, 5, 4);
  painter.rect(WRAP, 23, TORSO_TOP - 3, 5, 1);
  painter.rect(darken(colors.trim, 0.65), 23, TORSO_TOP, 5, 1);
  paintSmallFlame(painter, 23, TORSO_TOP - 11);
  painter.rect(FIRE_GLOW, 24, TORSO_TOP - 3, 3, 1);
  painter.dot(FIRE_GLOW_DEEP, 21, TORSO_TOP - 1);
  paintEmbers(painter, [[22, 2], [29, 5]]);
  painter.line(colors.skin, CENTER_X - 4, TORSO_TOP + 1, 7, TORSO_TOP + 5, 3);
  painter.line(colors.skinShade, CENTER_X - 4, TORSO_TOP + 2, 7, TORSO_TOP + 6);
  painter.rect(WRAP, 8, TORSO_TOP + 4, 2, 4);
  painter.rect(colors.trim, 4, TORSO_TOP + 3, 5, 4);
  painter.rect(WRAP, 4, TORSO_TOP + 3, 5, 1);
  painter.rect(darken(colors.trim, 0.65), 4, TORSO_TOP + 6, 5, 1);
  painter.rect(FIRE_GLOW_DEEP, 3, TORSO_TOP + 1, 5, 2);
  painter.rect(FIRE_GLOW, 4, TORSO_TOP, 3, 2);
  painter.dot('#fff3b0', 5, TORSO_TOP);
  painter.dot('#d8431c', 4, TORSO_TOP - 1);
  painter.dot('#ff8a2a', 6, TORSO_TOP - 2);
  painter.dot('#ffc94a', 6, TORSO_TOP - 1);
}

export function drawFighterSprite(colors: HeroColors): HTMLCanvasElement {
  const art = createHeroCanvas(FIGHTER_SPRITE_SIZE.width, FIGHTER_SPRITE_SIZE.height);
  const painter = createSpritePainter(art, OUTLINE_MARGIN, OUTLINE_MARGIN);
  if (colors.appearance.gender === 'female') {
    painter.rect(colors.hair, 8, 11, 2, 7);
    painter.rect(colors.hair, 19, 11, 2, 7);
  }
  paintStanceLegs(painter, colors);
  paintGi(painter, colors);
  paintHumanHead(painter, colors, CENTER_X - 6, HEAD_TOP);
  paintHeadband(painter);
  paintFists(painter, colors);
  painter.rect(lighten(colors.cloth), CENTER_X - 3, TORSO_TOP + 4, 2, 2);
  addHeroOutline(art);
  return art.canvas;
}
