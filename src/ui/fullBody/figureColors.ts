import type { HeroAppearance } from '../../content/heroAppearance';

export type Paint = (color: string, x: number, y: number, width: number, height: number) => void;
export type Erase = (x: number, y: number, width: number, height: number) => void;
export type GearDrawer = (paint: Paint, appearance: HeroAppearance, erase: Erase) => void;

export const FIGURE_WIDTH = 40;
export const FIGURE_HEIGHT = 64;

export const INK = '#17110d';
export const WOOD = '#8a6340';
export const LEATHER = '#3a2a1e';
export const STEEL = '#c0c8d0';
export const STEEL_DARK = '#6f7a8c';
export const GOLD = '#f2c14e';
export const RED = '#b23a3a';
export const RED_DARK = '#8a2a2a';
export const WHITE = '#ffffff';
export const BONE = '#d8d4cc';
export const ICE = '#8ad8f4';
export const ICE_DARK = '#3a7fc0';
export const MOUTH_DARK = '#5a1a1a';
