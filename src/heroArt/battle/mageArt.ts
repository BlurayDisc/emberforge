import { addHeroOutline, createHeroCanvas } from '../heroCanvas';
import { paintMageHead } from '../headgear/mageHead';
import type { HeroPose } from '../heroPose';
import { darken, lighten, type HeroColors, type Hex } from '../heroPalette';
import { createSpritePainter, type SpritePainter } from '../spritePainter';

const DRAWING_WIDTH = 30;
const DRAWING_HEIGHT = 40;
const OUTLINE_MARGIN = 1;
export const MAGE_SPRITE_SIZE = { width: DRAWING_WIDTH + 2 * OUTLINE_MARGIN, height: DRAWING_HEIGHT + 2 * OUTLINE_MARGIN } as const;

const CENTER_X = 14;
const HEAD_TOP = 3;
const TORSO_TOP = 14;
const ORB_CENTER = { x: 26, y: 8 } as const;
const STAFF_X = 4;
const STAFF_GEM_COLOR = '#ff7a2a';
const ORB_GLOW = ['#c8401e', '#ff8a2a', '#fff0a0'] as const;
const SPARKLE = '#ffd070';

function paintHair(painter: SpritePainter, colors: HeroColors): void {
  const hairLight = lighten(colors.hair, 1.3);
  painter.rect(colors.hair, 8, 11, 3, 15);
  painter.rect(darken(colors.hair, 0.5), 8, 11, 1, 15);
  painter.rect(hairLight, 9, 12, 1, 10);
  painter.rect(colors.hair, 7, 18, 2, 9);
  painter.rect(darken(colors.hair, 0.5), 7, 22, 1, 5);
  painter.rect(colors.hair, 18, 11, 3, 12);
  painter.rect(colors.hairShade, 20, 11, 1, 12);
}

function paintRobe(painter: SpritePainter, colors: HeroColors): void {
  const bodiceHalfWidths = [4, 4, 4, 3, 3, 2, 2, 3];
  bodiceHalfWidths.forEach((halfWidth, index) => {
    painter.span(colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, TORSO_TOP + index);
    painter.dot(colors.clothShade, CENTER_X + halfWidth, TORSO_TOP + index);
  });
  painter.span(colors.clothLight, CENTER_X - 3, CENTER_X - 1, TORSO_TOP + 2);
  painter.span(colors.clothLight, CENTER_X + 1, CENTER_X + 3, TORSO_TOP + 2);
  painter.span(colors.clothShade, CENTER_X - 3, CENTER_X + 3, TORSO_TOP + 3);
  painter.dot(colors.skin, CENTER_X, TORSO_TOP);
  painter.dot(colors.skin, CENTER_X, TORSO_TOP + 1);
  painter.dot(colors.trim, CENTER_X - 1, TORSO_TOP + 1);
  painter.dot(colors.trim, CENTER_X + 1, TORSO_TOP + 1);
  painter.rect(colors.trim, CENTER_X - 3, TORSO_TOP + 7, 7, 2);
  painter.dot(colors.clothShade, CENTER_X, TORSO_TOP + 8);
  for (let row = 0; row < 12; row++) {
    const halfWidth = 3 + Math.floor(row * 0.45);
    painter.span(colors.cloth, CENTER_X - halfWidth, CENTER_X + halfWidth, TORSO_TOP + 9 + row);
    painter.dot(colors.clothShade, CENTER_X + halfWidth, TORSO_TOP + 9 + row);
    painter.dot(colors.clothShade, CENTER_X - halfWidth, TORSO_TOP + 9 + row);
    if (row % 3 === 2) painter.span(colors.clothShade, CENTER_X - halfWidth + 1, CENTER_X - 1, TORSO_TOP + 9 + row);
  }
  painter.span(colors.trim, CENTER_X - 8, CENTER_X + 8, TORSO_TOP + 20);
  painter.span(colors.clothShade, CENTER_X - 8, CENTER_X + 8, TORSO_TOP + 21);
}

function paintLegSlit(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.skin, CENTER_X + 2, TORSO_TOP + 12, 2, 10);
  painter.rect(colors.skinShade, CENTER_X + 3, TORSO_TOP + 12, 1, 10);
  painter.rect(colors.trim, CENTER_X + 4, TORSO_TOP + 12, 1, 9);
  painter.rect(colors.trim, CENTER_X + 1, TORSO_TOP + 12, 1, 9);
  painter.rect(darken(colors.clothShade, 0.7), CENTER_X + 1, TORSO_TOP + 23, 4, 3);
  painter.rect(colors.cloth, CENTER_X + 1, TORSO_TOP + 23, 4, 1);
  painter.rect(darken(colors.clothShade, 0.6), CENTER_X + 1, TORSO_TOP + 25, 7, 2);
  painter.rect(darken(colors.clothShade, 0.7), CENTER_X - 6, TORSO_TOP + 23, 4, 4);
  painter.rect(darken(colors.clothShade, 0.6), CENTER_X - 7, TORSO_TOP + 25, 5, 2);
}

function paintStaff(painter: SpritePainter, colors: HeroColors): void {
  painter.rect('#8a6340', STAFF_X, 4, 1, 36);
  painter.rect('#5e4128', STAFF_X + 1, 4, 1, 36);
  painter.rect(colors.trim, STAFF_X - 1, 6, 3, 1);
  painter.grid(['.o..', '.Oo.', '.GG.', 'GBBG', 'GBwG', '.GG.'], { G: colors.trim, B: STAFF_GEM_COLOR, w: '#fff0a0', o: '#e8501e', O: '#ffd860' }, STAFF_X - 1, 0);
  painter.line(colors.clothDeep, CENTER_X - 4, TORSO_TOP, STAFF_X + 1, TORSO_TOP + 7, 3);
  painter.line(colors.clothShade, CENTER_X - 4, TORSO_TOP, STAFF_X + 1, TORSO_TOP + 7, 2);
  painter.line(colors.cloth, CENTER_X - 3, TORSO_TOP, STAFF_X + 2, TORSO_TOP + 6);
  painter.rect(colors.skin, STAFF_X - 1, TORSO_TOP + 7, 3, 3);
}

function paintCastingArm(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.clothDeep, CENTER_X + 4, TORSO_TOP, 21, TORSO_TOP - 3, 3);
  painter.line(colors.cloth, CENTER_X + 4, TORSO_TOP, 21, TORSO_TOP - 3, 2);
  painter.line(colors.clothShade, CENTER_X + 4, TORSO_TOP + 1, 21, TORSO_TOP - 2);
  painter.rect(colors.trim, 20, TORSO_TOP - 3, 1, 3);
  painter.rect(colors.skin, 22, TORSO_TOP - 5, 3, 3);
  painter.rect(colors.skinShade, 22, TORSO_TOP - 3, 3, 1);
}

const ORB_RINGS_BY_POSE: Readonly<Record<HeroPose, readonly number[]>> = { ready: [3, 2, 1], charge: [4, 3, 2], released: [], reload: [1] };
const ORB_SPARKLES = [[23, 4], [29, 6], [28, 12], [24, 2], [29, 2]] as const;

// Released: the hand is empty. Reload: a small light forms again. Charge: the orb swells.
function paintOrb(painter: SpritePainter, pose: HeroPose): void {
  const rings = ORB_RINGS_BY_POSE[pose];
  rings.forEach((radius, index) => {
    const colorIndex = Math.max(0, ORB_GLOW.length - rings.length) + index;
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        if (x * x + y * y <= radius * radius + 1) painter.dot(ORB_GLOW[Math.min(colorIndex, ORB_GLOW.length - 1)] as Hex, ORB_CENTER.x + x, ORB_CENTER.y + y);
      }
    }
  });
  const sparkleCount = pose === 'released' ? 0 : pose === 'reload' ? 2 : ORB_SPARKLES.length;
  for (const [sparkleX, sparkleY] of ORB_SPARKLES.slice(0, sparkleCount)) painter.dot(SPARKLE, sparkleX, sparkleY);
}

export function drawMageSprite(colors: HeroColors, pose: HeroPose = 'ready'): HTMLCanvasElement {
  const art = createHeroCanvas(MAGE_SPRITE_SIZE.width, MAGE_SPRITE_SIZE.height);
  const painter = createSpritePainter(art, OUTLINE_MARGIN, OUTLINE_MARGIN);
  paintStaff(painter, colors);
  paintHair(painter, colors);
  paintRobe(painter, colors);
  paintLegSlit(painter, colors);
  paintMageHead(painter, colors, CENTER_X, HEAD_TOP);
  paintCastingArm(painter, colors);
  paintOrb(painter, pose);
  painter.rect(darken(colors.hair, 0.8), CENTER_X - 2, 13, 5, 1);
  addHeroOutline(art);
  return art.canvas;
}
