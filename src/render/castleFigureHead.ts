import type { FigureColors, Painter } from './castleFigureTypes';

export type HairStyle = 'none' | 'short' | 'long' | 'sides' | 'braid';
export type BeardStyle = 'none' | 'short' | 'long' | 'moustache';

// Long hair falls behind the shoulders, so it is drawn before the body.
export function drawHairBehindBody(paint: Painter, colors: FigureColors, style: HairStyle): void {
  if (style === 'long') {
    paint(colors.hair, 7, 6, 14, 24);
    paint('hairBrown', 7, 26, 3, 4);
  }
  if (style === 'braid') {
    paint(colors.hair, 17, 14, 4, 22);
    paint('leatherDark', 17, 35, 4, 2);
  }
}

export function drawFace(paint: Painter, colors: FigureColors): void {
  paint(colors.skinShade, 12, 15, 4, 3);
  paint(colors.skin, 10, 6, 8, 1);
  paint(colors.skin, 9, 7, 10, 8);
  paint(colors.skin, 10, 15, 8, 1);
  paint(colors.skin, 8, 10, 1, 3);
  paint(colors.skin, 19, 10, 1, 3);
  paint(colors.skinShade, 18, 8, 1, 7);
  paint(colors.skinShade, 10, 15, 8, 1);
  paint('cloud', 11, 10, 2, 2);
  paint('cloud', 16, 10, 2, 2);
  paint('void', 12, 10, 1, 2);
  paint('void', 17, 10, 1, 2);
  paint(colors.hair, 11, 9, 3, 1);
  paint(colors.hair, 15, 9, 3, 1);
  paint(colors.skinShade, 14, 12, 1, 2);
  paint('brickDark', 13, 14, 3, 1);
}

export function drawHair(paint: Painter, colors: FigureColors, style: HairStyle): void {
  if (style === 'none') return;
  if (style === 'sides') {
    paint(colors.hair, 8, 7, 2, 6);
    paint(colors.hair, 18, 7, 2, 6);
    return;
  }
  paint(colors.hair, 9, 4, 10, 3);
  paint(colors.hair, 8, 6, 2, 6);
  paint(colors.hair, 18, 6, 2, 6);
  paint(colors.hair, 10, 7, 3, 1);
}

export function drawBeard(paint: Painter, colors: FigureColors, style: BeardStyle): void {
  if (style === 'moustache') {
    paint(colors.hair, 11, 13, 3, 1);
    paint(colors.hair, 15, 13, 3, 1);
    paint(colors.hair, 10, 12, 1, 1);
    paint(colors.hair, 18, 12, 1, 1);
  }
  if (style === 'short' || style === 'long') {
    paint(colors.hair, 10, 13, 8, 3);
    paint(colors.hair, 9, 11, 1, 4);
    paint(colors.hair, 18, 11, 1, 4);
    paint('brickDark', 13, 14, 3, 1);
  }
  if (style === 'long') {
    paint(colors.hair, 9, 16, 10, 4);
    paint(colors.hair, 10, 20, 8, 4);
    paint(colors.hair, 11, 24, 6, 2);
    paint(colors.hair, 11, 26, 2, 2);
    paint(colors.hair, 15, 26, 2, 2);
  }
}
