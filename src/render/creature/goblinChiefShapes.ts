import type { PixelCanvas } from '../pixelCanvas';
import { type Hex, type Tones } from './creatureShading';

export type Point = readonly [number, number];

// Light comes from the top-left. A checkerboard dither blends the tones at each band edge.
function shadePixel(art: PixelCanvas, x: number, y: number, diagonal: number, tones: Tones): void {
  const checker = (x + y) % 2 === 0;
  let tone: Hex = tones.base;
  if (diagonal < -0.5) tone = tones.light;
  else if (diagonal < -0.3) tone = checker ? tones.light : tones.base;
  else if (diagonal > 0.5) tone = tones.dark;
  else if (diagonal > 0.28) tone = checker ? tones.dark : tones.base;
  art.fill(tone, x, y, 1, 1);
}

export function shadedEllipse(art: PixelCanvas, centerX: number, centerY: number, radiusX: number, radiusY: number, tones: Tones): void {
  for (let y = Math.floor(centerY - radiusY); y <= Math.ceil(centerY + radiusY); y++) {
    for (let x = Math.floor(centerX - radiusX); x <= Math.ceil(centerX + radiusX); x++) {
      const dx = (x - centerX) / radiusX;
      const dy = (y - centerY) / radiusY;
      if (dx * dx + dy * dy > 1) continue;
      shadePixel(art, x, y, (dx + dy) * 0.62, tones);
    }
  }
}

function isInside(polygon: readonly Point[], x: number, y: number): boolean {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [ax, ay] = polygon[index] as Point;
    const [bx, by] = polygon[previous] as Point;
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = true;
  }
  return inside;
}

export function shadedPolygon(art: PixelCanvas, polygon: readonly Point[], tones: Tones): void {
  const xs = polygon.map((point) => point[0]);
  const ys = polygon.map((point) => point[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!isInside(polygon, x + 0.5, y + 0.5)) continue;
      const diagonal = ((x - minX) / Math.max(1, maxX - minX) + (y - minY) / Math.max(1, maxY - minY) - 1) * 0.9;
      shadePixel(art, x, y, diagonal, tones);
    }
  }
}

export function flatPolygon(art: PixelCanvas, polygon: readonly Point[], color: Hex): void {
  const xs = polygon.map((point) => point[0]);
  const ys = polygon.map((point) => point[1]);
  for (let y = Math.min(...ys); y <= Math.max(...ys); y++) {
    for (let x = Math.min(...xs); x <= Math.max(...xs); x++) {
      if (isInside(polygon, x + 0.5, y + 0.5)) art.fill(color, x, y, 1, 1);
    }
  }
}

export function ditherRect(art: PixelCanvas, color: Hex, x: number, y: number, width: number, height: number): void {
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      if ((row + column) % 2 === 0) art.fill(color, x + column, y + row, 1, 1);
    }
  }
}

export function line(art: PixelCanvas, color: Hex, from: Point, to: Point): void {
  const steps = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1]));
  for (let step = 0; step <= steps; step++) {
    const progress = steps === 0 ? 0 : step / steps;
    art.fill(color, from[0] + (to[0] - from[0]) * progress, from[1] + (to[1] - from[1]) * progress, 1, 1);
  }
}
