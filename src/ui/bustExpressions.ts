import type { PixelDrawing } from './pixelDraw';

const LIP = '#8a3a3a';
const LIPSTICK = '#c8505a';
const BROW_INK = '#2a1a14';
const MOUTH_DARK = '#5a1a1a';

export type BustMouth = 'smirk' | 'flat' | 'smile' | 'laugh' | 'roar';
export type BustBrows = 'angry' | 'flat' | 'sly' | 'confident';

// Eyes sit at x 12-14 and 17-19, rows 13-14. A lid row of skin shade narrows them.
export function narrowBustEyes(drawing: PixelDrawing, skinShade: string): void {
  drawing.fill(skinShade, 12, 13, 3, 1);
  drawing.fill(skinShade, 17, 13, 3, 1);
}

export function paintBustBrows(drawing: PixelDrawing, brows: BustBrows, color = BROW_INK): void {
  if (brows === 'angry') {
    drawing.fill(color, 11, 11, 2, 1);
    drawing.fill(color, 13, 12, 2, 1);
    drawing.fill(color, 17, 12, 2, 1);
    drawing.fill(color, 19, 11, 2, 1);
  } else if (brows === 'confident') {
    drawing.fill(color, 11, 10, 1, 1);
    drawing.fill(color, 12, 11, 3, 1);
    drawing.fill(color, 20, 10, 1, 1);
    drawing.fill(color, 17, 11, 3, 1);
  } else if (brows === 'sly') {
    drawing.fill(color, 11, 12, 4, 1);
    drawing.fill(color, 18, 10, 3, 1);
  } else {
    drawing.fill(color, 11, 11, 4, 1);
    drawing.fill(color, 17, 11, 4, 1);
  }
}

export function paintBustMouth(drawing: PixelDrawing, skin: string, mouth: BustMouth): void {
  drawing.fill(skin, 11, 16, 2, 1);
  drawing.fill(skin, 19, 16, 2, 1);
  drawing.fill(skin, 14, 18, 4, 2);
  if (mouth === 'smirk') {
    drawing.fill(LIP, 15, 18, 3, 1);
    drawing.fill(LIP, 18, 17, 1, 1);
  } else if (mouth === 'flat') {
    drawing.fill('#a8505a', 15, 18, 2, 1);
  } else if (mouth === 'laugh') {
    drawing.fill(LIPSTICK, 14, 18, 1, 1);
    drawing.fill(LIPSTICK, 17, 18, 1, 1);
    drawing.fill('#ffffff', 15, 18, 2, 1);
    drawing.fill(LIPSTICK, 15, 19, 2, 1);
  } else if (mouth === 'smile') {
    drawing.fill(LIP, 14, 18, 1, 1);
    drawing.fill(LIP, 15, 19, 2, 1);
    drawing.fill(LIP, 17, 18, 1, 1);
  } else {
    drawing.fill(MOUTH_DARK, 14, 18, 4, 2);
    drawing.fill('#ffffff', 14, 18, 4, 1);
  }
}
