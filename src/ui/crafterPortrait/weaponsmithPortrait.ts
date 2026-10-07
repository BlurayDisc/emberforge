import { HEAD_CENTER_X, INK, paintFeatures, paintMouthInBeard, paintNeckAndHead } from './faceParts';
import type { PortraitPainter, Swatch } from './portraitPainter';

const SKIN: Swatch = { base: '#d8997a', shade: '#b0705a', light: '#ecb898' };
const TUNIC: Swatch = { base: '#7a6a58', shade: '#54483c', light: '#968470' };
const APRON: Swatch = { base: '#5a3a24', shade: '#3c2515', light: '#7a5434' };
const HAIR: Swatch = { base: '#241a14', shade: '#14100c', light: '#3e2e22' };
const HEADBAND: Swatch = { base: '#a8322c', shade: '#781f1c', light: '#cc4e44' };
const STEEL: Swatch = { base: '#aab2bc', shade: '#6f7885', light: '#e0e6ec' };

export function paintForgeBackground(painter: PortraitPainter): void {
  painter.rect('#3a1812', 0, 0, 64, 64);
  painter.ellipse('#5a2316', 32, 30, 30, 30);
  painter.ellipse('#80331a', 32, 30, 22, 22);
  painter.ellipse('#a8431f', 32, 28, 15, 15);
  painter.checker('#5a2316', 0, 0, 64, 64);
  painter.rect('#2a100c', 0, 56, 64, 8);
  [[8, 14], [54, 10], [12, 40], [57, 34], [48, 52], [6, 26]].forEach(([x, y]) => painter.dot('#ffb040', x ?? 0, y ?? 0));
  [[10, 18], [52, 14], [14, 44]].forEach(([x, y]) => painter.dot('#ffe08a', x ?? 0, y ?? 0));
}

export function paintWeaponsmith(painter: PortraitPainter): void {
  painter.shadedRect({ base: '#8a6340', shade: '#5e4128', light: '#a87c52' }, 50, 44, 3, 20);
  painter.shadedTrapezoid(TUNIC, 32, 46, 64, 12, 29);
  painter.shadedTrapezoid(APRON, 32, 50, 64, 8, 17);
  painter.line(APRON.shade, 22, 46, 26, 54, 2);
  painter.line(APRON.shade, 42, 46, 38, 54, 2);
  painter.rect(STEEL.base, 30, 58, 4, 2);
  paintNeckAndHead(painter, SKIN);
  painter.shadedEllipse(HAIR, HEAD_CENTER_X, 17, 11, 5);
  painter.rect(HAIR.base, 21, 20, 3, 8);
  painter.rect(HAIR.base, 40, 20, 3, 8);
  painter.shadedRect(HEADBAND, 21, 20, 22, 3);
  painter.rect(HEADBAND.shade, 41, 23, 5, 2);
  painter.rect(HEADBAND.base, 43, 25, 2, 4);
  paintFeatures(painter, { skin: SKIN, eye: '#4a3020', brow: HAIR.base, lip: '#8a3a3a', mouth: 'none', browDrop: 1 });
  painter.shadedEllipse(HAIR, HEAD_CENTER_X, 37, 11, 8);
  painter.rect(SKIN.base, 24, 31, 3, 3);
  painter.rect(SKIN.base, 37, 31, 3, 3);
  painter.rect(HAIR.base, 24, 33, 16, 3);
  paintMouthInBeard(painter, '#8a3a3a');
  painter.shadedRect(STEEL, 44, 33, 14, 9);
  painter.rect(STEEL.shade, 44, 40, 14, 2);
  painter.rect(INK, 44, 37, 1, 1);
  painter.dot('#ffffff', 46, 34);
  painter.dot('#ffe08a', 59, 31);
  painter.dot('#ffb040', 60, 36);
}
