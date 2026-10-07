import { addHeroOutline, createHeroCanvas } from '../heroCanvas';
import type { HeroPose } from '../heroPose';
import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import { paintPriestHead } from '../headgear/priestHead';
import { TABARD_BLUE, TABARD_BLUE_DARK, paintPaladinBody, paintWarhammer } from '../paladinParts';
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
  painter.line(TABARD_BLUE_DARK, CENTER_X + 5, TORSO_TOP + 1, CENTER_X + 6, TORSO_TOP + 6, 3);
  painter.line(TABARD_BLUE, CENTER_X + 5, TORSO_TOP + 1, CENTER_X + 5, TORSO_TOP + 6, 1);
  painter.line(colors.cloth, CENTER_X + 6, TORSO_TOP + 6, STAFF_X - 1, TORSO_TOP + 8, 2);
  painter.line(colors.clothShade, CENTER_X + 6, TORSO_TOP + 7, STAFF_X - 1, TORSO_TOP + 9);
  painter.rect(colors.trim, STAFF_X - 1, TORSO_TOP + 8, 4, 3);
}

function paintHolyLight(painter: SpritePainter, pose: HeroPose): void {
  if (pose === 'released') return;
  if (pose === 'reload') {
    painter.dot(HOLY_LIGHT, 4, TORSO_TOP - 7);
    return;
  }
  const growth = pose === 'charge' ? 1 : 0;
  painter.rect(HOLY_LIGHT, 3 - growth, TORSO_TOP - 9 - growth, 3 + 2 * growth, 3 + 2 * growth);
  painter.dot(MATERIAL.white, 4, TORSO_TOP - 8);
  for (const [sparkX, sparkY] of [[2, 3], [7, 4], [1, 7], [8, 8]] as const) painter.dot(HOLY_LIGHT, sparkX, sparkY + 2);
}

function paintBlessingHand(painter: SpritePainter, colors: HeroColors, pose: HeroPose): void {
  painter.line(TABARD_BLUE_DARK, CENTER_X - 6, TORSO_TOP + 1, 8, TORSO_TOP + 5, 3);
  painter.line(TABARD_BLUE, CENTER_X - 6, TORSO_TOP + 1, 8, TORSO_TOP + 4, 1);
  painter.line(colors.cloth, 8, TORSO_TOP + 4, 7, TORSO_TOP - 3, 2);
  painter.line(colors.clothShade, 9, TORSO_TOP + 4, 8, TORSO_TOP - 2);
  painter.rect(colors.trim, 7, TORSO_TOP - 3, 1, 3);
  painter.rect(colors.skin, 4, TORSO_TOP - 5, 3, 3);
  painter.rect(colors.skinShade, 4, TORSO_TOP - 3, 3, 1);
  paintHolyLight(painter, pose);
}

function paintHairBehind(painter: SpritePainter, colors: HeroColors): void {
  if (colors.appearance.gender !== 'female') return;
  painter.rect(colors.hair, 8, 11, 3, 12);
  painter.rect(colors.hair, 18, 11, 3, 12);
  painter.rect(colors.hairShade, 8, 11, 1, 12);
  painter.rect(colors.hairShade, 20, 11, 1, 12);
}

export function drawPriestSprite(colors: HeroColors, pose: HeroPose = 'ready'): HTMLCanvasElement {
  const art = createHeroCanvas(PRIEST_SPRITE_SIZE.width, PRIEST_SPRITE_SIZE.height);
  const painter = createSpritePainter(art, OUTLINE_MARGIN, OUTLINE_MARGIN);
  paintHairBehind(painter, colors);
  paintPlateBody(painter, colors);
  paintPriestHead(painter, colors, CENTER_X, HEAD_TOP);
  paintBlessingHand(painter, colors, pose);
  paintHolyHammer(painter, colors);
  paintWarriorPauldrons(painter, colors, CENTER_X + 5, CENTER_X - 13, 13);
  painter.rect(darken(colors.hair, 0.8), CENTER_X - 2, 13, 5, 1);
  painter.rect(lighten(colors.cloth), CENTER_X - 3, TORSO_TOP + 1, 2, 3);
  addHeroOutline(art);
  return art.canvas;
}
