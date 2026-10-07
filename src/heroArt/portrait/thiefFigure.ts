import type { HeroColors } from '../heroPalette';
import { paintThiefHead } from '../headgear/thiefHead';
import { paintCurvedBlade, paintLitLimb, thiefTones, type ThiefTones } from '../thiefParts';
import type { SpritePainter } from '../spritePainter';
import { finishPortrait, startPortrait } from './portraitFrame';
import { TORSO_TOP, paintBeltAndKit, paintCloak, paintLegs, paintPauldrons, paintTorso } from './thiefFigureBody';

const HEAD_CENTER_X = 17;
const HEAD_TOP = 3;

function paintHair(painter: SpritePainter, colors: HeroColors, tones: ThiefTones): void {
  if (colors.appearance.gender !== 'female') return;
  painter.line(colors.hair, 22, HEAD_TOP + 6, 27, HEAD_TOP + 14, 3);
  painter.line(colors.hairShade, 24, HEAD_TOP + 6, 28, HEAD_TOP + 15);
  painter.rect(tones.trim, 22, HEAD_TOP + 6, 3, 1);
}

function paintScarf(painter: SpritePainter, tones: ThiefTones): void {
  painter.rect(tones.trimDeep, 12, HEAD_TOP + 12, 11, 2);
  painter.rect(tones.trim, 12, HEAD_TOP + 12, 8, 1);
  painter.rect(tones.trimDeep, 20, HEAD_TOP + 13, 3, 1);
  painter.line(tones.trimDeep, 12, HEAD_TOP + 13, 7, HEAD_TOP + 21, 3);
  painter.line(tones.trim, 11, HEAD_TOP + 14, 6, HEAD_TOP + 21);
  painter.line(tones.shade, 10, HEAD_TOP + 17, 8, HEAD_TOP + 22);
}

function paintFist(painter: SpritePainter, colors: HeroColors, x: number, y: number): void {
  painter.rect(colors.skin, x, y, 4, 4);
  painter.rect(colors.skinShade, x, y + 3, 4, 1);
  painter.dot(colors.skinShade, x + 3, y + 1);
}

function paintLeftArm(painter: SpritePainter, colors: HeroColors, tones: ThiefTones): void {
  paintLitLimb(painter, { fromX: 8, fromY: TORSO_TOP + 3, toX: 4, toY: 25, thickness: 4 }, tones.base, tones.light, tones.shade);
  paintLitLimb(painter, { fromX: 4, fromY: 26, toX: 7, toY: 30, thickness: 4 }, colors.skin, colors.skin, colors.skinShade);
  painter.rect(tones.leather, 4, 26, 7, 6);
  painter.rect(tones.leatherLight, 4, 26, 7, 1);
  painter.rect(tones.leatherLight, 4, 27, 1, 4);
  painter.rect(tones.leatherDark, 10, 27, 1, 5);
  painter.rect(tones.trim, 4, 29, 7, 1);
  painter.rect(tones.leatherDark, 4, 31, 7, 1);
  paintFist(painter, colors, 6, 32);
  paintCurvedBlade(painter, tones, { hiltX: 6, hiltY: 35, bendX: 0, bendY: 36, tipX: 2, tipY: 47, scale: 2 });
}

function paintRightArm(painter: SpritePainter, colors: HeroColors, tones: ThiefTones): void {
  paintLitLimb(painter, { fromX: 26, fromY: TORSO_TOP + 3, toX: 31, toY: 21, thickness: 4 }, tones.shade, tones.base, tones.deep);
  paintLitLimb(painter, { fromX: 31, fromY: 17, toX: 31, toY: 13, thickness: 4 }, colors.skin, colors.skin, colors.skinShade);
  painter.rect(tones.leather, 30, 15, 5, 7);
  painter.rect(tones.leatherLight, 30, 15, 5, 1);
  painter.rect(tones.leatherLight, 30, 16, 1, 5);
  painter.rect(tones.leatherDark, 34, 16, 1, 6);
  painter.rect(tones.trim, 30, 18, 5, 1);
  painter.rect(tones.leatherDark, 30, 21, 5, 1);
  paintFist(painter, colors, 30, 11);
  paintCurvedBlade(painter, tones, { hiltX: 32, hiltY: 11, bendX: 37, bendY: 6, tipX: 33, tipY: 0, scale: 2 });
}

export function drawThiefFigure(colors: HeroColors): HTMLCanvasElement {
  const drawing = startPortrait();
  const { painter } = drawing;
  const tones = thiefTones(colors);
  paintCloak(painter, tones);
  paintHair(painter, colors, tones);
  paintLegs(painter, tones);
  paintTorso(painter, colors, tones);
  paintBeltAndKit(painter, tones);
  paintPauldrons(painter, tones);
  paintThiefHead(painter, colors, HEAD_CENTER_X, HEAD_TOP);
  paintScarf(painter, tones);
  paintLeftArm(painter, colors, tones);
  paintRightArm(painter, colors, tones);
  return finishPortrait(drawing);
}
