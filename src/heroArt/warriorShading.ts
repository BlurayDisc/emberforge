import { MATERIAL, darken, lighten, type Hex, type HeroColors } from './heroPalette';
import type { SpritePainter } from './spritePainter';

export interface ToneRamp {
  rim: Hex;
  light: Hex;
  base: Hex;
  shade: Hex;
  deep: Hex;
}

// One row of a form: y, first x, last x.
export type FormRow = readonly [number, number, number];

export function steelRampOf(colors: HeroColors): ToneRamp {
  // Darker than the raw cloth color, so the plate keeps contrast against the white highlights.
  return { rim: lighten(colors.cloth, 1.55), light: colors.cloth, base: colors.clothShade, shade: darken(colors.clothShade, 0.8), deep: colors.clothDeep };
}

export function goldRampOf(colors: HeroColors): ToneRamp {
  return { rim: MATERIAL.white, light: lighten(colors.trim, 1.3), base: colors.trim, shade: MATERIAL.goldDark, deep: darken(MATERIAL.goldDark, 0.7) };
}

export function tabardRamp(): ToneRamp {
  return { rim: lighten(MATERIAL.red, 1.45), light: lighten(MATERIAL.red, 1.18), base: MATERIAL.red, shade: MATERIAL.redDark, deep: darken(MATERIAL.redDark, 0.68) };
}

export function interpolatedRows(fromY: number, fromLeft: number, fromRight: number, toY: number, toLeft: number, toRight: number): FormRow[] {
  const rows: FormRow[] = [];
  for (let y = fromY; y <= toY; y++) {
    const progress = toY === fromY ? 0 : (y - fromY) / (toY - fromY);
    rows.push([y, Math.round(fromLeft + (toLeft - fromLeft) * progress), Math.round(fromRight + (toRight - fromRight) * progress)]);
  }
  return rows;
}

// Light comes from the top left, so every row is lit on its left side and dark on its right side. A positive bias pushes a form into shadow.
export function paintShadedRows(painter: SpritePainter, ramp: ToneRamp, rows: readonly FormRow[], bias = 0): void {
  for (const [y, left, right] of rows) {
    const width = right - left + 1;
    for (let x = left; x <= right; x++) {
      const position = (x - left) / width + bias;
      let tone = ramp.deep;
      if (x === left && width >= 4 && bias <= 0.1) tone = ramp.rim;
      else if (position < 0.3) tone = ramp.light;
      else if (position < 0.6) tone = ramp.base;
      else if (position < 0.86) tone = ramp.shade;
      painter.dot(tone, x, y);
    }
  }
}
