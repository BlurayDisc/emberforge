import { addHeroOutline, createHeroCanvas } from '../heroCanvas';
import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import { paintPriestHead } from '../headgear/priestHead';
import { bodyHalfWidth } from '../maleHeadArt';
import { createSpritePainter, type SpritePainter } from '../spritePainter';

const DRAWING_WIDTH = 30;
const DRAWING_HEIGHT = 40;
const OUTLINE_MARGIN = 1;
export const PRIEST_SPRITE_SIZE = { width: DRAWING_WIDTH + 2 * OUTLINE_MARGIN, height: DRAWING_HEIGHT + 2 * OUTLINE_MARGIN } as const;

const CENTER_X = 14;
const HEAD_TOP = 3;
const TORSO_TOP = 14;
const STAFF_X = 25;
const HOLY_LIGHT = '#fff3b0';

function paintRobe(painter: SpritePainter, colors: HeroColors): void {
  const shoulder = bodyHalfWidth(colors, 4);
  for (let row = 0; row < 8; row++) {
    const halfWidth = Math.max(3, shoulder - Math.floor(row / 3));
    painter.span(colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, TORSO_TOP + row);
    painter.dot(colors.clothShade, CENTER_X + halfWidth, TORSO_TOP + row);
  }
  for (let row = 0; row < 18; row++) {
    const halfWidth = 4 + Math.floor(row * 0.4);
    painter.span(colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, TORSO_TOP + 8 + row);
    painter.dot(colors.clothShade, CENTER_X + halfWidth, TORSO_TOP + 8 + row);
    painter.dot(colors.clothShade, CENTER_X - halfWidth, TORSO_TOP + 8 + row);
    if (row % 4 === 3) painter.span(colors.clothShade, CENTER_X - halfWidth + 1, CENTER_X - 1, TORSO_TOP + 8 + row);
  }
  painter.rect(MATERIAL.red, CENTER_X - 1, TORSO_TOP, 3, 24);
  painter.rect(MATERIAL.redDark, CENTER_X + 1, TORSO_TOP, 1, 24);
  painter.rect(colors.trim, CENTER_X - 2, TORSO_TOP, 1, 24);
  painter.rect(colors.trim, CENTER_X + 2, TORSO_TOP, 1, 24);
  painter.dot(colors.trim, CENTER_X, TORSO_TOP + 5);
  painter.rect(colors.trim, CENTER_X - 1, TORSO_TOP + 6, 3, 1);
  painter.dot(colors.trim, CENTER_X, TORSO_TOP + 4);
  painter.span(MATERIAL.leather, CENTER_X - 4, CENTER_X + 4, TORSO_TOP + 8);
  painter.span(colors.trim, CENTER_X - 9, CENTER_X + 9, TORSO_TOP + 25);
  painter.rect(MATERIAL.leather, CENTER_X - 6, TORSO_TOP + 26, 4, 1);
  painter.rect(MATERIAL.leather, CENTER_X + 3, TORSO_TOP + 26, 4, 1);
}

function paintHolyStaff(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(MATERIAL.wood, STAFF_X, 9, 1, 31);
  painter.rect(MATERIAL.woodDark, STAFF_X + 1, 9, 1, 31);
  painter.grid(
    ['..GGGG..', '.GwwwwG.', 'GwwHHwwG', 'GwHHHHwG', 'GwHHHHwG', 'GwwHHwwG', '.GwwwwG.', '..GGGG..'],
    { G: colors.trim, w: MATERIAL.white, H: HOLY_LIGHT },
    STAFF_X - 3,
    1,
  );
  painter.dot(MATERIAL.goldDark, STAFF_X - 3, 8);
  painter.line(colors.cloth, CENTER_X + 4, TORSO_TOP, STAFF_X - 1, TORSO_TOP + 8, 2);
  painter.line(colors.clothShade, CENTER_X + 4, TORSO_TOP + 1, STAFF_X - 1, TORSO_TOP + 9);
  painter.rect(colors.skin, STAFF_X - 1, TORSO_TOP + 8, 3, 3);
}

function paintBlessingHand(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.cloth, CENTER_X - 4, TORSO_TOP, 7, TORSO_TOP - 3, 2);
  painter.line(colors.clothShade, CENTER_X - 4, TORSO_TOP + 1, 7, TORSO_TOP - 2);
  painter.rect(colors.trim, 7, TORSO_TOP - 3, 1, 3);
  painter.rect(colors.skin, 4, TORSO_TOP - 5, 3, 3);
  painter.rect(colors.skinShade, 4, TORSO_TOP - 3, 3, 1);
  painter.rect(HOLY_LIGHT, 3, TORSO_TOP - 9, 3, 3);
  painter.dot(MATERIAL.white, 4, TORSO_TOP - 8);
  for (const [sparkX, sparkY] of [[2, 3], [7, 4], [1, 7], [8, 8]] as const) painter.dot(HOLY_LIGHT, sparkX, sparkY + 2);
}

function paintHairBehind(painter: SpritePainter, colors: HeroColors): void {
  if (colors.appearance.gender !== 'female') return;
  painter.rect(colors.hair, 8, 11, 3, 12);
  painter.rect(colors.hair, 18, 11, 3, 12);
  painter.rect(colors.hairShade, 8, 11, 1, 12);
  painter.rect(colors.hairShade, 20, 11, 1, 12);
}

export function drawPriestSprite(colors: HeroColors): HTMLCanvasElement {
  const art = createHeroCanvas(PRIEST_SPRITE_SIZE.width, PRIEST_SPRITE_SIZE.height);
  const painter = createSpritePainter(art, OUTLINE_MARGIN, OUTLINE_MARGIN);
  paintHairBehind(painter, colors);
  paintRobe(painter, colors);
  paintPriestHead(painter, colors, CENTER_X, HEAD_TOP);
  paintBlessingHand(painter, colors);
  paintHolyStaff(painter, colors);
  painter.rect(darken(colors.hair, 0.8), CENTER_X - 2, 13, 5, 1);
  painter.rect(lighten(colors.cloth), CENTER_X - 3, TORSO_TOP + 1, 2, 3);
  addHeroOutline(art);
  return art.canvas;
}
