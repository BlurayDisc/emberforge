import { darken, lighten, type HeroColors, type Hex } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';
import { litByFire } from './mageFireLight';

export const FIGURE_CENTER_X = 18;
export const STAFF_X = 5;
export const FIREBALL_CENTER = { x: 33, y: 8 } as const;

const WOOD: Hex = '#8a6340';
const WOOD_LIGHT: Hex = '#b08458';
const WOOD_DARK: Hex = '#5e4128';
const FLAME_DEEP: Hex = '#a02a1a';
const FLAME_MID: Hex = '#e8501e';
const FLAME_BRIGHT: Hex = '#ff9a2a';
const FLAME_HOT: Hex = '#ffd860';
const FLAME_CORE: Hex = '#fff6c0';
const SPARKS = [[26, 3, '#ffd070'], [39, 5, '#ffb040'], [37, 0, '#fff0a0'], [27, 9, '#ff9a2a'], [38, 13, '#ffd070'], [30, 0, '#ff9a2a'], [35, 14, '#ffb040']] as const;

export function paintStaff(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(WOOD, STAFF_X, 8, 2, 49);
  painter.rect(WOOD_LIGHT, STAFF_X, 8, 1, 49);
  painter.rect(WOOD_DARK, STAFF_X + 1, 8, 1, 49);
  for (const y of [14, 36, 47]) painter.rect(colors.trim, STAFF_X - 1, y, 4, 1);
  painter.dot(darken(colors.trim, 0.7), STAFF_X + 2, 14);
  painter.grid(
    ['..o..', '.oOo.', '.oOo.', '.GBG.', 'GBwBG', 'GBBbG', '.GBG.', '..G..'],
    { G: colors.trim, g: darken(colors.trim, 0.7), B: FLAME_BRIGHT, b: FLAME_MID, w: FLAME_CORE, o: FLAME_MID, O: FLAME_HOT },
    STAFF_X - 2,
    0,
  );
  painter.dot(darken(colors.trim, 0.7), STAFF_X + 2, 5);
  painter.dot(darken(colors.trim, 0.7), STAFF_X + 2, 6);
}

export function paintStaffArm(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.clothDeep, 12, 16, 10, 22, 4);
  painter.line(colors.clothShade, 13, 16, 10, 22, 3);
  painter.line(colors.cloth, 13, 16, 10, 21);
  painter.line(colors.clothLight, 13, 15, 11, 20);
  painter.line(colors.clothShade, 10, 22, 7, 24, 3);
  painter.rect(colors.trim, 8, 24, 1, 3);
  painter.rect(colors.skin, 4, 25, 4, 3);
  painter.rect(colors.skinShade, 4, 27, 4, 1);
  painter.dot(lighten(colors.skin, 1.2), 4, 25);
  painter.rect(colors.skinShade, 7, 25, 1, 3);
}

export function paintCastingArm(painter: SpritePainter, colors: HeroColors): void {
  painter.line(colors.clothDeep, 23, 16, 27, 23, 4);
  painter.line(colors.cloth, 23, 16, 27, 23, 3);
  painter.line(colors.clothLight, 23, 16, 26, 22);
  painter.line(litByFire(colors.clothShade, 0.45), 26, 17, 29, 23);
  painter.rect(colors.trim, 26, 24, 4, 1);
  painter.line(colors.skin, 28, 23, 31, 18, 2);
  painter.line(litByFire(colors.skin, 0.4), 29, 22, 32, 18);
  painter.rect(colors.trim, 29, 20, 3, 1);
  painter.rect(colors.skin, 30, 15, 5, 3);
  painter.rect(litByFire(colors.skin, 0.5), 33, 15, 2, 3);
  painter.rect(colors.skinShade, 30, 17, 4, 1);
  for (const x of [30, 32, 34]) painter.dot(litByFire(colors.skin, 0.55), x, 14);
  painter.dot(colors.skin, 36, 16);
  painter.dot(litByFire(colors.skin, 0.55), 36, 15);
}

export function paintFireball(painter: SpritePainter): void {
  const { x: centerX, y: centerY } = FIREBALL_CENTER;
  const rings: readonly (readonly [number, Hex])[] = [[6, '#5a1a1a'], [5, FLAME_DEEP], [4, FLAME_MID], [3, FLAME_BRIGHT], [2, FLAME_HOT], [1, FLAME_CORE]];
  for (const [radius, color] of rings) {
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const squared = x * x + y * y;
        if (squared > radius * radius + 1) continue;
        const isGlowRing = radius >= 5;
        if (isGlowRing && (x + y + radius) % 2 !== 0) continue;
        painter.dot(color, centerX + x, centerY + y);
      }
    }
  }
  painter.dot(FLAME_BRIGHT, centerX - 1, centerY - 5);
  painter.dot(FLAME_MID, centerX + 1, centerY - 6);
  painter.dot(FLAME_HOT, centerX, centerY - 5);
  painter.dot(FLAME_DEEP, centerX + 2, centerY - 5);
  painter.dot(FLAME_MID, centerX + 4, centerY + 3);
  for (const [x, y, color] of SPARKS) painter.dot(color, x, y);
}
