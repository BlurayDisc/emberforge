import { darken, lighten, MATERIAL, type Hex, type HeroColors } from './heroPalette';
import type { SpritePainter } from './spritePainter';

export interface ThiefTones {
  deep: Hex;
  shade: Hex;
  base: Hex;
  light: Hex;
  rim: Hex;
  leatherDark: Hex;
  leather: Hex;
  leatherLight: Hex;
  trimDeep: Hex;
  trim: Hex;
  trimLight: Hex;
  steelDark: Hex;
  steel: Hex;
  steelLight: Hex;
}

// Navy and charcoal cloth with brown-black leather. Each ramp has a lighter edge tone so straps and folds read against the dark body.
export function thiefTones(colors: HeroColors): ThiefTones {
  return {
    deep: colors.clothDeep,
    shade: colors.clothShade,
    base: colors.cloth,
    light: lighten(colors.cloth, 1.5),
    rim: lighten(colors.cloth, 1.9),
    leatherDark: darken(MATERIAL.boot, 0.7),
    leather: MATERIAL.boot,
    leatherLight: lighten(MATERIAL.leather, 1.35),
    trimDeep: darken(colors.trim, 0.45),
    trim: colors.trim,
    trimLight: lighten(colors.trim, 1.5),
    steelDark: '#4d6270',
    steel: '#93aab8',
    steelLight: '#eaf6fa',
  };
}

export interface LimbShape {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  thickness: number;
}

// Light comes from the top left: the left edge gets the light tone and the right edge the shade tone.
export function paintLitLimb(painter: SpritePainter, limb: LimbShape, base: Hex, light: Hex, shade: Hex): void {
  const { fromX, fromY, toX, toY, thickness } = limb;
  painter.line(base, fromX, fromY, toX, toY, thickness);
  painter.line(light, fromX, fromY, toX, toY, 1);
  painter.line(shade, fromX + thickness - 1, fromY + 1, toX + thickness - 1, toY + 1, 1);
}

export interface BladeShape {
  hiltX: number;
  hiltY: number;
  bendX: number;
  bendY: number;
  tipX: number;
  tipY: number;
  scale: number;
}

const BLADE_STEPS = 16;
const BLADE_FIRST_STEP = 3;

function bladePoints(blade: BladeShape): { x: number; y: number }[] {
  return Array.from({ length: BLADE_STEPS + 1 }, (_, step) => {
    const t = step / BLADE_STEPS;
    const mix = (hilt: number, bend: number, tip: number): number => Math.round((1 - t) * (1 - t) * hilt + 2 * (1 - t) * t * bend + t * t * tip);
    return { x: mix(blade.hiltX, blade.bendX, blade.tipX), y: mix(blade.hiltY, blade.bendY, blade.tipY) };
  });
}

// A curved blade on a quadratic curve: wide belly, thin tip, pale rim on the lit edge and a green glint on the far edge.
export function paintCurvedBlade(painter: SpritePainter, tones: ThiefTones, blade: BladeShape): void {
  const points = bladePoints(blade);
  const wideBlade = blade.scale > 1;
  const widthAt = (step: number): number => (step > 14 ? 1 : step > 11 ? 2 : wideBlade ? 3 : 2);
  points.slice(0, BLADE_FIRST_STEP).forEach(({ x, y }, step) => painter.rect(step === 2 ? tones.trim : tones.leather, x, y, wideBlade ? 2 : 1, wideBlade ? 2 : 1));
  const guard = points[BLADE_FIRST_STEP - 1];
  if (guard) painter.rect(tones.leatherLight, guard.x - 1, guard.y, wideBlade ? 4 : 3, 1);
  const edge = points.slice(BLADE_FIRST_STEP);
  edge.forEach(({ x, y }, index) => {
    const width = widthAt(index + BLADE_FIRST_STEP);
    painter.rect(tones.steel, x, y, width, width);
  });
  edge.forEach(({ x, y }, index) => {
    const width = widthAt(index + BLADE_FIRST_STEP);
    painter.dot(tones.steelLight, x, y);
    if (width > 1) painter.dot(tones.steelDark, x + width - 1, y + width - 1);
    if (width > 2 && index % 3 === 1) painter.dot(tones.trim, x + width - 1, y + width - 1);
  });
}
