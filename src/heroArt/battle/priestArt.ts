import { addHeroOutline, createHeroCanvas } from '../heroCanvas';
import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import { paintPriestHead } from '../headgear/priestHead';
import { paintPaladinBody, paintWarhammer } from '../paladinParts';
import { paintWarriorPauldrons } from '../warriorParts';
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

function paintPlateBody(painter: SpritePainter, colors: HeroColors): void {
  paintPaladinBody(painter, colors, { centerX: CENTER_X, torsoTop: TORSO_TOP, torsoRows: 11, shoulderHalfWidth: 6, waistHalfWidth: 4, legTop: 28, legRows: 8, bootHeight: 3 });
}

function paintHolyHammer(painter: SpritePainter, colors: HeroColors): void {
  paintWarhammer(painter, colors, { hastX: STAFF_X, headTop: 2, headHalfWidth: 4, headHeight: 6, hastBottom: 40 });
  painter.line(colors.cloth, CENTER_X + 4, TORSO_TOP, STAFF_X - 1, TORSO_TOP + 8, 2);
  painter.line(colors.clothShade, CENTER_X + 4, TORSO_TOP + 1, STAFF_X - 1, TORSO_TOP + 9);
  painter.rect(colors.trim, STAFF_X - 1, TORSO_TOP + 8, 4, 3);
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
  paintPlateBody(painter, colors);
  paintPriestHead(painter, colors, CENTER_X, HEAD_TOP);
  paintBlessingHand(painter, colors);
  paintHolyHammer(painter, colors);
  paintWarriorPauldrons(painter, colors, CENTER_X + 5, CENTER_X - 13, 13);
  painter.rect(darken(colors.hair, 0.8), CENTER_X - 2, 13, 5, 1);
  painter.rect(lighten(colors.cloth), CENTER_X - 3, TORSO_TOP + 1, 2, 3);
  addHeroOutline(art);
  return art.canvas;
}
