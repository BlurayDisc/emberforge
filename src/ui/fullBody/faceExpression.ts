import type { Paint } from './figureColors';
import { INK, MOUTH_DARK, WHITE } from './figureColors';

const LIP = '#8a3a3a';
const LIPSTICK = '#c8505a';

export type Mouth = 'smirk' | 'flat' | 'smile' | 'laugh' | 'roar';
export type Brows = 'angry' | 'flat' | 'sly' | 'confident';

// Eyes sit at x 16-17 and 22-23, rows 12-13. A lid row of skin shade narrows them.
export function narrowEyes(paint: Paint, skinShade: string): void {
  paint(skinShade, 16, 12, 2, 1);
  paint(skinShade, 22, 12, 2, 1);
}

export function paintBrows(paint: Paint, color: string, brows: Brows): void {
  if (brows === 'angry') {
    paint(color, 15, 10, 2, 1);
    paint(color, 17, 11, 2, 1);
    paint(color, 23, 10, 2, 1);
    paint(color, 21, 11, 2, 1);
  } else if (brows === 'confident') {
    paint(color, 15, 9, 1, 1);
    paint(color, 16, 10, 3, 1);
    paint(color, 24, 9, 1, 1);
    paint(color, 21, 10, 3, 1);
  } else if (brows === 'sly') {
    paint(color, 15, 11, 4, 1);
    paint(color, 22, 9, 3, 1);
    paint(color, 21, 10, 1, 1);
  } else {
    paint(color, 15, 10, 4, 1);
    paint(color, 21, 10, 4, 1);
  }
}

// Mouth rows 16-17 are cleared first, so this hides the lips and blush the base figure draws.
export function paintMouth(paint: Paint, skin: string, mouth: Mouth): void {
  paint(skin, 15, 15, 2, 1);
  paint(skin, 23, 15, 2, 1);
  paint(skin, 18, 16, 4, 2);
  if (mouth === 'smirk') {
    paint(LIP, 19, 16, 3, 1);
    paint(LIP, 22, 15, 1, 1);
    paint(WHITE, 20, 16, 1, 1);
  } else if (mouth === 'flat') {
    paint('#a8505a', 19, 16, 2, 1);
  } else if (mouth === 'laugh') {
    paint(LIPSTICK, 18, 16, 1, 1);
    paint(LIPSTICK, 21, 16, 1, 1);
    paint(WHITE, 19, 16, 2, 1);
    paint(LIPSTICK, 19, 17, 2, 1);
  } else if (mouth === 'smile') {
    paint(LIP, 18, 16, 1, 1);
    paint(LIP, 19, 17, 2, 1);
    paint(LIP, 21, 16, 1, 1);
  } else {
    paint(MOUTH_DARK, 18, 16, 4, 2);
    paint(WHITE, 18, 16, 4, 1);
    paint(INK, 19, 17, 2, 1);
  }
}
