import { createDrawing, type PixelDrawing } from '../pixelDraw';

export const SCENE_WIDTH = 128;
export const SCENE_HEIGHT = 72;

export interface ScenePainter {
  drawing: PixelDrawing;
  rect(color: string, x: number, y: number, width: number, height: number): void;
  disc(color: string, centerX: number, centerY: number, radius: number): void;
}

export function createScenePainter(): ScenePainter {
  const drawing = createDrawing(SCENE_WIDTH, SCENE_HEIGHT);
  return {
    drawing,
    rect: (color, x, y, width, height) => drawing.fill(color, x, y, width, height),
    disc: (color, centerX, centerY, radius) => {
      for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
          if (x * x + y * y <= radius * radius + radius) drawing.fill(color, centerX + x, centerY + y, 1, 1);
        }
      }
    },
  };
}

// Colour bands from the top down. The last band runs to `bottom`.
export function paintBands(painter: ScenePainter, colors: readonly string[], bottom: number): void {
  const bandHeight = Math.ceil(bottom / colors.length);
  colors.forEach((color, index) => painter.rect(color, 0, index * bandHeight, SCENE_WIDTH, bandHeight));
}

// A fixed formula places the stars, so the picture is the same every time.
export function paintStars(painter: ScenePainter, color: string, count: number, bottom: number): void {
  for (let index = 0; index < count; index++) painter.rect(color, (index * 53 + 17) % SCENE_WIDTH, (index * 29 + 5) % bottom, 1, 1);
}

export function paintAnvil(painter: ScenePainter, x: number, y: number, topColor: string, bodyColor: string): void {
  painter.rect(topColor, x, y, 24, 4);
  painter.rect(topColor, x + 24, y + 1, 4, 2);
  painter.rect(bodyColor, x + 6, y + 4, 12, 6);
  painter.rect(bodyColor, x + 2, y + 10, 20, 4);
}
