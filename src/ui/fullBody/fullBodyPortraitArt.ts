import { pickHeroAppearance, type ClassLook } from '../../content/heroAppearance';
import { drawHeroPortraitFigure } from '../../heroArt/portraitFigure';
import type { ClassId } from '../../model/hero';
import { createDrawing, drawingToImage, type PixelDrawing } from '../pixelDraw';
import { FIGURE_HEIGHT, FIGURE_WIDTH, INK } from './figureColors';

const FLOOR_TOP = 58;

function drawBackdrop(drawing: PixelDrawing, look: ClassLook): void {
  drawing.fill(look.background, 0, 0, FIGURE_WIDTH, FIGURE_HEIGHT);
  for (let y = 0; y < FLOOR_TOP; y += 2) {
    for (let x = (y / 2) % 2 === 0 ? 0 : 2; x < FIGURE_WIDTH; x += 4) drawing.fill(look.backgroundShade, x, y, 2, 2);
  }
  drawing.fill(look.backgroundShade, 1, FLOOR_TOP, FIGURE_WIDTH - 2, FIGURE_HEIGHT - FLOOR_TOP - 1);
  drawing.fill(INK, 1, FLOOR_TOP, FIGURE_WIDTH - 2, 1);
}

function drawBorder(drawing: PixelDrawing): void {
  drawing.fill(INK, 0, 0, FIGURE_WIDTH, 1);
  drawing.fill(INK, 0, FIGURE_HEIGHT - 1, FIGURE_WIDTH, 1);
  drawing.fill(INK, 0, 0, 1, FIGURE_HEIGHT);
  drawing.fill(INK, FIGURE_WIDTH - 1, 0, 1, FIGURE_HEIGHT);
}

export function buildFullBodyPortrait(classId: ClassId, heroName: string): HTMLCanvasElement {
  const appearance = pickHeroAppearance(classId, heroName);
  const figureCanvas = drawHeroPortraitFigure(classId, heroName);

  const portrait = createDrawing(FIGURE_WIDTH, FIGURE_HEIGHT);
  drawBackdrop(portrait, appearance.look);
  portrait.canvas.getContext('2d')?.drawImage(figureCanvas, 0, 0);
  drawBorder(portrait);
  return portrait.canvas;
}

const fullBodyCache = new Map<string, HTMLCanvasElement>();

export function createFullBodyPortrait(classId: ClassId, heroName: string, scale = 3): HTMLImageElement {
  const key = `${classId}:${heroName}`;
  let canvas = fullBodyCache.get(key);
  if (!canvas) {
    canvas = buildFullBodyPortrait(classId, heroName);
    fullBodyCache.set(key, canvas);
  }
  return drawingToImage({ canvas, fill: () => undefined }, scale, 'pixel-portrait');
}
