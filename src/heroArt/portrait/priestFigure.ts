import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import { paintPriestHead } from '../headgear/priestHead';
import { paintPaladinBody, paintWarhammer } from '../paladinParts';
import { paintWarriorPauldrons } from '../warriorParts';
import type { SpritePainter } from '../spritePainter';
import { PORTRAIT_CENTER_X, finishPortrait, startPortrait } from './portraitFrame';

const CENTER_X = PORTRAIT_CENTER_X - 1;
const HEAD_TOP = 3;
const TORSO_TOP = 14;
const STAFF_X = 31;
const HOLY_LIGHT = '#fff3b0';
function paintPlateBody(painter: SpritePainter, colors: HeroColors): void {
  paintPaladinBody(painter, colors, { centerX: CENTER_X, torsoTop: TORSO_TOP, torsoRows: 15, shoulderHalfWidth: 8, waistHalfWidth: 5, legTop: 32, legRows: 21, bootHeight: 4 });
}

function paintHolyHammer(painter: SpritePainter, colors: HeroColors): void {
  paintWarhammer(painter, colors, { hastX: STAFF_X, headTop: 2, headHalfWidth: 6, headHeight: 9, hastBottom: 57 });
  painter.line(colors.cloth, CENTER_X + 4, TORSO_TOP, STAFF_X - 1, 23, 3);
  painter.line(colors.clothShade, CENTER_X + 4, TORSO_TOP + 1, STAFF_X - 1, 24);
  painter.rect(colors.trim, STAFF_X - 1, 22, 4, 4);
}

function paintBlessingHand(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.cloth, CENTER_X - 4, TORSO_TOP, 9, 10, 3);
  painter.line(colors.clothShade, CENTER_X - 4, TORSO_TOP + 1, 9, 11);
  painter.rect(colors.trim, 8, 9, 1, 4);
  painter.rect(colors.skin, 5, 6, 4, 4);
  painter.rect(colors.skinShade, 5, 9, 4, 1);
  painter.rect(HOLY_LIGHT, 3, 0, 5, 5);
  painter.rect(MATERIAL.white, 4, 1, 2, 2);
  for (const [sparkX, sparkY] of [[2, 6], [9, 3], [1, 9], [10, 0], [6, 11]] as const) painter.dot(HOLY_LIGHT, sparkX, sparkY);
}

function paintHairBehind(painter: SpritePainter, colors: HeroColors): void {
  if (colors.appearance.gender !== 'female') return;
  painter.rect(colors.hair, 7, 11, 5, 18);
  painter.rect(colors.hair, 24, 11, 5, 18);
  painter.rect(colors.hairShade, 7, 11, 1, 18);
  painter.rect(colors.hairShade, 28, 11, 1, 18);
}

export function drawPriestFigure(colors: HeroColors): HTMLCanvasElement {
  const drawing = startPortrait();
  const { painter } = drawing;
  paintHairBehind(painter, colors);
  paintPlateBody(painter, colors);
  paintPriestHead(painter, colors, CENTER_X, HEAD_TOP);
  paintBlessingHand(painter, colors);
  paintHolyHammer(painter, colors);
  paintWarriorPauldrons(painter, colors, CENTER_X + 4, CENTER_X - 14, 13);
  painter.rect(darken(colors.hair, 0.8), CENTER_X - 2, 13, 5, 1);
  painter.rect(lighten(colors.cloth), CENTER_X - 4, TORSO_TOP + 1, 2, 4);
  return finishPortrait(drawing);
}
