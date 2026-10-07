import { MATERIAL, darken, lighten, type HeroColors, type Hex } from '../heroPalette';
import { TABARD_BLUE, TABARD_BLUE_DARK } from '../paladinParts';
import type { SpritePainter } from '../spritePainter';

const CAPE_TOP = 17;
const CAPE_HEM = 54;
const TABARD_TOP = 19;
const TABARD_HEM = 47;
const TORSO_TOP = 17;
const TORSO_ROWS = 15;
const BELT_TOP = 32;
const LEG_TOP = 40;
const BOOT_TOP = 53;

// Fold columns repeat every five pixels and sway with the row, so the cape reads as hanging cloth. The right side is one tone darker (light from the top-left).
export function paintFlowingCape(painter: SpritePainter, colors: HeroColors, centerX: number): void {
  const deepFold = darken(TABARD_BLUE_DARK, 0.68);
  for (let row = CAPE_TOP; row <= CAPE_HEM; row++) {
    const flare = Math.round(((row - CAPE_TOP) / (CAPE_HEM - CAPE_TOP)) * 5);
    const left = centerX - 9 - flare;
    const right = centerX + 9 + flare;
    const sway = Math.round(Math.sin(row / 5));
    for (let x = left; x <= right; x++) {
      const phase = (((x - left + sway) % 5) + 5) % 5;
      const litSide = x <= centerX + 2;
      const foldTones: Hex[] = [deepFold, TABARD_BLUE_DARK, litSide ? TABARD_BLUE : TABARD_BLUE_DARK, TABARD_BLUE_DARK, deepFold];
      const tone = foldTones[phase] ?? TABARD_BLUE_DARK;
      painter.dot(x === right ? deepFold : x === left ? TABARD_BLUE : tone, x, row);
    }
  }
  painter.span(darken(colors.trim, 0.7), centerX - 14, centerX + 14, CAPE_HEM - 1);
  painter.span(colors.trim, centerX - 14, centerX + 14, CAPE_HEM);
  for (let x = centerX - 14; x <= centerX + 14; x += 3) painter.dot(darken(colors.trim, 0.7), x, CAPE_HEM);
}

export function paintGreavesAndBoots(painter: SpritePainter, colors: HeroColors, centerX: number): void {
  for (const side of [-1, 1] as const) {
    const left = side === -1 ? centerX - 5 : centerX + 1;
    painter.rect(colors.cloth, left, LEG_TOP, 5, BOOT_TOP - LEG_TOP);
    painter.rect(lighten(colors.cloth, 1.25), left, LEG_TOP + 4, 1, BOOT_TOP - LEG_TOP - 5);
    painter.rect(colors.clothShade, left + 4, LEG_TOP, 1, BOOT_TOP - LEG_TOP);
    painter.rect(colors.clothShade, left + 3, LEG_TOP + 4, 1, BOOT_TOP - LEG_TOP - 4);
    painter.span(colors.trim, left, left + 4, LEG_TOP);
    painter.span(lighten(colors.cloth, 1.2), left + 1, left + 3, LEG_TOP + 1);
    painter.span(darken(colors.trim, 0.7), left, left + 4, LEG_TOP + 3);
    painter.span(colors.trim, left, left + 4, 49);
    const bootLeft = side === -1 ? left - 2 : left;
    painter.rect(MATERIAL.leather, bootLeft, BOOT_TOP, 7, 4);
    painter.rect(MATERIAL.leatherLight, bootLeft + (side === -1 ? 2 : 0), BOOT_TOP, 3, 1);
    painter.span(MATERIAL.boot, bootLeft, bootLeft + 6, BOOT_TOP + 3);
    painter.span(colors.trim, left, left + 4, BOOT_TOP - 1);
  }
}

export function paintBreastplate(painter: SpritePainter, colors: HeroColors, centerX: number): void {
  for (let row = 0; row < TORSO_ROWS; row++) {
    const halfWidth = 8 - Math.floor((row * 3) / TORSO_ROWS);
    const y = TORSO_TOP + row;
    painter.span(colors.cloth, centerX - halfWidth, centerX + halfWidth, y);
    painter.span(lighten(colors.cloth, 1.3), centerX - halfWidth, centerX - halfWidth + 1, y);
    painter.span(colors.clothShade, centerX + halfWidth - 1, centerX + halfWidth, y);
  }
  painter.span(lighten(colors.cloth, 1.5), centerX - 7, centerX - 4, TORSO_TOP + 3);
  painter.span(colors.clothShade, centerX - 6, centerX - 4, TORSO_TOP + 9);
  painter.span(colors.clothShade, centerX + 4, centerX + 6, TORSO_TOP + 9);
  painter.span(colors.trim, centerX - 4, centerX + 4, TORSO_TOP);
  painter.span(darken(colors.trim, 0.7), centerX - 3, centerX + 3, TORSO_TOP + 1);
  painter.dot(lighten(colors.trim, 1.5), centerX - 3, TORSO_TOP);
}

export function paintCrossTabard(painter: SpritePainter, colors: HeroColors, centerX: number): void {
  const trimShade = darken(colors.trim, 0.7);
  for (let row = TABARD_TOP; row <= TABARD_HEM; row++) {
    const halfWidth = 3 + Math.floor((row - TABARD_TOP) / 10);
    for (let dx = -halfWidth; dx <= halfWidth; dx++) {
      const inNotch = row > TABARD_HEM - 2 && Math.abs(dx) <= 1;
      if (inNotch) continue;
      const isEdge = Math.abs(dx) === halfWidth;
      const tone = dx <= 1 ? TABARD_BLUE : TABARD_BLUE_DARK;
      painter.dot(isEdge ? (dx < 0 ? colors.trim : trimShade) : dx === 2 ? darken(TABARD_BLUE_DARK, 0.85) : tone, centerX + dx, row);
    }
  }
  painter.rect(colors.trim, centerX, TABARD_TOP + 2, 1, 8);
  painter.rect(colors.trim, centerX - 2, TABARD_TOP + 4, 5, 1);
  painter.dot(lighten(colors.trim, 1.6), centerX, TABARD_TOP + 2);
  painter.dot(trimShade, centerX, TABARD_TOP + 9);
  painter.dot(trimShade, centerX + 2, TABARD_TOP + 4);
  painter.span(colors.trim, centerX - 4, centerX + 4, TABARD_HEM - 3);
  for (let x = centerX - 4; x <= centerX + 4; x++) painter.dot(x % 2 === 0 ? trimShade : colors.trim, x, TABARD_HEM - 2);
}

export function paintBeltAndTassets(painter: SpritePainter, colors: HeroColors, centerX: number): void {
  for (const side of [-1, 1] as const) {
    const left = side === -1 ? centerX - 8 : centerX + 5;
    painter.rect(colors.cloth, left, BELT_TOP + 2, 4, 6);
    painter.rect(lighten(colors.cloth, 1.3), left, BELT_TOP + 2, 1, 5);
    painter.rect(colors.clothShade, left + 3, BELT_TOP + 2, 1, 6);
    painter.span(colors.trim, left, left + 3, BELT_TOP + 7);
    painter.dot(colors.trim, left + 1, BELT_TOP + 4);
  }
  painter.span(MATERIAL.leather, centerX - 7, centerX + 7, BELT_TOP);
  painter.span(MATERIAL.boot, centerX - 7, centerX + 7, BELT_TOP + 1);
  painter.rect(colors.trim, centerX - 2, BELT_TOP - 1, 5, 4);
  painter.rect(darken(colors.trim, 0.7), centerX - 1, BELT_TOP, 3, 2);
  painter.dot(lighten(colors.trim, 1.6), centerX - 2, BELT_TOP - 1);
}
