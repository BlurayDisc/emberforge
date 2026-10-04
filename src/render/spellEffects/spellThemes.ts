import { PALETTE } from '../palette';

export interface SpellThemeColors {
  main: string;
  light: string;
  dark: string;
}

// A theme gives every effect of a spell the same three colours, so a spell reads as one thing from cast to impact.
export const SPELL_THEMES: Readonly<Record<string, SpellThemeColors>> = {
  steel: { main: PALETTE.steel, light: PALETTE.snow, dark: PALETTE.steelDark },
  nature: { main: PALETTE.goblin, light: PALETTE.natureLight, dark: PALETTE.forest },
  fire: { main: PALETTE.flame, light: PALETTE.flameBright, dark: PALETTE.rage },
  ice: { main: PALETTE.iceMain, light: PALETTE.iceLight, dark: PALETTE.water },
  arcane: { main: PALETTE.violet, light: PALETTE.arcaneLight, dark: PALETTE.royalPurpleDark },
  holy: { main: PALETTE.gold, light: PALETTE.sunGlow, dark: PALETTE.stamina },
  shadow: { main: PALETTE.shadowMain, light: PALETTE.shadowLight, dark: PALETTE.night },
  rage: { main: PALETTE.blood, light: PALETTE.flame, dark: PALETTE.brickDark },
  ki: { main: PALETTE.kiMain, light: PALETTE.kiLight, dark: PALETTE.forest },
  guard: { main: PALETTE.waterLight, light: PALETTE.snow, dark: PALETTE.glassBlue },
};
