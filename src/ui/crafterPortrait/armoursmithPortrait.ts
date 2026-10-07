import { HEAD_CENTER_X, INK, paintFeatures, paintMouthInBeard, paintNeckAndHead } from './faceParts';
import type { PortraitPainter, Swatch } from './portraitPainter';

const SKIN: Swatch = { base: '#c99a76', shade: '#9f7552', light: '#dcb290' };
const STEEL: Swatch = { base: '#8a919c', shade: '#5e6672', light: '#c4cad4' };
const GOLD = '#f2c14e';
const GOLD_SHADE = '#b88a2a';
const GREY_HAIR: Swatch = { base: '#c8c8c4', shade: '#8f8f8c', light: '#f0f0ec' };

export function paintArmourerBackground(painter: PortraitPainter): void {
  painter.rect('#26323e', 0, 0, 64, 64);
  painter.ellipse('#33414d', 32, 30, 28, 28);
  painter.ellipse('#3f5060', 32, 28, 19, 19);
  painter.checker('#26323e', 0, 0, 64, 64);
  painter.rect('#1a232c', 4, 44, 14, 3);
  painter.rect('#1a232c', 7, 47, 8, 6);
  painter.rect('#1a232c', 4, 53, 14, 3);
  painter.rect('#1a232c', 0, 56, 64, 8);
}

export function paintArmoursmith(painter: PortraitPainter): void {
  painter.shadedTrapezoid(STEEL, 32, 46, 64, 12, 28);
  painter.rect(GOLD, 31, 48, 2, 16);
  painter.rect(GOLD_SHADE, 33, 48, 1, 16);
  painter.rect(STEEL.shade, 22, 52, 20, 1);
  painter.shadedEllipse(STEEL, 14, 52, 11, 8);
  painter.shadedEllipse(STEEL, 50, 52, 11, 8);
  painter.rect(GOLD, 6, 50, 16, 1);
  painter.rect(GOLD, 42, 50, 16, 1);
  painter.rect(GOLD_SHADE, 8, 56, 12, 1);
  painter.rect(GOLD_SHADE, 44, 56, 12, 1);
  [10, 14, 18, 46, 50, 54].forEach((x) => painter.dot(GOLD, x, 53));
  paintNeckAndHead(painter, SKIN);
  painter.shadedRect(STEEL, 26, 44, 12, 4);
  paintFeatures(painter, { skin: SKIN, eye: '#5a6a7a', brow: GREY_HAIR.base, lip: '#8a5a50', mouth: 'none', browDrop: 1, wrinkles: true });
  painter.shadedEllipse(GREY_HAIR, HEAD_CENTER_X, 36, 8, 6);
  painter.rect(SKIN.base, 27, 31, 10, 3);
  painter.rect(GREY_HAIR.base, 25, 33, 14, 2);
  paintMouthInBeard(painter, '#8a5a50');
  painter.shadedEllipse(STEEL, HEAD_CENTER_X, 20, 13, 9);
  painter.shadedRect(STEEL, 19, 20, 26, 5);
  painter.rect(STEEL.shade, 19, 24, 26, 1);
  painter.rect(GOLD, 19, 22, 26, 1);
  painter.shadedRect(STEEL, 19, 24, 3, 12);
  painter.shadedRect(STEEL, 42, 24, 3, 12);
  painter.rect(GOLD, 31, 8, 2, 14);
  painter.rect(GOLD_SHADE, 33, 9, 1, 12);
  [22, 28, 36, 41].forEach((x) => painter.dot(GOLD, x, 23));
  painter.dot(INK, 20, 36);
}
