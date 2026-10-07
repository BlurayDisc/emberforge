import type { HeroColors } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';
import { paintLitLimb, type ThiefTones } from '../thiefParts';

export const TORSO_TOP = 15;
const TORSO_ROWS = 14;
const BELT_Y = TORSO_TOP + TORSO_ROWS;

function torsoLeftEdge(row: number): number {
  return 10 + Math.round(row * 0.22);
}

function torsoRightEdge(row: number): number {
  return 25 - Math.round(row * 0.1);
}

export function paintCloak(painter: SpritePainter, tones: ThiefTones): void {
  for (let row = 0; row < 22; row++) {
    const left = 8 - Math.floor(row / 8);
    const right = 28 + Math.floor(row / 6);
    painter.span(tones.deep, left, right, TORSO_TOP + row);
    painter.dot(tones.shade, left + 1, TORSO_TOP + row);
  }
  [8, 14, 20, 26].forEach((tipX, index) => {
    const length = index % 2 === 0 ? 5 : 3;
    for (let drop = 0; drop < length; drop++) painter.span(tones.deep, tipX - 3 + drop, tipX + 3 - drop, TORSO_TOP + 22 + drop);
    painter.dot(tones.shade, tipX - 2, TORSO_TOP + 22);
  });
  painter.line(tones.shade, 10, TORSO_TOP + 6, 9, TORSO_TOP + 21);
  painter.line(tones.shade, 27, TORSO_TOP + 6, 28, TORSO_TOP + 21);
}

export function paintLegs(painter: SpritePainter, tones: ThiefTones): void {
  paintLitLimb(painter, { fromX: 13, fromY: 31, toX: 8, toY: 42, thickness: 7 }, tones.base, tones.light, tones.shade);
  paintLitLimb(painter, { fromX: 20, fromY: 31, toX: 26, toY: 41, thickness: 7 }, tones.shade, tones.base, tones.deep);
  paintLitLimb(painter, { fromX: 8, fromY: 42, toX: 10, toY: 52, thickness: 6 }, tones.leather, tones.leatherLight, tones.leatherDark);
  paintLitLimb(painter, { fromX: 27, fromY: 42, toX: 29, toY: 51, thickness: 6 }, tones.leatherDark, tones.leather, tones.deep);
  painter.rect(tones.leatherLight, 7, 40, 6, 1);
  painter.rect(tones.leather, 7, 41, 6, 2);
  painter.rect(tones.leatherDark, 7, 43, 6, 1);
  painter.rect(tones.leather, 26, 40, 6, 3);
  painter.rect(tones.leatherLight, 26, 40, 5, 1);
  painter.rect(tones.leatherLight, 8, 46, 7, 1);
  painter.rect(tones.trim, 8, 47, 7, 1);
  painter.rect(tones.trimDeep, 8, 48, 7, 1);
  painter.rect(tones.leatherLight, 28, 46, 6, 1);
  painter.rect(tones.trimDeep, 28, 47, 6, 1);
  painter.rect(tones.trim, 28, 50, 6, 1);
  painter.rect(tones.leather, 5, 53, 11, 4);
  painter.rect(tones.leatherLight, 5, 53, 6, 1);
  painter.rect(tones.leatherDark, 6, 56, 10, 1);
  painter.rect(tones.leatherDark, 5, 53, 1, 3);
  painter.rect(tones.leather, 27, 52, 10, 3);
  painter.rect(tones.leatherLight, 27, 52, 5, 1);
  painter.rect(tones.leatherDark, 28, 54, 9, 1);
  painter.line(tones.light, 15, 33, 11, 40);
  painter.line(tones.deep, 17, 36, 14, 41);
  painter.line(tones.base, 22, 33, 25, 38);
  painter.line(tones.deep, 24, 38, 27, 40);
  painter.dot(tones.steelLight, 9, 41);
}

export function paintTorso(painter: SpritePainter, colors: HeroColors, tones: ThiefTones): void {
  for (let row = 0; row < TORSO_ROWS; row++) {
    const left = torsoLeftEdge(row);
    const right = torsoRightEdge(row);
    const y = TORSO_TOP + row;
    painter.span(row > 9 ? tones.shade : tones.base, left, right, y);
    painter.dot(tones.rim, left, y);
    painter.dot(tones.light, left + 1, y);
    painter.dot(tones.deep, right, y);
    painter.dot(tones.shade, right - 1, y);
  }
  painter.span(tones.light, torsoLeftEdge(0), torsoRightEdge(0), TORSO_TOP);
  painter.rect(colors.skin, 16, TORSO_TOP + 1, 4, 1);
  painter.rect(colors.skin, 17, TORSO_TOP + 2, 2, 2);
  painter.dot(colors.skinShade, 19, TORSO_TOP + 2);
  painter.line(tones.deep, 18, TORSO_TOP + 4, 18, TORSO_TOP + 9);
  painter.line(tones.shade, 14, TORSO_TOP + 6, 16, TORSO_TOP + 10);
  painter.line(tones.shade, 22, TORSO_TOP + 5, 21, TORSO_TOP + 9);
  painter.line(tones.light, 13, TORSO_TOP + 8, 14, TORSO_TOP + 10);
  painter.line(tones.leatherDark, 11, TORSO_TOP + 1, 23, TORSO_TOP + 12, 3);
  painter.line(tones.leather, 11, TORSO_TOP + 1, 23, TORSO_TOP + 12, 2);
  painter.line(tones.leatherLight, 11, TORSO_TOP + 1, 23, TORSO_TOP + 12);
  [14, 17, 20].forEach((x, index) => {
    painter.rect(tones.steel, x, TORSO_TOP + 3 + index * 3 - 1, 1, 3);
  });
  painter.rect(tones.trim, 17, TORSO_TOP + 6, 2, 2);
  painter.dot(tones.trimLight, 17, TORSO_TOP + 6);
}

export function paintPauldrons(painter: SpritePainter, tones: ThiefTones): void {
  painter.rect(tones.leather, 7, TORSO_TOP, 6, 4);
  painter.rect(tones.leatherLight, 7, TORSO_TOP, 6, 1);
  painter.rect(tones.leatherLight, 7, TORSO_TOP + 1, 1, 2);
  painter.rect(tones.leatherDark, 8, TORSO_TOP + 3, 5, 1);
  painter.dot(tones.trim, 10, TORSO_TOP + 1);
  painter.rect(tones.shade, 24, TORSO_TOP, 5, 4);
  painter.rect(tones.base, 24, TORSO_TOP, 5, 1);
  painter.rect(tones.deep, 25, TORSO_TOP + 3, 4, 1);
  painter.rect(tones.trimDeep, 24, TORSO_TOP + 2, 5, 1);
}

export function paintBeltAndKit(painter: SpritePainter, tones: ThiefTones): void {
  const left = torsoLeftEdge(TORSO_ROWS - 1) - 1;
  const right = torsoRightEdge(TORSO_ROWS - 1) + 1;
  painter.rect(tones.leather, left, BELT_Y, right - left + 1, 3);
  painter.span(tones.leatherLight, left, right, BELT_Y);
  painter.span(tones.leatherDark, left, right, BELT_Y + 2);
  painter.rect(tones.trimDeep, 17, BELT_Y, 4, 3);
  painter.rect(tones.trim, 17, BELT_Y, 4, 1);
  painter.rect(tones.leatherDark, 18, BELT_Y + 1, 2, 1);
  for (let row = 0; row < 9; row++) {
    const hemInset = row > 6 && row % 2 === 0 ? 1 : 0;
    painter.span(tones.base, 14 + hemInset, 20 - hemInset, BELT_Y + 3 + row);
    painter.dot(tones.light, 14 + hemInset, BELT_Y + 3 + row);
    painter.dot(tones.shade, 20 - hemInset, BELT_Y + 3 + row);
  }
  painter.rect(tones.trimDeep, 14, BELT_Y + 10, 7, 1);
  painter.rect(tones.leatherDark, 21, BELT_Y + 1, 6, 6);
  painter.rect(tones.leather, 21, BELT_Y + 1, 5, 5);
  painter.rect(tones.leatherLight, 21, BELT_Y + 1, 5, 1);
  painter.rect(tones.leatherLight, 21, BELT_Y + 2, 1, 3);
  painter.rect(tones.leatherDark, 21, BELT_Y + 4, 5, 1);
  painter.dot(tones.trim, 23, BELT_Y + 4);
  painter.rect(tones.leather, 11, BELT_Y + 3, 3, 6);
  painter.rect(tones.leatherLight, 11, BELT_Y + 3, 3, 1);
  painter.rect(tones.steelDark, 12, BELT_Y + 9, 1, 3);
  painter.dot(tones.steelLight, 12, BELT_Y + 9);
}
