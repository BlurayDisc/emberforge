import { PALETTE, type PaletteColor } from './palette';

export interface PixelCanvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  fill(color: PaletteColor | `#${string}`, x: number, y: number, width: number, height: number): void;
}

export function createPixelCanvas(width: number, height: number): PixelCanvas {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas is not available');
  return {
    canvas,
    context,
    fill: (color, x, y, fillWidth, fillHeight) => {
      context.fillStyle = color.startsWith('#') ? color : PALETTE[color as PaletteColor];
      context.fillRect(Math.round(x), Math.round(y), Math.round(fillWidth), Math.round(fillHeight));
    },
  };
}

export function addOutline(source: PixelCanvas, color: PaletteColor): void {
  const { width, height } = source.canvas;
  const pixels = source.context.getImageData(0, 0, width, height);
  const isOpaque = (x: number, y: number): boolean =>
    x >= 0 && y >= 0 && x < width && y < height && (pixels.data[(y * width + x) * 4 + 3] ?? 0) > 0;

  const outlinePositions: Array<[number, number]> = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isOpaque(x, y)) continue;
      if (isOpaque(x - 1, y) || isOpaque(x + 1, y) || isOpaque(x, y - 1) || isOpaque(x, y + 1)) {
        outlinePositions.push([x, y]);
      }
    }
  }
  outlinePositions.forEach(([x, y]) => source.fill(color, x, y, 1, 1));
}
