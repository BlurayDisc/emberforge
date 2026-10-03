import type { FigureDrawer } from './castleFigureTypes';

const sceptre: FigureDrawer = (paint) => {
  paint('gold', 24, 10, 2, 36);
  paint('flameBright', 24, 10, 1, 30);
  paint('gold', 22, 4, 6, 6);
  paint('flameBright', 23, 4, 2, 2);
  paint('blood', 24, 6, 2, 2);
  paint('gold', 24, 1, 2, 3);
  paint('gold', 23, 2, 4, 1);
};

const swordPlanted: FigureDrawer = (paint) => {
  paint('steel', 24, 35, 2, 14);
  paint('snow', 24, 35, 1, 13);
  paint('steelDark', 25, 37, 1, 11);
  paint('gold', 21, 33, 8, 2);
  paint('leatherDark', 24, 29, 2, 4);
  paint('gold', 23, 27, 4, 2);
};

const crozier: FigureDrawer = (paint) => {
  paint('gold', 25, 8, 1, 38);
  paint('flameBright', 25, 12, 1, 20);
  paint('gold', 22, 3, 5, 2);
  paint('gold', 21, 4, 2, 5);
  paint('gold', 22, 8, 2, 1);
  paint('blood', 24, 5, 1, 1);
};

const ledger: FigureDrawer = (paint) => {
  paint('leatherDark', 2, 24, 9, 12);
  paint('leather', 3, 25, 7, 10);
  paint('parchment', 9, 25, 1, 10);
  paint('gold', 4, 28, 4, 1);
  paint('gold', 4, 31, 3, 1);
  paint('steelDark', 19, 32, 1, 4);
  paint('gold', 18, 35, 3, 3);
};

const scrollAndQuill: FigureDrawer = (paint) => {
  paint('parchment', 2, 32, 4, 14);
  paint('plaster', 2, 32, 1, 14);
  paint('leather', 1, 31, 6, 2);
  paint('leather', 1, 45, 6, 2);
  paint('robeWhite', 24, 20, 2, 10);
  paint('robeWhiteShade', 25, 22, 1, 7);
  paint('void', 23, 30, 1, 3);
};

const halberd: FigureDrawer = (paint) => {
  paint('leather', 24, 0, 2, 48);
  paint('leatherDark', 25, 0, 1, 48);
  paint('steel', 24, -5, 2, 6);
  paint('steel', 21, 1, 5, 5);
  paint('snow', 21, 1, 1, 4);
  paint('steelDark', 22, 5, 4, 1);
};

const bowAndQuiver: FigureDrawer = (paint) => {
  paint('leather', 4, 13, 1, 3);
  paint('leather', 3, 16, 1, 3);
  paint('leather', 2, 19, 1, 14);
  paint('leather', 3, 33, 1, 3);
  paint('leather', 4, 36, 1, 3);
  paint('bone', 5, 14, 1, 24);
  paint('leatherDark', 19, 13, 4, 13);
  paint('cloud', 20, 10, 1, 3);
  paint('blood', 22, 10, 1, 3);
};

const hawkOnFist: FigureDrawer = (paint) => {
  paint('leatherDark', 21, 22, 5, 3);
  paint('hairBrown', 21, 16, 6, 6);
  paint('leatherDark', 19, 20, 3, 5);
  paint('bone', 23, 18, 3, 3);
  paint('hairBrown', 24, 13, 3, 4);
  paint('gold', 27, 15, 1, 2);
  paint('void', 26, 14, 1, 1);
};

const lampPole: FigureDrawer = (paint) => {
  paint('leather', 25, 8, 1, 40);
  paint('steelDark', 22, 2, 7, 2);
  paint('steelDark', 22, 4, 1, 6);
  paint('steelDark', 28, 4, 1, 6);
  paint('flameBright', 23, 4, 5, 6);
  paint('flame', 24, 6, 3, 4);
  paint('steelDark', 22, 10, 7, 1);
};

const bauble: FigureDrawer = (paint) => {
  paint('leatherDark', 24, 24, 1, 12);
  paint('blood', 22, 19, 5, 5);
  paint('gold', 21, 21, 1, 2);
  paint('gold', 27, 21, 1, 2);
  paint('flameBright', 23, 20, 1, 1);
  paint('void', 24, 21, 1, 1);
};

const ribbon: FigureDrawer = (paint) => {
  paint('cloud', 3, 33, 3, 13);
  paint('robeWhiteShade', 5, 36, 1, 10);
  paint('cloud', 6, 44, 2, 4);
  paint('cloud', 1, 43, 2, 5);
};

const pennantSpear: FigureDrawer = (paint) => {
  paint('leather', 24, 2, 2, 46);
  paint('steel', 24, -3, 2, 5);
  paint('glassBlue', 18, -2, 6, 4);
  paint('gold', 18, 0, 6, 1);
};

export const HELD_DRAWERS = { sceptre, swordPlanted, crozier, ledger, scrollAndQuill, halberd, bowAndQuiver, hawkOnFist, lampPole, bauble, ribbon, pennantSpear };
export type HeldItem = keyof typeof HELD_DRAWERS;
