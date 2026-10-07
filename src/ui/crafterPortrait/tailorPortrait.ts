import { HEAD_CENTER_X, paintFeatures, paintNeckAndHead } from './faceParts';
import type { PortraitPainter, Swatch } from './portraitPainter';

const SKIN: Swatch = { base: '#f0c8a4', shade: '#c9966c', light: '#fbe0c4' };
const HAIR: Swatch = { base: '#6a3a22', shade: '#46251a', light: '#8a5232' };
const DRESS: Swatch = { base: '#a85abf', shade: '#7a3e8f', light: '#c47ad8' };
const LACE = '#f4efe6';
const GOLD = '#f2c14e';
const TAPE = '#e8d070';

export function paintFabricShopBackground(painter: PortraitPainter): void {
  painter.rect('#3a2044', 0, 0, 64, 64);
  painter.ellipse('#4a2a55', 32, 30, 30, 30);
  painter.ellipse('#5a3566', 32, 28, 20, 20);
  [['#5a8fe0', 0], ['#e0c050', 4], ['#c0504a', 8]].forEach(([color, offset]) => {
    painter.rect(color as string, 0 + (offset as number), 6, 4, 58);
    painter.rect(color as string, 60 - (offset as number), 6, 4, 58);
  });
  painter.rect('#2a1634', 0, 56, 64, 8);
}

export function paintTailor(painter: PortraitPainter): void {
  painter.shadedTrapezoid(DRESS, 32, 46, 64, 11, 27);
  painter.line(DRESS.shade, 32, 50, 32, 64);
  [54, 58, 62].forEach((y) => painter.dot(GOLD, 31, y));
  paintNeckAndHead(painter, SKIN);
  painter.shadedRect({ base: LACE, shade: '#c8bfae', light: '#ffffff' }, 25, 44, 14, 5);
  painter.checker('#c8bfae', 25, 46, 14, 3);
  paintFeatures(painter, { skin: SKIN, eye: '#4a6a9a', brow: HAIR.shade, lip: '#b8584a', mouth: 'smile' });
  painter.ring(GOLD, 28, 28, 3);
  painter.ring(GOLD, 36, 28, 3);
  painter.rect(GOLD, 31, 28, 2, 1);
  painter.shadedEllipse(HAIR, HEAD_CENTER_X, 16, 12, 6);
  painter.rect(HAIR.base, 21, 18, 3, 11);
  painter.rect(HAIR.base, 40, 18, 3, 11);
  painter.rect(HAIR.shade, 28, 20, 8, 1);
  painter.shadedEllipse(HAIR, HEAD_CENTER_X, 7, 7, 5);
  painter.line(GOLD, 36, 5, 44, 2, 1);
  painter.dot('#ffffff', 44, 2);
  painter.line(TAPE, 24, 44, 22, 62, 3);
  painter.line(TAPE, 40, 44, 42, 62, 3);
  for (let mark = 48; mark < 62; mark += 3) {
    painter.dot('#7a5a1a', 22, mark);
    painter.dot('#7a5a1a', 42, mark);
  }
  painter.line('#c0c8d0', 50, 30, 56, 48);
  painter.dot('#ffffff', 50, 30);
  painter.line('#c0504a', 51, 32, 46, 56);
}
