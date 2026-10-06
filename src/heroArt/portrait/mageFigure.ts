import { paintMageHead } from '../headgear/mageHead';
import { darken, type HeroColors, type Hex } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';
import { PORTRAIT_CENTER_X, finishPortrait, startPortrait } from './portraitFrame';

const CENTER_X = PORTRAIT_CENTER_X - 1;
const HEAD_TOP = 3;
const TORSO_TOP = 14;
const ROBE_TOP = 24;
const ROBE_BOTTOM = 54;
const STAFF_X = 4;
const ORB_CENTER = { x: 32, y: 4 } as const;
const ORB_GLOW = ['#a02a1a', '#ff8a2a', '#fff0a0'] as const;
const SPARKLE = '#ffd070';
const STAFF_GEM = '#ff7a2a';

function paintHair(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.hair, 9, 11, 3, 18);
  painter.rect(colors.hairShade, 9, 11, 1, 18);
  painter.rect(colors.hair, 8, 24, 3, 8);
  painter.rect(colors.hair, 24, 11, 3, 14);
  painter.rect(colors.hairShade, 26, 11, 1, 14);
}

function paintRobe(painter: SpritePainter, colors: HeroColors): void {
  const bodiceHalfWidths = [4, 4, 4, 4, 3, 3, 3, 2, 2, 3];
  bodiceHalfWidths.forEach((halfWidth, index) => {
    painter.span(colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, TORSO_TOP + index);
    painter.dot(colors.clothShade, CENTER_X + halfWidth, TORSO_TOP + index);
  });
  painter.span(colors.clothLight, CENTER_X - 3, CENTER_X - 1, TORSO_TOP + 2);
  painter.span(colors.clothLight, CENTER_X + 1, CENTER_X + 3, TORSO_TOP + 2);
  painter.span(colors.clothShade, CENTER_X - 3, CENTER_X + 3, TORSO_TOP + 3);
  painter.rect(colors.skin, CENTER_X, TORSO_TOP, 1, 3);
  painter.dot(colors.trim, CENTER_X - 1, TORSO_TOP + 1);
  painter.dot(colors.trim, CENTER_X + 1, TORSO_TOP + 1);
  painter.rect(colors.trim, CENTER_X - 3, ROBE_TOP - 2, 7, 2);
  painter.dot(colors.clothShade, CENTER_X, ROBE_TOP - 1);
  for (let row = ROBE_TOP; row <= ROBE_BOTTOM; row++) {
    const halfWidth = 3 + Math.floor((row - ROBE_TOP) * 0.2);
    painter.span(colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, row);
    painter.dot(colors.clothShade, CENTER_X + halfWidth, row);
    painter.dot(colors.clothShade, CENTER_X - halfWidth, row);
    if ((row - ROBE_TOP) % 4 === 3) painter.span(colors.clothShade, CENTER_X - halfWidth + 1, CENTER_X - 1, row);
  }
  painter.span(colors.trim, CENTER_X - 9, CENTER_X + 9, ROBE_BOTTOM - 1);
  painter.span(colors.clothShade, CENTER_X - 9, CENTER_X + 9, ROBE_BOTTOM);
}

function paintLegSlit(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.skin, CENTER_X + 2, ROBE_TOP + 8, 3, 21);
  painter.rect(colors.skinShade, CENTER_X + 4, ROBE_TOP + 8, 1, 21);
  painter.rect(colors.trim, CENTER_X + 5, ROBE_TOP + 8, 1, 21);
  painter.rect(colors.trim, CENTER_X + 1, ROBE_TOP + 8, 1, 21);
  painter.rect(darken(colors.clothShade, 0.7), CENTER_X + 2, ROBE_TOP + 24, 3, 6);
  painter.rect(colors.cloth, CENTER_X + 2, ROBE_TOP + 24, 3, 1);
  painter.rect(darken(colors.clothShade, 0.6), CENTER_X + 2, 55, 8, 2);
  painter.rect(darken(colors.clothShade, 0.6), CENTER_X - 8, 55, 8, 2);
  painter.rect(darken(colors.clothShade, 0.7), CENTER_X - 4, 54, 4, 1);
}

function paintStaff(painter: SpritePainter, colors: HeroColors): void {
  painter.rect('#8a6340', STAFF_X, 6, 2, 51);
  painter.rect('#5e4128', STAFF_X + 1, 6, 1, 51);
  painter.rect(colors.trim, STAFF_X - 1, 9, 4, 1);
  painter.rect(colors.trim, STAFF_X - 1, 38, 4, 1);
  painter.grid(
    ['.GG..', 'G.GG.', 'GBBwG', 'GBBBG', '.GBG.', '..G..'],
    { G: colors.trim, B: STAFF_GEM, w: '#fff0a0' },
    STAFF_X - 2,
    2,
  );
  painter.line(colors.cloth, CENTER_X - 4, TORSO_TOP, STAFF_X + 2, 28, 3);
  painter.line(colors.clothShade, CENTER_X - 3, TORSO_TOP + 1, STAFF_X + 3, 29);
  painter.rect(colors.skin, STAFF_X - 1, 28, 4, 4);
  painter.rect(colors.skinShade, STAFF_X - 1, 31, 4, 1);
}

function paintCastingArm(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.cloth, CENTER_X + 4, TORSO_TOP, 28, 11, 3);
  painter.line(colors.clothShade, CENTER_X + 4, TORSO_TOP + 1, 28, 12);
  painter.rect(colors.trim, 27, 10, 1, 4);
  painter.rect(colors.skin, 29, 7, 4, 4);
  painter.rect(colors.skinShade, 29, 10, 4, 1);
}

function paintOrb(painter: SpritePainter): void {
  [4, 3, 1].forEach((radius, index) => {
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        if (x * x + y * y <= radius * radius + 1) painter.dot(ORB_GLOW[index] as Hex, ORB_CENTER.x + x, ORB_CENTER.y + y);
      }
    }
  });
  for (const [sparkleX, sparkleY] of [[27, 1], [36, 3], [35, 9], [28, 6], [37, 0]] as const) painter.dot(SPARKLE, sparkleX, sparkleY);
}

export function drawMageFigure(colors: HeroColors): HTMLCanvasElement {
  const drawing = startPortrait();
  const { painter } = drawing;
  paintStaff(painter, colors);
  paintHair(painter, colors);
  paintRobe(painter, colors);
  paintLegSlit(painter, colors);
  paintMageHead(painter, colors, CENTER_X, HEAD_TOP);
  paintCastingArm(painter, colors);
  paintOrb(painter);
  painter.rect(darken(colors.hair, 0.8), CENTER_X - 2, 13, 5, 1);
  return finishPortrait(drawing);
}
