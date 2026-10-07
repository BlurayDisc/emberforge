import type { PixelCanvas } from '../pixelCanvas';

export type Hex = `#${string}`;

export interface Tones {
  base: Hex;
  light: Hex;
  dark: Hex;
}

export function ellipse(art: PixelCanvas, centerX: number, centerY: number, radiusX: number, radiusY: number, color: Hex): void {
  for (let y = Math.floor(centerY - radiusY); y <= Math.ceil(centerY + radiusY); y++) {
    for (let x = Math.floor(centerX - radiusX); x <= Math.ceil(centerX + radiusX); x++) {
      const normalized = ((x - centerX) / radiusX) ** 2 + ((y - centerY) / radiusY) ** 2;
      if (normalized <= 1) art.fill(color, x, y, 1, 1);
    }
  }
}

export function shadedBlob(art: PixelCanvas, centerX: number, centerY: number, radiusX: number, radiusY: number, tones: Tones): void {
  ellipse(art, centerX, centerY, radiusX, radiusY, tones.dark);
  ellipse(art, centerX - 0.5, centerY - 1, radiusX - 1, radiusY - 1.5, tones.base);
  ellipse(art, centerX - radiusX * 0.3, centerY - radiusY * 0.4, radiusX * 0.45, radiusY * 0.35, tones.light);
}
