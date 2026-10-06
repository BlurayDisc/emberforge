import { parseCssColor, type RgbaColor } from './cssColor';

interface AxisTransform {
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

export interface SoftCanvas {
  width: number;
  height: number;
  readonly pixels: Uint8ClampedArray;
  getContext(kind: string): SoftContext | null;
}

// Only the calls that the game art uses. Translate and scale are enough for the mirror flip in animalArt.
export interface SoftContext {
  fillStyle: string;
  globalAlpha: number;
  fillRect(x: number, y: number, width: number, height: number): void;
  clearRect(x: number, y: number, width: number, height: number): void;
  getImageData(x: number, y: number, width: number, height: number): { data: Uint8ClampedArray; width: number; height: number };
  drawImage(source: SoftCanvas, x: number, y: number): void;
  translate(x: number, y: number): void;
  scale(x: number, y: number): void;
}

const DEFAULT_CANVAS_WIDTH = 300;
const DEFAULT_CANVAS_HEIGHT = 150;

export function createSoftCanvas(initialWidth = DEFAULT_CANVAS_WIDTH, initialHeight = DEFAULT_CANVAS_HEIGHT): SoftCanvas {
  const transform: AxisTransform = { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };
  let width = initialWidth;
  let height = initialHeight;
  let pixels = new Uint8ClampedArray(width * height * 4);

  // Like a real canvas, setting a size clears the pixels and resets the transform.
  const resize = (newWidth: number, newHeight: number): void => {
    width = newWidth;
    height = newHeight;
    pixels = new Uint8ClampedArray(width * height * 4);
    Object.assign(transform, { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 });
  };

  const blendPixel = (x: number, y: number, color: RgbaColor): void => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = (y * width + x) * 4;
    const sourceAlpha = color.alpha;
    const destinationAlpha = (pixels[index + 3] as number) / 255;
    const outAlpha = sourceAlpha + destinationAlpha * (1 - sourceAlpha);
    if (outAlpha <= 0) return;
    const mix = (source: number, destination: number): number =>
      (source * sourceAlpha + destination * destinationAlpha * (1 - sourceAlpha)) / outAlpha;
    pixels[index] = Math.round(mix(color.red, pixels[index] as number));
    pixels[index + 1] = Math.round(mix(color.green, pixels[index + 1] as number));
    pixels[index + 2] = Math.round(mix(color.blue, pixels[index + 2] as number));
    pixels[index + 3] = Math.round(outAlpha * 255);
  };

  const transformedBounds = (x: number, y: number, rectWidth: number, rectHeight: number) => {
    const xA = Math.round(x * transform.scaleX + transform.offsetX);
    const xB = Math.round((x + rectWidth) * transform.scaleX + transform.offsetX);
    const yA = Math.round(y * transform.scaleY + transform.offsetY);
    const yB = Math.round((y + rectHeight) * transform.scaleY + transform.offsetY);
    return { left: Math.min(xA, xB), right: Math.max(xA, xB), top: Math.min(yA, yB), bottom: Math.max(yA, yB) };
  };

  const context: SoftContext = {
    fillStyle: '#000000',
    globalAlpha: 1,
    fillRect(x, y, rectWidth, rectHeight) {
      const color = parseCssColor(context.fillStyle);
      const covered = { ...color, alpha: color.alpha * context.globalAlpha };
      const { left, right, top, bottom } = transformedBounds(x, y, rectWidth, rectHeight);
      for (let row = top; row < bottom; row++) for (let column = left; column < right; column++) blendPixel(column, row, covered);
    },
    clearRect(x, y, rectWidth, rectHeight) {
      const { left, right, top, bottom } = transformedBounds(x, y, rectWidth, rectHeight);
      for (let row = Math.max(0, top); row < Math.min(height, bottom); row++) {
        const rowStart = (row * width + Math.max(0, left)) * 4;
        pixels.fill(0, rowStart, (row * width + Math.min(width, right)) * 4);
      }
    },
    getImageData(x, y, copyWidth, copyHeight) {
      const data = new Uint8ClampedArray(copyWidth * copyHeight * 4);
      for (let row = 0; row < copyHeight; row++) {
        for (let column = 0; column < copyWidth; column++) {
          const sourceX = x + column;
          const sourceY = y + row;
          if (sourceX < 0 || sourceY < 0 || sourceX >= width || sourceY >= height) continue;
          const from = (sourceY * width + sourceX) * 4;
          data.set(pixels.subarray(from, from + 4), (row * copyWidth + column) * 4);
        }
      }
      return { data, width: copyWidth, height: copyHeight };
    },
    drawImage(source, x, y) {
      for (let row = 0; row < source.height; row++) {
        for (let column = 0; column < source.width; column++) {
          const from = (row * source.width + column) * 4;
          const alpha = ((source.pixels[from + 3] as number) / 255) * context.globalAlpha;
          if (alpha === 0) continue;
          const color = { red: source.pixels[from] as number, green: source.pixels[from + 1] as number, blue: source.pixels[from + 2] as number, alpha };
          const { left, right, top, bottom } = transformedBounds(x + column, y + row, 1, 1);
          for (let destRow = top; destRow < bottom; destRow++) for (let destColumn = left; destColumn < right; destColumn++) blendPixel(destColumn, destRow, color);
        }
      }
    },
    translate(x, y) {
      transform.offsetX += transform.scaleX * x;
      transform.offsetY += transform.scaleY * y;
    },
    scale(x, y) {
      transform.scaleX *= x;
      transform.scaleY *= y;
    },
  };

  return {
    get width() {
      return width;
    },
    set width(newWidth: number) {
      resize(newWidth, height);
    },
    get height() {
      return height;
    },
    set height(newHeight: number) {
      resize(width, newHeight);
    },
    get pixels() {
      return pixels;
    },
    getContext: (kind) => (kind === '2d' ? context : null),
  };
}
