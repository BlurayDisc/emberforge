import { pickHeroAppearance, type ClassLook } from '../content/heroAppearance';
import type { ClassId } from '../model/hero';
import { drawHeroBust } from '../heroArt/bustIcon';
import { createDrawing, drawingToImage, type PixelDrawing } from './pixelDraw';

const INK = '#17110d';

function drawBackground(drawing: PixelDrawing, look: ClassLook): void {
  drawing.fill(look.background, 0, 0, 32, 32);
  for (let y = 0; y < 32; y += 2) {
    for (let x = (y / 2) % 2 === 0 ? 0 : 2; x < 32; x += 4) drawing.fill(look.backgroundShade, x, y, 2, 2);
  }
}

function drawBorder(drawing: PixelDrawing): void {
  drawing.fill(INK, 0, 0, 32, 1);
  drawing.fill(INK, 0, 31, 32, 1);
  drawing.fill(INK, 0, 0, 1, 32);
  drawing.fill(INK, 31, 0, 1, 32);
}

const portraitUrlCache = new Map<string, HTMLCanvasElement>();

function buildPortrait(classId: ClassId, heroName: string): PixelDrawing {
  const { look } = pickHeroAppearance(classId, heroName);
  const drawing = createDrawing(32, 32);
  drawBackground(drawing, look);
  drawing.canvas.getContext('2d')?.drawImage(drawHeroBust(classId, heroName), 0, 0);
  drawBorder(drawing);
  return drawing;
}

export function createPortrait(classId: ClassId, heroName: string, scale = 2): HTMLImageElement {
  const key = `${classId}:${heroName}`;
  let canvas = portraitUrlCache.get(key);
  if (!canvas) {
    canvas = buildPortrait(classId, heroName).canvas;
    portraitUrlCache.set(key, canvas);
  }
  return drawingToImage({ canvas, fill: () => undefined }, scale, 'pixel-portrait');
}
