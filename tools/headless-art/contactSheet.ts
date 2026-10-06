import { paintNumberLabel } from './digitLabels';
import { createSoftCanvas, type SoftCanvas } from './softCanvas';

export interface SheetEntry {
  label: string;
  canvas: SoftCanvas;
}

export interface SheetOptions {
  scale: number;
  columns: number;
}

const CELL_PADDING = 6;
const CHECKER_SQUARE = 8;
const CHECKER_SHADES = [38, 52] as const;
const CELL_BORDER_SHADE = 90;
const LABEL_PIXEL_SIZE = 2;

function setOpaque(pixels: Uint8ClampedArray, index: number, shade: number): void {
  pixels.set([shade, shade, shade, 255], index);
}

function paintCellBackground(sheet: SoftCanvas, left: number, top: number, width: number, height: number): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isBorder = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      const checkerIndex = (Math.floor(x / CHECKER_SQUARE) + Math.floor(y / CHECKER_SQUARE)) % 2;
      const shade = isBorder ? CELL_BORDER_SHADE : (CHECKER_SHADES[checkerIndex] as number);
      setOpaque(sheet.pixels, ((top + y) * sheet.width + left + x) * 4, shade);
    }
  }
}

// Transparent pixels show the checker board. Each sprite is scaled with nearest-neighbour, so the pixels stay hard-edged.
function paintScaledEntry(sheet: SoftCanvas, entry: SoftCanvas, left: number, top: number, scale: number): void {
  for (let y = 0; y < entry.height; y++) {
    for (let x = 0; x < entry.width; x++) {
      const from = (y * entry.width + x) * 4;
      const alpha = (entry.pixels[from + 3] as number) / 255;
      if (alpha === 0) continue;
      for (let blockY = 0; blockY < scale; blockY++) {
        for (let blockX = 0; blockX < scale; blockX++) {
          const to = ((top + y * scale + blockY) * sheet.width + left + x * scale + blockX) * 4;
          for (let channel = 0; channel < 3; channel++) {
            const blended = (entry.pixels[from + channel] as number) * alpha + (sheet.pixels[to + channel] as number) * (1 - alpha);
            sheet.pixels[to + channel] = Math.round(blended);
          }
        }
      }
    }
  }
}

export function renderContactSheet(entries: readonly SheetEntry[], options: SheetOptions): SoftCanvas {
  const cellWidth = Math.max(...entries.map((entry) => entry.canvas.width)) * options.scale + CELL_PADDING * 2;
  const cellHeight = Math.max(...entries.map((entry) => entry.canvas.height)) * options.scale + CELL_PADDING * 2;
  const columns = Math.min(options.columns, entries.length);
  const rows = Math.ceil(entries.length / columns);
  const sheet = createSoftCanvas(columns * cellWidth, rows * cellHeight);

  entries.forEach((entry, index) => {
    const cellLeft = (index % columns) * cellWidth;
    const cellTop = Math.floor(index / columns) * cellHeight;
    paintCellBackground(sheet, cellLeft, cellTop, cellWidth, cellHeight);
    const spriteLeft = cellLeft + Math.floor((cellWidth - entry.canvas.width * options.scale) / 2);
    const spriteTop = cellTop + Math.floor((cellHeight - entry.canvas.height * options.scale) / 2);
    paintScaledEntry(sheet, entry.canvas, spriteLeft, spriteTop, options.scale);
    paintNumberLabel(sheet.pixels, sheet.width, index + 1, cellLeft + 1, cellTop + 1, LABEL_PIXEL_SIZE);
  });
  return sheet;
}
