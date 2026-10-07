import { HEAD_CENTER_X, paintFeatures, paintNeckAndHead } from './faceParts';
import type { PortraitPainter, Swatch } from './portraitPainter';

const SKIN: Swatch = { base: '#f0c8a4', shade: '#c9966c', light: '#fbe0c4' };
const CLOAK: Swatch = { base: '#4f7f3f', shade: '#355a2a', light: '#6ea057' };
const BLOND: Swatch = { base: '#e6c25a', shade: '#b8923a', light: '#f8e08a' };
const WOOD: Swatch = { base: '#8a6340', shade: '#5e4128', light: '#a87c52' };
const LEATHER: Swatch = { base: '#6a4a30', shade: '#4a3322', light: '#8a6a4a' };

export function paintGreenwoodBackground(painter: PortraitPainter): void {
  painter.rect('#1f3a1d', 0, 0, 64, 64);
  painter.ellipse('#2c4a2a', 32, 30, 30, 30);
  painter.ellipse('#385a35', 32, 28, 20, 20);
  [3, 12, 50, 59].forEach((x) => painter.rect('#16301a', x, 0, 4, 64));
  [[8, 10], [52, 18], [14, 30], [56, 40], [46, 6]].forEach(([x, y]) => painter.rect('#6ea057', x ?? 0, y ?? 0, 2, 2));
}

export function paintFletcher(painter: PortraitPainter): void {
  [[52, 14], [57, 26], [58, 38], [56, 50], [52, 62]].forEach(([x, y], index, points) => {
    const next = points[index + 1];
    if (next) painter.line(WOOD.base, x ?? 0, y ?? 0, next[0] ?? 0, next[1] ?? 0, 2);
  });
  painter.line('#ead9a8', 52, 14, 52, 62);
  painter.shadedRect(LEATHER, 42, 34, 8, 16);
  [[44, 26, 46, 36], [47, 24, 48, 36]].forEach(([fromX, fromY, toX, toY]) => painter.line(WOOD.light, fromX ?? 0, fromY ?? 0, toX ?? 0, toY ?? 0));
  painter.rect('#b23a3a', 43, 24, 2, 4);
  painter.rect('#ffffff', 46, 22, 2, 4);
  painter.ellipse(CLOAK.shade, HEAD_CENTER_X, 25, 15, 17);
  painter.shadedTrapezoid(CLOAK, 32, 46, 64, 12, 28);
  painter.line(LEATHER.base, 18, 46, 44, 64, 3);
  painter.rect('#d9b878', 30, 54, 3, 3);
  paintNeckAndHead(painter, SKIN);
  paintFeatures(painter, { skin: SKIN, eye: '#4a8a4a', brow: BLOND.shade, lip: '#b8584a', mouth: 'smile' });
  painter.shadedEllipse(BLOND, HEAD_CENTER_X, 17, 11, 5);
  painter.rect(BLOND.base, 21, 18, 3, 8);
  painter.rect(BLOND.base, 40, 18, 3, 8);
  painter.rect(BLOND.shade, 28, 19, 8, 1);
  painter.shadedEllipse(CLOAK, HEAD_CENTER_X, 10, 15, 6);
  painter.shadedRect(CLOAK, 17, 12, 4, 26);
  painter.shadedRect(CLOAK, 43, 12, 4, 26);
  painter.line(BLOND.base, 23, 34, 21, 56, 3);
  painter.line(BLOND.shade, 24, 34, 22, 56);
  painter.rect('#b23a3a', 20, 52, 4, 2);
  painter.line('#b23a3a', 44, 12, 50, 3, 2);
  painter.line('#e86a5a', 45, 11, 50, 3);
}
