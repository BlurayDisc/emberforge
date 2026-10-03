import { createPixelCanvas } from './pixelCanvas';

export const FLAME_FRAME_COUNT = 3;
export const FLAG_FRAME_COUNT = 4;
export const RIBBON_FRAME_COUNT = 4;
export const BIRD_FRAME_COUNT = 2;

export const FLAME_SIZES = { torch: { width: 8, height: 12 }, brazier: { width: 14, height: 18 } } as const;
export type FlameSize = keyof typeof FLAME_SIZES;

// A flame is stacked rows that get thinner toward the tip. Each frame sways the tip a little differently.
export function drawFlameFrame(size: FlameSize, frame: number): HTMLCanvasElement {
  const { width, height } = FLAME_SIZES[size];
  const art = createPixelCanvas(width, height);
  for (let row = 0; row < height; row++) {
    const fromBottom = height - 1 - row;
    const progress = fromBottom / (height - 1);
    const rowWidth = Math.max(1, Math.round(width * Math.pow(1 - progress, 0.7)));
    const sway = Math.round(Math.sin(frame * 2.1 + fromBottom * 0.6) * progress * (width / 5));
    const left = Math.round((width - rowWidth) / 2) + sway;
    art.fill('flame', left, row, rowWidth, 1);
    if (progress < 0.65 && rowWidth > 2) art.fill('flameBright', left + 1, row, rowWidth - 2, 1);
  }
  return art.canvas;
}

export function drawFlagFrame(frame: number): HTMLCanvasElement {
  const art = createPixelCanvas(14, 8);
  for (let column = 0; column < 14; column++) {
    const wave = Math.round(Math.sin(frame * 1.57 + column * 0.55) * 1.4 * (column / 13));
    const clothHeight = Math.round(7 - column * 0.28);
    art.fill('outline', column, wave, 1, clothHeight + 2);
    art.fill(column % 5 === 4 ? 'gold' : 'blood', column, wave + 1, 1, clothHeight);
    if (column > 3 && column < 11) art.fill('gold', column, wave + 1 + Math.floor(clothHeight / 2), 1, 1);
  }
  return art.canvas;
}

export function drawRibbonFrame(frame: number): HTMLCanvasElement {
  const art = createPixelCanvas(6, 16);
  for (let row = 0; row < 16; row++) {
    const sway = Math.round(Math.sin(frame * 1.57 + row * 0.5) * (row / 15) * 2.2) + 1;
    art.fill('outline', sway - 1, row, 4, 1);
    art.fill('cloud', sway, row, 2, 1);
    art.fill('cloudShade', sway + 1, row, 1, 1);
  }
  return art.canvas;
}

export function drawBirdFrame(frame: number): HTMLCanvasElement {
  const art = createPixelCanvas(8, 4);
  const wingY = frame === 0 ? 0 : 2;
  art.fill('night', 3, 1, 2, 1);
  art.fill('night', 0, wingY, 3, 1);
  art.fill('night', 5, wingY, 3, 1);
  art.fill('night', 2, 1, 1, 1);
  art.fill('night', 5, 1, 1, 1);
  return art.canvas;
}

export function drawShadowOval(width: number): HTMLCanvasElement {
  const art = createPixelCanvas(width, 6);
  art.context.globalAlpha = 0.38;
  for (let row = 0; row < 6; row++) {
    const half = Math.round((width / 2) * Math.sqrt(1 - Math.pow((row - 2.5) / 3, 2)));
    art.fill('void', width / 2 - half, row, half * 2, 1);
  }
  return art.canvas;
}
