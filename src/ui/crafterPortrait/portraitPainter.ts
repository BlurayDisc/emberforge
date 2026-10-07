export interface Swatch {
  base: string;
  shade: string;
  light: string;
}

export interface PortraitPainter {
  canvas: HTMLCanvasElement;
  rect(color: string, x: number, y: number, width: number, height: number): void;
  dot(color: string, x: number, y: number): void;
  line(color: string, fromX: number, fromY: number, toX: number, toY: number, thickness?: number): void;
  ellipse(color: string, centerX: number, centerY: number, radiusX: number, radiusY: number): void;
  shadedEllipse(swatch: Swatch, centerX: number, centerY: number, radiusX: number, radiusY: number): void;
  shadedTrapezoid(swatch: Swatch, centerX: number, topY: number, bottomY: number, halfTop: number, halfBottom: number): void;
  shadedRect(swatch: Swatch, x: number, y: number, width: number, height: number): void;
  ring(color: string, centerX: number, centerY: number, radius: number): void;
  checker(color: string, x: number, y: number, width: number, height: number): void;
  addOutline(color: string): void;
  drawOnto(target: PortraitPainter): void;
}

export const PORTRAIT_SIZE = 64;

function halfWidthAtRow(row: number, centerY: number, radiusX: number, radiusY: number): number {
  const ratio = (row + 0.5 - centerY) / radiusY;
  return ratio * ratio >= 1 ? 0 : radiusX * Math.sqrt(1 - ratio * ratio);
}

export function createPortraitPainter(): PortraitPainter {
  const canvas = document.createElement('canvas');
  canvas.width = PORTRAIT_SIZE;
  canvas.height = PORTRAIT_SIZE;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas is not available');

  const rect: PortraitPainter['rect'] = (color, x, y, width, height) => {
    context.fillStyle = color;
    context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  };

  // Each row is a span, so the shapes stay hard-edged. The right side gets the shade and the upper left gets a highlight.
  const shadedSpans = (swatch: Swatch, top: number, bottom: number, spanAt: (row: number) => { left: number; right: number }): void => {
    const height = bottom - top;
    for (let row = top; row < bottom; row++) {
      const { left, right } = spanAt(row);
      const width = right - left;
      if (width <= 0) continue;
      const shadeWidth = Math.max(2, Math.round(width * 0.28));
      rect(swatch.base, left, row, width, 1);
      rect(swatch.shade, right - shadeWidth, row, shadeWidth, 1);
      if (row - top < height * 0.45) rect(swatch.light, left, row, Math.min(2, width), 1);
    }
  };

  const painter: PortraitPainter = {
    canvas,
    rect,
    dot: (color, x, y) => rect(color, x, y, 1, 1),
    line: (color, fromX, fromY, toX, toY, thickness = 1) => {
      const steps = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY), 1);
      for (let step = 0; step <= steps; step++) {
        rect(color, fromX + ((toX - fromX) * step) / steps, fromY + ((toY - fromY) * step) / steps, thickness, thickness);
      }
    },
    ellipse: (color, centerX, centerY, radiusX, radiusY) => {
      for (let row = Math.floor(centerY - radiusY); row < Math.ceil(centerY + radiusY); row++) {
        const half = halfWidthAtRow(row, centerY, radiusX, radiusY);
        rect(color, centerX - half, row, half * 2, 1);
      }
    },
    shadedEllipse: (swatch, centerX, centerY, radiusX, radiusY) =>
      shadedSpans(swatch, Math.floor(centerY - radiusY), Math.ceil(centerY + radiusY), (row) => {
        const half = halfWidthAtRow(row, centerY, radiusX, radiusY);
        return { left: Math.round(centerX - half), right: Math.round(centerX + half) };
      }),
    shadedTrapezoid: (swatch, centerX, topY, bottomY, halfTop, halfBottom) =>
      shadedSpans(swatch, topY, bottomY, (row) => {
        const half = halfTop + ((halfBottom - halfTop) * (row - topY)) / Math.max(1, bottomY - topY - 1);
        return { left: Math.round(centerX - half), right: Math.round(centerX + half) };
      }),
    shadedRect: (swatch, x, y, width, height) => shadedSpans(swatch, y, y + height, () => ({ left: x, right: x + width })),
    ring: (color, centerX, centerY, radius) => {
      const steps = radius * 8;
      for (let step = 0; step < steps; step++) {
        const angle = (step / steps) * Math.PI * 2;
        rect(color, centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius, 1, 1);
      }
    },
    checker: (color, x, y, width, height) => {
      for (let row = 0; row < height; row++) {
        for (let column = (row % 2); column < width; column += 2) rect(color, x + column, y + row, 1, 1);
      }
    },
    addOutline: (color) => {
      const pixels = context.getImageData(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE).data;
      const isOpaque = (x: number, y: number): boolean =>
        x >= 0 && y >= 0 && x < PORTRAIT_SIZE && y < PORTRAIT_SIZE && (pixels[(y * PORTRAIT_SIZE + x) * 4 + 3] ?? 0) > 0;
      for (let y = 0; y < PORTRAIT_SIZE; y++) {
        for (let x = 0; x < PORTRAIT_SIZE; x++) {
          if (isOpaque(x, y)) continue;
          if (isOpaque(x - 1, y) || isOpaque(x + 1, y) || isOpaque(x, y - 1) || isOpaque(x, y + 1)) rect(color, x, y, 1, 1);
        }
      }
    },
    drawOnto: (target) => {
      const targetContext = target.canvas.getContext('2d');
      if (!targetContext) throw new Error('2D canvas is not available');
      targetContext.drawImage(canvas, 0, 0);
    },
  };
  return painter;
}
