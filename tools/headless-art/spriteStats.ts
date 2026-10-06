import type { SoftCanvas } from './softCanvas';

export interface SpriteStats {
  width: number;
  height: number;
  opaquePixels: number;
  partiallyTransparentPixels: number;
  distinctColors: number;
  boundingBox: string;
}

export function measureSprite(canvas: SoftCanvas): SpriteStats {
  const colors = new Set<number>();
  let opaquePixels = 0;
  let partiallyTransparentPixels = 0;
  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      const alpha = canvas.pixels[index + 3] as number;
      if (alpha === 0) continue;
      if (alpha < 255) partiallyTransparentPixels++;
      else opaquePixels++;
      colors.add(((canvas.pixels[index] as number) << 16) | ((canvas.pixels[index + 1] as number) << 8) | (canvas.pixels[index + 2] as number));
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  const boundingBox = maxX < 0 ? 'empty' : `${minX},${minY}-${maxX},${maxY}`;
  return { width: canvas.width, height: canvas.height, opaquePixels, partiallyTransparentPixels, distinctColors: colors.size, boundingBox };
}

export function describeSprite(index: number, label: string, stats: SpriteStats): string {
  const soft = stats.partiallyTransparentPixels > 0 ? `  soft-alpha=${stats.partiallyTransparentPixels}` : '';
  return `${String(index).padStart(3)}  ${label}  ${stats.width}x${stats.height}  box=${stats.boundingBox}  colors=${stats.distinctColors}${soft}`;
}
