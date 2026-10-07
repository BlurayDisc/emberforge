import { HEAD_CENTER_X, INK, paintFeatures, paintNeckAndHead } from './faceParts';
import type { PortraitPainter, Swatch } from './portraitPainter';

const SKIN: Swatch = { base: '#f0c8a4', shade: '#c9966c', light: '#fbe0c4' };
const HAIR: Swatch = { base: '#c9a24a', shade: '#9a7a30', light: '#e6c878' };
const VEST: Swatch = { base: '#5a8fe0', shade: '#3a62a8', light: '#86b0f0' };
const GOLD = '#f2c14e';
const GEM: Swatch = { base: '#5ad0e0', shade: '#2a98b0', light: '#ffffff' };

export function paintJewelerBackground(painter: PortraitPainter): void {
  painter.rect('#1a2c46', 0, 0, 64, 64);
  painter.ellipse('#223a5a', 32, 30, 30, 30);
  painter.ellipse('#2c4a70', 32, 28, 20, 20);
  painter.rect('#142238', 0, 56, 64, 8);
}

export function paintJeweler(painter: PortraitPainter): void {
  painter.shadedTrapezoid(VEST, 32, 46, 64, 12, 28);
  painter.rect('#f4efe6', 28, 46, 8, 18);
  painter.line(GOLD, 20, 50, 26, 64);
  painter.line(GOLD, 44, 50, 38, 64);
  paintNeckAndHead(painter, SKIN);
  paintFeatures(painter, { skin: SKIN, eye: '#4a6a9a', brow: HAIR.shade, lip: '#b8584a', mouth: 'smile' });
  painter.ring(GOLD, 36, 28, 4);
  painter.line(GOLD, 40, 30, 44, 44);
  painter.shadedEllipse(HAIR, HEAD_CENTER_X, 16, 12, 6);
  painter.rect(HAIR.base, 21, 18, 3, 9);
  painter.rect(HAIR.base, 40, 18, 3, 9);
  painter.shadedEllipse(GEM, 52, 52, 5, 5);
  painter.dot(INK, 52, 57);
}
