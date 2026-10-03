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

export function drawingToImage(drawing: PixelDrawing, scale: number, className = 'pixel-icon'): HTMLImageElement {
  const image = document.createElement('img');
  image.className = className;
  image.src = drawing.canvas.toDataURL();
  image.alt = '';
  image.width = drawing.canvas.width * scale;
  image.height = drawing.canvas.height * scale;
  return image;
}
