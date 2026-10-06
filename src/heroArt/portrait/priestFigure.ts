import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import { paintPriestHead } from '../headgear/priestHead';
import { bodyHalfWidth } from '../maleHeadArt';
import type { SpritePainter } from '../spritePainter';
import { PORTRAIT_CENTER_X, finishPortrait, startPortrait } from './portraitFrame';

const CENTER_X = PORTRAIT_CENTER_X - 1;
const HEAD_TOP = 3;
const TORSO_TOP = 14;
const ROBE_TOP = 22;
const ROBE_BOTTOM = 54;
const STAFF_X = 31;
const HOLY_LIGHT = '#fff3b0';
function paintRobe(painter: SpritePainter, colors: HeroColors): void {
  const shoulder = bodyHalfWidth(colors, 4);
  for (let row = 0; row < ROBE_TOP - TORSO_TOP; row++) {
    const halfWidth = Math.max(3, shoulder - Math.floor(row / 3));
    painter.span(colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, TORSO_TOP + row);
    painter.dot(colors.clothShade, CENTER_X + halfWidth, TORSO_TOP + row);
  }
  for (let row = ROBE_TOP; row <= ROBE_BOTTOM; row++) {
    const halfWidth = 4 + Math.floor((row - ROBE_TOP) * 0.26);
    painter.span(colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, row);
    painter.dot(colors.clothShade, CENTER_X + halfWidth, row);
    painter.dot(colors.clothShade, CENTER_X - halfWidth, row);
    if ((row - ROBE_TOP) % 5 === 4) painter.span(colors.clothShade, CENTER_X - halfWidth + 1, CENTER_X - 1, row);
  }
  painter.rect(MATERIAL.red, CENTER_X - 1, TORSO_TOP, 3, ROBE_BOTTOM - TORSO_TOP + 1);
  painter.rect(MATERIAL.redDark, CENTER_X + 1, TORSO_TOP, 1, ROBE_BOTTOM - TORSO_TOP + 1);
  painter.rect(colors.trim, CENTER_X - 2, TORSO_TOP, 1, ROBE_BOTTOM - TORSO_TOP + 1);
  painter.rect(colors.trim, CENTER_X + 2, TORSO_TOP, 1, ROBE_BOTTOM - TORSO_TOP + 1);
  painter.rect(colors.trim, CENTER_X - 1, TORSO_TOP + 5, 3, 1);
  painter.rect(colors.trim, CENTER_X, TORSO_TOP + 4, 1, 3);
  painter.span(MATERIAL.leather, CENTER_X - 4, CENTER_X + 4, ROBE_TOP);
  painter.rect(MATERIAL.leather, CENTER_X + 3, ROBE_TOP, 1, 8);
  painter.rect(colors.trim, CENTER_X + 3, ROBE_TOP + 8, 1, 2);
  painter.span(colors.trim, CENTER_X - 12, CENTER_X + 12, ROBE_BOTTOM - 1);
  painter.span(MATERIAL.goldDark, CENTER_X - 12, CENTER_X + 12, ROBE_BOTTOM);
  painter.rect(MATERIAL.leather, CENTER_X - 6, 55, 5, 2);
  painter.rect(MATERIAL.leather, CENTER_X + 2, 55, 5, 2);
}

function paintHolyStaff(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(MATERIAL.wood, STAFF_X, 12, 2, 45);
  painter.rect(MATERIAL.woodDark, STAFF_X + 1, 12, 1, 45);
  painter.grid(
    ['...GGGGG...', '..GwwwwwG..', '.GwwHHHwwG.', 'GwwHHHHHwwG', 'GwHHHHHHHwG', 'GwHHHHHHHwG', 'GwwHHHHHwwG', '.GwwHHHwwG.', '..GwwwwwG..', '...GGGGG...'],
    { G: colors.trim, w: MATERIAL.white, H: HOLY_LIGHT },
    STAFF_X - 4,
    2,
  );
  painter.rect(MATERIAL.goldDark, STAFF_X - 1, 12, 4, 1);
  painter.line(colors.cloth, CENTER_X + 4, TORSO_TOP, STAFF_X - 1, 23, 3);
  painter.line(colors.clothShade, CENTER_X + 4, TORSO_TOP + 1, STAFF_X - 1, 24);
  painter.rect(colors.skin, STAFF_X - 1, 22, 4, 4);
  painter.rect(colors.skinShade, STAFF_X - 1, 25, 4, 1);
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
  paintRobe(painter, colors);
  paintPriestHead(painter, colors, CENTER_X, HEAD_TOP);
  paintBlessingHand(painter, colors);
  paintHolyStaff(painter, colors);
  painter.rect(darken(colors.hair, 0.8), CENTER_X - 2, 13, 5, 1);
  painter.rect(lighten(colors.cloth), CENTER_X - 4, TORSO_TOP + 1, 2, 4);
  return finishPortrait(drawing);
}
