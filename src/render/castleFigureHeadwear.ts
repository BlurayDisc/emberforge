import type { FigureDrawer } from './castleFigureTypes';

const crown: FigureDrawer = (paint) => {
  paint('carpetDark', 9, 3, 10, 3);
  paint('gold', 9, 4, 10, 3);
  paint('gold', 9, 2, 2, 2);
  paint('gold', 13, 1, 2, 3);
  paint('gold', 17, 2, 2, 2);
  paint('flameBright', 9, 4, 10, 1);
  paint('blood', 13, 5, 2, 1);
  paint('glassBlue', 10, 5, 1, 1);
  paint('glassGreen', 17, 5, 1, 1);
};

const veilAndTiara: FigureDrawer = (paint) => {
  paint('royalPurpleDark', 8, 3, 12, 5);
  paint('royalPurpleDark', 6, 8, 3, 22);
  paint('royalPurpleDark', 19, 8, 3, 22);
  paint('shadow', 6, 20, 1, 10);
  paint('shadow', 21, 20, 1, 10);
  paint('steel', 10, 3, 8, 2);
  paint('steel', 11, 2, 1, 1);
  paint('steel', 16, 2, 1, 1);
  paint('glassBlue', 13, 3, 2, 2);
};

const mitre: FigureDrawer = (paint) => {
  for (let row = 0; row < 9; row++) {
    const width = Math.min(10, 2 + row);
    paint('robeWhite', 14 - width / 2, -3 + row, width, 1);
    paint('robeWhiteShade', 14 + width / 2 - 1, -3 + row, 1, 1);
  }
  paint('gold', 9, 5, 10, 2);
  paint('gold', 13, -1, 2, 6);
  paint('gold', 11, 1, 6, 1);
  paint('robeWhiteShade', 19, 6, 2, 7);
  paint('gold', 19, 11, 2, 2);
};

const plumedHelm: FigureDrawer = (paint, colors) => {
  paint('steel', 10, 1, 8, 1);
  paint('steel', 8, 2, 12, 6);
  paint('snow', 9, 2, 3, 1);
  paint('steelDark', 8, 7, 12, 1);
  paint('steelDark', 13, 8, 2, 5);
  paint('steelDark', 8, 8, 2, 6);
  paint('steelDark', 18, 8, 2, 6);
  paint(colors.accent, 12, -4, 4, 2);
  paint(colors.accent, 10, -3, 3, 3);
  paint(colors.accent, 7, -1, 4, 3);
  paint(colors.accent, 6, 2, 2, 3);
};


const jesterHorns: FigureDrawer = (paint) => {
  paint('blood', 7, 0, 6, 6);
  paint('blood', 3, -3, 5, 4);
  paint('glassBlue', 16, 0, 6, 6);
  paint('glassBlue', 21, -3, 5, 4);
  paint('gold', 8, 5, 12, 2);
  paint('gold', 1, -6, 3, 3);
  paint('gold', 24, -6, 3, 3);
  paint('flameBright', 1, -6, 1, 1);
  paint('flameBright', 24, -6, 1, 1);
};

const flatCap: FigureDrawer = (paint, colors) => {
  paint(colors.accent, 8, 2, 12, 5);
  paint(colors.accent, 10, 1, 8, 1);
  paint('forest', 8, 6, 12, 1);
  paint('leatherDark', 7, 6, 14, 2);
};

const hood: FigureDrawer = (paint, colors) => {
  paint(colors.cloth, 8, 0, 12, 6);
  paint(colors.cloth, 7, 3, 2, 14);
  paint(colors.cloth, 19, 3, 2, 14);
  paint(colors.clothShade, 19, 3, 2, 14);
  paint(colors.cloth, 7, 15, 14, 3);
  paint(colors.clothShade, 9, 5, 10, 1);
};

const wideHat: FigureDrawer = (paint, colors) => {
  paint('leather', 5, 4, 18, 2);
  paint('leather', 9, 0, 10, 5);
  paint('leatherDark', 9, 4, 10, 1);
  paint(colors.accent, 18, -3, 1, 5);
  paint(colors.accent, 19, -5, 1, 4);
  paint('bone', 18, -3, 1, 2);
};

export const HEADWEAR_DRAWERS = { crown, veilAndTiara, mitre, plumedHelm, jesterHorns, flatCap, hood, wideHat };
export type Headwear = keyof typeof HEADWEAR_DRAWERS;
