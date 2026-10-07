import { HEAD_CENTER_X, INK, paintFeatures, paintNeckAndHead } from './faceParts';
import type { PortraitPainter, Swatch } from './portraitPainter';

const SKIN: Swatch = { base: '#d29a70', shade: '#a8764f', light: '#e6b48c' };
const HAIR: Swatch = { base: '#5a3a1e', shade: '#3a2414', light: '#7a5430' };
const SHIRT: Swatch = { base: '#c8b48a', shade: '#9a8660', light: '#e2d2ac' };
const APRON: Swatch = { base: '#9a6a3a', shade: '#6e4825', light: '#b88650' };
const HIDE: Swatch = { base: '#c08a50', shade: '#8a5e30', light: '#dca66c' };
const STEEL: Swatch = { base: '#c0c8d0', shade: '#6f7885', light: '#f0f4f8' };

export function paintTannerBackground(painter: PortraitPainter): void {
  painter.rect('#2c1f14', 0, 0, 64, 64);
  painter.ellipse('#3e2c1c', 32, 30, 30, 30);
  painter.ellipse('#4b3623', 32, 28, 20, 20);
  painter.rect('#22170f', 0, 8, 64, 2);
  painter.shadedTrapezoid(HIDE, 8, 10, 30, 6, 4);
  painter.shadedTrapezoid({ base: '#7a5a38', shade: '#54401f', light: '#9a7650' }, 56, 10, 26, 5, 4);
  painter.rect('#22170f', 0, 56, 64, 8);
}

export function paintLeatherworker(painter: PortraitPainter): void {
  painter.shadedTrapezoid(SHIRT, 32, 46, 64, 12, 29);
  painter.shadedTrapezoid(APRON, 32, 52, 64, 9, 18);
  painter.rect(APRON.light, 24, 54, 1, 1);
  [54, 58, 62].forEach((y) => {
    painter.dot(APRON.light, 24, y);
    painter.dot(APRON.light, 40, y);
  });
  painter.line(APRON.base, 20, 46, 25, 53, 3);
  painter.line(APRON.base, 44, 46, 39, 53, 3);
  painter.shadedEllipse(HIDE, 12, 54, 9, 7);
  painter.ring(HIDE.shade, 12, 54, 4);
  paintNeckAndHead(painter, SKIN);
  painter.checker(SKIN.shade, 24, 34, 16, 6);
  paintFeatures(painter, { skin: SKIN, eye: '#6a4a2a', brow: HAIR.base, lip: '#8a4a3a', mouth: 'smile', browDrop: 1 });
  painter.shadedEllipse(HAIR, HEAD_CENTER_X, 16, 12, 6);
  painter.rect(HAIR.base, 21, 18, 3, 8);
  painter.rect(HAIR.base, 40, 18, 3, 8);
  painter.rect(HAIR.light, 25, 15, 4, 1);
  painter.rect(HAIR.base, 28, 19, 4, 2);
  painter.rect(HAIR.base, 34, 19, 5, 2);
  painter.shadedRect(APRON, 21, 17, 22, 3);
  painter.rect(APRON.light, 30, 18, 4, 1);
  painter.line(STEEL.base, 51, 30, 55, 42, 2);
  painter.rect(STEEL.light, 51, 30, 1, 3);
  painter.rect(STEEL.shade, 53, 38, 2, 3);
  painter.shadedRect({ base: '#6a4a30', shade: '#4a3322', light: '#8a6a4a' }, 54, 42, 3, 10);
  painter.dot(INK, 55, 52);
}
