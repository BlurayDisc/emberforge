import type { FigureColors, FigureDrawer, Painter } from './castleFigureTypes';

function drawArms(paint: Painter, colors: FigureColors, armLeft: number, armRight: number, armWidth: number): void {
  paint(colors.cloth, armLeft, 18, armWidth, 14);
  paint(colors.cloth, armRight, 18, armWidth, 14);
  paint(colors.clothShade, armLeft, 18, 1, 14);
  paint(colors.clothShade, armRight + armWidth - 1, 18, 1, 14);
  paint(colors.trim, armLeft, 30, armWidth, 1);
  paint(colors.trim, armRight, 30, armWidth, 1);
  paint(colors.skin, armLeft, 31, armWidth, 3);
  paint(colors.skin, armRight, 31, armWidth, 3);
}

function drawLegsAndBoots(paint: Painter, colors: FigureColors): void {
  paint(colors.legs, 9, 36, 4, 10);
  paint(colors.legs, 15, 36, 4, 10);
  paint(colors.boots, 8, 45, 6, 4);
  paint(colors.boots, 14, 45, 6, 4);
  paint('leatherDark', 8, 48, 6, 1);
  paint('leatherDark', 14, 48, 6, 1);
}

function drawLongSkirt(paint: Painter, colors: FigureColors, topY: number, flareStartY: number, maximumFlare: number): void {
  for (let y = topY; y <= 46; y++) {
    const flare = Math.min(maximumFlare, Math.max(0, Math.floor((y - flareStartY) * 0.5)));
    paint(colors.cloth, 7 - flare, y, 14 + flare * 2, 1);
    paint(colors.clothShade, 19 + flare, y, 2, 1);
  }
  paint(colors.trim, 7 - maximumFlare, 44, 14 + maximumFlare * 2, 2);
  paint('leatherDark', 9, 46, 4, 3);
  paint('leatherDark', 15, 46, 4, 3);
}

const tunic: FigureDrawer = (paint, colors) => {
  drawLegsAndBoots(paint, colors);
  paint(colors.cloth, 7, 17, 14, 19);
  paint(colors.clothShade, 19, 17, 2, 19);
  paint(colors.clothShade, 7, 33, 14, 3);
  paint(colors.trim, 11, 17, 6, 2);
  paint('leatherDark', 7, 28, 14, 2);
  paint('gold', 13, 28, 2, 2);
  drawArms(paint, colors, 4, 21, 3);
};

const robe: FigureDrawer = (paint, colors) => {
  drawLongSkirt(paint, colors, 17, 34, 2);
  paint(colors.clothShade, 11, 32, 1, 14);
  paint(colors.clothShade, 16, 34, 1, 12);
  paint(colors.trim, 11, 17, 6, 2);
  paint(colors.trim, 13, 19, 2, 25);
  drawArms(paint, colors, 3, 21, 4);
};

const gown: FigureDrawer = (paint, colors) => {
  drawLongSkirt(paint, colors, 17, 28, 6);
  paint(colors.cloth, 8, 17, 12, 12);
  paint(colors.clothShade, 18, 17, 2, 12);
  paint(colors.trim, 8, 28, 12, 2);
  paint(colors.trim, 11, 17, 6, 1);
  paint(colors.clothShade, 10, 34, 1, 12);
  paint(colors.clothShade, 17, 34, 1, 12);
  drawArms(paint, colors, 5, 20, 3);
};

const plate: FigureDrawer = (paint, colors) => {
  paint('steelDark', 9, 36, 4, 10);
  paint('steelDark', 15, 36, 4, 10);
  paint('steel', 9, 38, 4, 2);
  paint('steel', 15, 38, 4, 2);
  paint('steelDark', 8, 45, 6, 4);
  paint('steelDark', 14, 45, 6, 4);
  paint('steel', 7, 17, 14, 19);
  paint('snow', 8, 18, 2, 10);
  paint('steelDark', 18, 17, 3, 19);
  paint('steel', 4, 21, 3, 10);
  paint('steel', 21, 21, 3, 10);
  paint('steelDark', 4, 29, 3, 5);
  paint('steelDark', 21, 29, 3, 5);
  paint(colors.accent, 10, 19, 8, 21);
  paint(colors.trim, 10, 19, 1, 21);
  paint(colors.trim, 17, 19, 1, 21);
  paint(colors.trim, 10, 39, 8, 1);
  paint(colors.trim, 13, 24, 2, 5);
  paint(colors.trim, 11, 26, 6, 1);
  paint('leatherDark', 7, 31, 14, 2);
  paint('gold', 13, 31, 2, 2);
  paint('steel', 3, 15, 7, 5);
  paint('steel', 18, 15, 7, 5);
  paint('snow', 4, 15, 4, 1);
  paint('snow', 19, 15, 4, 1);
  paint('steelDark', 3, 19, 7, 1);
  paint('steelDark', 18, 19, 7, 1);
};

export const BODY_DRAWERS = { tunic, robe, gown, plate };
export type BodyStyle = keyof typeof BODY_DRAWERS;
