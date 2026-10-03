import type { PaletteColor } from './palette';

export const FIGURE_WIDTH = 28;
export const FIGURE_HEADROOM = 7;
export const FIGURE_HEIGHT = 49 + FIGURE_HEADROOM;

// Every figure drawer works in a frame where the feet end at y = 48 and hats may reach up to y = -6.
export type Painter = (color: PaletteColor, x: number, y: number, width: number, height: number) => void;

export interface FigureColors {
  skin: PaletteColor;
  skinShade: PaletteColor;
  hair: PaletteColor;
  cloth: PaletteColor;
  clothShade: PaletteColor;
  trim: PaletteColor;
  // The second colour of a figure: tabard, plume, cape lining.
  accent: PaletteColor;
  legs: PaletteColor;
  boots: PaletteColor;
}

export type FigureDrawer = (paint: Painter, colors: FigureColors) => void;
