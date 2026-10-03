import type { PaletteColor } from './palette';
import type { PixelCanvas } from './pixelCanvas';

const BAYER_FOUR_BY_FOUR = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const;

// Fills part of the rectangle with an ordered dither pattern. strength 0 draws nothing and 16 fills it all.
// The same pattern on every call keeps the art stable, so the output is the same on every run.
export function ditherRect(art: PixelCanvas, color: PaletteColor, x: number, y: number, width: number, height: number, strength: number): void {
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      const threshold = BAYER_FOUR_BY_FOUR[(y + row) & 3]?.[(x + column) & 3] ?? 0;
      if (threshold < strength) art.fill(color, x + column, y + row, 1, 1);
    }
  }
}

// A vertical fade: strength goes from startStrength at the top to endStrength at the bottom.
export function ditherFade(art: PixelCanvas, color: PaletteColor, x: number, y: number, width: number, height: number, startStrength: number, endStrength: number): void {
  for (let row = 0; row < height; row++) {
    const strength = startStrength + ((endStrength - startStrength) * row) / Math.max(1, height - 1);
    ditherRect(art, color, x, y + row, width, 1, strength);
  }
}

export function fillDisc(art: PixelCanvas, color: PaletteColor, centerX: number, centerY: number, radius: number): void {
  for (let row = -radius; row <= radius; row++) {
    const half = Math.round(Math.sqrt(radius * radius - row * row));
    art.fill(color, centerX - half, centerY + row, half * 2 + 1, 1);
  }
}

export function ditherDisc(art: PixelCanvas, color: PaletteColor, centerX: number, centerY: number, radius: number, strength: number): void {
  for (let row = -radius; row <= radius; row++) {
    const half = Math.round(Math.sqrt(radius * radius - row * row));
    ditherRect(art, color, centerX - half, centerY + row, half * 2 + 1, 1, strength);
  }
}
