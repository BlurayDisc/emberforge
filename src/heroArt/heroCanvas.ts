import { OUTLINE } from './heroPalette';

export interface HeroCanvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  fill(color: string, x: number, y: number, width: number, height: number): void;
}

export function createHeroCanvas(width: number, height: number): HeroCanvas {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas is not available');
  return {
    canvas,
    context,
    fill: (color, x, y, fillWidth, fillHeight) => {
      context.fillStyle = color;
      context.fillRect(Math.round(x), Math.round(y), Math.round(fillWidth), Math.round(fillHeight));
    },
  };
}

// One pixel of outline around every opaque pixel, drawn only on transparent pixels.
export function addHeroOutline(source: HeroCanvas): void {
  const { width, height } = source.canvas;
  const pixels = source.context.getImageData(0, 0, width, height);
  const isOpaque = (x: number, y: number): boolean =>
    x >= 0 && y >= 0 && x < width && y < height && (pixels.data[(y * width + x) * 4 + 3] ?? 0) > 0;
  const outlinePositions: Array<[number, number]> = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isOpaque(x, y)) continue;
      if (isOpaque(x - 1, y) || isOpaque(x + 1, y) || isOpaque(x, y - 1) || isOpaque(x, y + 1)) outlinePositions.push([x, y]);
    }
  }
  outlinePositions.forEach(([x, y]) => source.fill(OUTLINE, x, y, 1, 1));
}
