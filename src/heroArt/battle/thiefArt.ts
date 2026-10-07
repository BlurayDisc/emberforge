import { addHeroOutline, createHeroCanvas } from '../heroCanvas';
import { type HeroColors } from '../heroPalette';
import { paintThiefHead } from '../headgear/thiefHead';
import { paintCurvedBlade, paintLitLimb, thiefTones, type ThiefTones } from '../thiefParts';
import { createSpritePainter, type SpritePainter } from '../spritePainter';

const DRAWING_WIDTH = 30;
const DRAWING_HEIGHT = 38;
const OUTLINE_MARGIN = 1;
export const THIEF_SPRITE_SIZE = { width: DRAWING_WIDTH + 2 * OUTLINE_MARGIN, height: DRAWING_HEIGHT + 2 * OUTLINE_MARGIN } as const;

const HEAD_CENTER_X = 13;
const HEAD_TOP = 1;
const TORSO_TOP = 13;
const TORSO_ROWS = 10;
const BELT_Y = TORSO_TOP + TORSO_ROWS;

const torsoLeftEdge = (row: number): number => 8 + Math.round(row * 0.2);
const torsoRightEdge = (row: number): number => 19 - Math.round(row * 0.1);

function paintCloak(painter: SpritePainter, tones: ThiefTones): void {
  for (let row = 0; row < 16; row++) {
    painter.span(tones.deep, 6 - Math.floor(row / 9), 21 + Math.floor(row / 6), TORSO_TOP + row);
  }
  [7, 13, 19].forEach((tipX, index) => {
    const length = index % 2 === 0 ? 3 : 2;
    for (let drop = 0; drop < length; drop++) painter.span(tones.deep, tipX - 2 + drop, tipX + 2 - drop, TORSO_TOP + 16 + drop);
  });
}

function paintLegs(painter: SpritePainter, tones: ThiefTones): void {
  paintLitLimb(painter, { fromX: 11, fromY: 24, toX: 7, toY: 30, thickness: 5 }, tones.base, tones.light, tones.shade);
  paintLitLimb(painter, { fromX: 16, fromY: 24, toX: 20, toY: 30, thickness: 5 }, tones.shade, tones.base, tones.deep);
  paintLitLimb(painter, { fromX: 7, fromY: 30, toX: 8, toY: 34, thickness: 4 }, tones.leather, tones.leatherLight, tones.leatherDark);
  paintLitLimb(painter, { fromX: 21, fromY: 30, toX: 21, toY: 33, thickness: 4 }, tones.leatherDark, tones.leather, tones.deep);
  painter.rect(tones.trim, 7, 33, 5, 1);
  painter.rect(tones.trim, 20, 32, 5, 1);
  painter.rect(tones.leather, 4, 35, 8, 3);
  painter.rect(tones.leatherLight, 4, 35, 5, 1);
  painter.rect(tones.leatherDark, 5, 37, 7, 1);
  painter.rect(tones.leather, 20, 34, 8, 3);
  painter.rect(tones.leatherLight, 20, 34, 4, 1);
  painter.rect(tones.leatherDark, 21, 36, 7, 1);
}

function paintTorso(painter: SpritePainter, colors: HeroColors, tones: ThiefTones): void {
  for (let row = 0; row < TORSO_ROWS; row++) {
    const left = torsoLeftEdge(row);
    const right = torsoRightEdge(row);
    painter.span(row > 6 ? tones.shade : tones.base, left, right, TORSO_TOP + row);
    painter.dot(tones.rim, left, TORSO_TOP + row);
    painter.dot(tones.deep, right, TORSO_TOP + row);
  }
  painter.span(tones.light, torsoLeftEdge(0), torsoRightEdge(0), TORSO_TOP);
  painter.rect(colors.skin, 13, TORSO_TOP + 1, 3, 2);
  painter.line(tones.leatherDark, 9, TORSO_TOP + 1, 18, TORSO_TOP + 9, 2);
  painter.line(tones.leatherLight, 9, TORSO_TOP + 1, 18, TORSO_TOP + 9);
  painter.dot(tones.trim, 14, TORSO_TOP + 5);
  painter.line(tones.shade, 11, TORSO_TOP + 5, 13, TORSO_TOP + 8);
  painter.rect(tones.leather, 6, TORSO_TOP, 4, 3);
  painter.rect(tones.leatherLight, 6, TORSO_TOP, 4, 1);
  painter.rect(tones.shade, 19, TORSO_TOP, 4, 3);
  painter.rect(tones.base, 19, TORSO_TOP, 4, 1);
}

function paintBeltAndKit(painter: SpritePainter, tones: ThiefTones): void {
  painter.rect(tones.leather, torsoLeftEdge(9) - 1, BELT_Y, 12, 2);
  painter.span(tones.leatherLight, torsoLeftEdge(9) - 1, torsoRightEdge(9) + 1, BELT_Y);
  painter.rect(tones.trim, 13, BELT_Y, 3, 2);
  for (let row = 0; row < 5; row++) {
    painter.span(tones.base, 11 + (row > 3 ? 1 : 0), 16 - (row > 3 ? 1 : 0), BELT_Y + 2 + row);
    painter.dot(tones.light, 11, BELT_Y + 2 + row);
  }
  painter.rect(tones.trimDeep, 11, BELT_Y + 6, 6, 1);
  painter.rect(tones.leather, 17, BELT_Y + 1, 4, 4);
  painter.rect(tones.leatherLight, 17, BELT_Y + 1, 4, 1);
  painter.dot(tones.trim, 19, BELT_Y + 3);
}

function paintScarf(painter: SpritePainter, tones: ThiefTones): void {
  painter.rect(tones.trimDeep, 9, HEAD_TOP + 11, 9, 2);
  painter.rect(tones.trim, 9, HEAD_TOP + 11, 6, 1);
  painter.line(tones.trimDeep, 9, HEAD_TOP + 12, 5, HEAD_TOP + 17, 2);
  painter.line(tones.trim, 8, HEAD_TOP + 13, 5, HEAD_TOP + 17);
}

function paintFist(painter: SpritePainter, colors: HeroColors, x: number, y: number): void {
  painter.rect(colors.skin, x, y, 3, 3);
  painter.rect(colors.skinShade, x, y + 2, 3, 1);
}

function paintArms(painter: SpritePainter, colors: HeroColors, tones: ThiefTones): void {
  paintLitLimb(painter, { fromX: 6, fromY: TORSO_TOP + 2, toX: 3, toY: 20, thickness: 3 }, tones.base, tones.light, tones.shade);
  paintLitLimb(painter, { fromX: 3, fromY: 20, toX: 4, toY: 25, thickness: 3 }, colors.skin, colors.skin, colors.skinShade);
  painter.rect(tones.leather, 2, 21, 4, 3);
  painter.rect(tones.trim, 2, 22, 4, 1);
  paintFist(painter, colors, 3, 25);
  paintCurvedBlade(painter, tones, { hiltX: 4, hiltY: 28, bendX: 0, bendY: 29, tipX: 2, tipY: 37, scale: 1 });
  paintLitLimb(painter, { fromX: 20, fromY: TORSO_TOP + 2, toX: 24, toY: 17, thickness: 3 }, tones.shade, tones.base, tones.deep);
  paintLitLimb(painter, { fromX: 24, fromY: 17, toX: 24, toY: 12, thickness: 3 }, colors.skin, colors.skin, colors.skinShade);
  painter.rect(tones.leather, 23, 14, 4, 3);
  painter.rect(tones.trim, 23, 15, 4, 1);
  paintFist(painter, colors, 23, 9);
  paintCurvedBlade(painter, tones, { hiltX: 25, hiltY: 9, bendX: 29, bendY: 5, tipX: 25, tipY: 0, scale: 1 });
}

export function drawThiefSprite(colors: HeroColors): HTMLCanvasElement {
  const art = createHeroCanvas(THIEF_SPRITE_SIZE.width, THIEF_SPRITE_SIZE.height);
  const painter = createSpritePainter(art, OUTLINE_MARGIN, OUTLINE_MARGIN);
  const tones = thiefTones(colors);
  paintCloak(painter, tones);
  if (colors.appearance.gender === 'female') {
    painter.line(colors.hair, 19, HEAD_TOP + 5, 22, HEAD_TOP + 11, 2);
    painter.line(colors.hairShade, 20, HEAD_TOP + 5, 23, HEAD_TOP + 11);
  }
  paintLegs(painter, tones);
  paintTorso(painter, colors, tones);
  paintBeltAndKit(painter, tones);
  paintThiefHead(painter, colors, HEAD_CENTER_X, HEAD_TOP);
  paintScarf(painter, tones);
  paintArms(painter, colors, tones);
  addHeroOutline(art);
  return art.canvas;
}
