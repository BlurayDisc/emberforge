import type { HeroCanvas } from './heroCanvas';
import type { Hex } from './heroPalette';

export interface SpritePainter {
  rect(color: Hex, x: number, y: number, width: number, height: number): void;
  dot(color: Hex, x: number, y: number): void;
  // Fills one row between two x positions, both included.
  span(color: Hex, fromX: number, toX: number, y: number): void;
  line(color: Hex, fromX: number, fromY: number, toX: number, toY: number, thickness?: number): void;
  // Draws rows of text. Each letter is a key in the palette. A dot is transparent.
  grid(rows: readonly string[], palette: Readonly<Record<string, Hex>>, left: number, top: number): void;
}

// The offset keeps a margin around the drawing, so the outline is not cut at the canvas edge.
export function createSpritePainter(art: HeroCanvas, offsetX = 0, offsetY = 0): SpritePainter {
  const rect: SpritePainter['rect'] = (color, x, y, width, height) => art.fill(color, x + offsetX, y + offsetY, width, height);
  return {
    rect,
    dot: (color, x, y) => rect(color, x, y, 1, 1),
    span: (color, fromX, toX, y) => rect(color, fromX, y, toX - fromX + 1, 1),
    line: (color, fromX, fromY, toX, toY, thickness = 1) => {
      const steps = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY), 1);
      for (let step = 0; step <= steps; step++) {
        rect(color, Math.round(fromX + ((toX - fromX) * step) / steps), Math.round(fromY + ((toY - fromY) * step) / steps), thickness, thickness);
      }
    },
    grid: (rows, palette, left, top) => {
      rows.forEach((row, rowIndex) => {
        [...row].forEach((token, columnIndex) => {
          if (token === '.') return;
          const color = palette[token];
          if (!color) throw new Error(`Unknown sprite token "${token}" in row ${rowIndex}`);
          rect(color, left + columnIndex, top + rowIndex, 1, 1);
        });
      });
    },
  };
}
