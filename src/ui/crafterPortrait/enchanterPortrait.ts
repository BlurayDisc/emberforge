import { HEAD_CENTER_X, paintFeatures, paintNeckAndHead } from './faceParts';
import type { PortraitPainter, Swatch } from './portraitPainter';

const SKIN: Swatch = { base: '#e8c4a0', shade: '#b8906c', light: '#f6dcc0' };
const ROBE: Swatch = { base: '#5a3a9a', shade: '#3a2470', light: '#7a5ac0' };
const SILVER_HAIR: Swatch = { base: '#dcdce8', shade: '#9a9ab0', light: '#ffffff' };
const GOLD = '#f2c14e';
const GOLD_SHADE = '#b88a2a';
const ARCANE = '#5ad0f0';
const ARCANE_LIGHT = '#d8f6ff';
const STAFF_WOOD: Swatch = { base: '#6a4a30', shade: '#4a3322', light: '#8a6a4a' };

export function paintArcaneBackground(painter: PortraitPainter): void {
  painter.rect('#1c1438', 0, 0, 64, 64);
  painter.ellipse('#2a1e52', 32, 30, 30, 30);
  painter.ellipse('#3a2a70', 32, 28, 20, 20);
  painter.ring('#7a5ac0', 32, 29, 26);
  painter.ring('#5a3a9a', 32, 29, 23);
  [[8, 12], [54, 8], [10, 44], [58, 30], [48, 56], [16, 6], [40, 4]].forEach(([x, y]) => {
    painter.rect(ARCANE_LIGHT, x ?? 0, y ?? 0, 1, 1);
    painter.rect(ARCANE, (x ?? 0) - 1, y ?? 0, 3, 1);
    painter.rect(ARCANE, x ?? 0, (y ?? 0) - 1, 1, 3);
  });
}

export function paintEnchanter(painter: PortraitPainter): void {
  painter.shadedRect(STAFF_WOOD, 8, 18, 3, 46);
  painter.shadedEllipse({ base: ARCANE, shade: '#2a98c0', light: ARCANE_LIGHT }, 9, 14, 4, 5);
  painter.ellipse(ROBE.shade, HEAD_CENTER_X, 26, 16, 18);
  painter.shadedTrapezoid(ROBE, 32, 46, 64, 12, 29);
  painter.shadedRect({ base: GOLD, shade: GOLD_SHADE, light: '#ffe08a' }, 29, 48, 6, 16);
  painter.rect(ROBE.shade, 31, 50, 2, 3);
  painter.rect(ARCANE, 31, 56, 2, 2);
  painter.line(GOLD, 20, 48, 26, 62);
  painter.line(GOLD, 44, 48, 38, 62);
  paintNeckAndHead(painter, SKIN);
  painter.rect(ROBE.base, 26, 44, 12, 4);
  paintFeatures(painter, { skin: SKIN, eye: ARCANE, brow: SILVER_HAIR.shade, lip: '#a8584a', mouth: 'flat', browDrop: 1 });
  painter.dot(ARCANE_LIGHT, 27, 27);
  painter.dot(ARCANE_LIGHT, 35, 27);
  painter.shadedEllipse(SILVER_HAIR, HEAD_CENTER_X, 16, 12, 6);
  painter.rect(SILVER_HAIR.base, 20, 18, 4, 18);
  painter.rect(SILVER_HAIR.base, 40, 18, 4, 18);
  painter.rect(SILVER_HAIR.shade, 22, 30, 2, 6);
  painter.rect(SILVER_HAIR.shade, 40, 30, 2, 6);
  painter.rect(SILVER_HAIR.base, 30, 38, 4, 3);
  painter.rect(GOLD, 22, 17, 20, 1);
  painter.rect(ARCANE, 31, 15, 2, 3);
  painter.shadedEllipse(ROBE, HEAD_CENTER_X, 9, 15, 5);
  painter.shadedEllipse({ base: ARCANE, shade: '#2a98c0', light: ARCANE_LIGHT }, 52, 44, 5, 5);
  painter.ring('#2a98c0', 52, 44, 7);
  painter.dot(ARCANE_LIGHT, 57, 36);
  painter.dot(ARCANE_LIGHT, 46, 38);
}
