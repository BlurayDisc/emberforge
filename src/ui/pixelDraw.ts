export interface PixelDrawing {
  canvas: HTMLCanvasElement;
  fill(color: string, x: number, y: number, width: number, height: number): void;
}

export function createDrawing(width: number, height: number): PixelDrawing {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas is not available');
  return {
    canvas,
    fill: (color, x, y, fillWidth, fillHeight) => {
      context.fillStyle = color;
      context.fillRect(x, y, fillWidth, fillHeight);
    },
  };
}

export function drawAscii(rows: readonly string[], legend: Readonly<Record<string, string>>): PixelDrawing {
  const drawing = createDrawing(rows[0]?.length ?? 0, rows.length);
  rows.forEach((row, rowIndex) => {
    [...row].forEach((symbol, columnIndex) => {
      const color = legend[symbol];
      if (color !== undefined) drawing.fill(color, columnIndex, rowIndex, 1, 1);
    });
  });
  return drawing;
}

// Encoding a canvas to a PNG data URL is slow (over 600 ms for the first ones in a cold browser). Each canvas is encoded once, so a cached canvas costs nothing on later screens.
const dataUrlByCanvas = new WeakMap<HTMLCanvasElement, string>();

function dataUrlOf(canvas: HTMLCanvasElement): string {
  let dataUrl = dataUrlByCanvas.get(canvas);
  if (dataUrl === undefined) {
    dataUrl = canvas.toDataURL();
    dataUrlByCanvas.set(canvas, dataUrl);
  }
  return dataUrl;
}

export function drawingToImage(drawing: PixelDrawing, scale: number, className = 'pixel-icon'): HTMLImageElement {
  const image = document.createElement('img');
  image.className = className;
  image.src = dataUrlOf(drawing.canvas);
  image.alt = '';
  image.width = drawing.canvas.width * scale;
  image.height = drawing.canvas.height * scale;
  return image;
}
