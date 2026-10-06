import type { HeroAppearance } from '../content/heroAppearance';

export type Hex = `#${string}`;

function adjustBrightness(color: string, factor: number): Hex {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(color.slice(start, start + 2), 16);
    return Math.max(0, Math.min(255, Math.round(factor >= 1 ? value + (255 - value) * (factor - 1) : value * factor)));
  });
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

export const darken = (color: string, amount = 0.72): Hex => adjustBrightness(color, amount);
export const lighten = (color: string, amount = 1.45): Hex => adjustBrightness(color, amount);

export const OUTLINE: Hex = '#1b1626';

export const MATERIAL = {
  gold: '#f2c14e',
  goldDark: '#b88a2a',
  red: '#b23a3a',
  redDark: '#7a2424',
  boot: '#3a2a1e',
  leather: '#5a3a24',
  leatherLight: '#7a5232',
  wood: '#8a6340',
  woodDark: '#5e4128',
  white: '#f4f4f4',
  mouth: '#8a3a3a',
  lipstick: '#c8505a',
  eyeliner: '#2a1a14',
  blush: '#f0b8a8',
} as const satisfies Record<string, Hex>;

export interface HeroColors {
  appearance: HeroAppearance;
  skin: Hex;
  skinShade: Hex;
  hair: Hex;
  hairShade: Hex;
  eye: Hex;
  cloth: Hex;
  clothShade: Hex;
  clothDeep: Hex;
  clothLight: Hex;
  trim: Hex;
}

export function heroColorsOf(appearance: HeroAppearance): HeroColors {
  const { look } = appearance;
  return {
    appearance,
    skin: appearance.skin as Hex,
    skinShade: appearance.skinShade as Hex,
    hair: appearance.hair as Hex,
    hairShade: darken(appearance.hair),
    eye: appearance.eye as Hex,
    cloth: look.cloth as Hex,
    clothShade: look.clothShade as Hex,
    clothDeep: darken(look.clothShade, 0.7),
    clothLight: lighten(look.cloth),
    trim: look.trim as Hex,
  };
}
