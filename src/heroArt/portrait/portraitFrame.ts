import { addHeroOutline, createHeroCanvas, type HeroCanvas } from '../heroCanvas';
import { createSpritePainter, type SpritePainter } from '../spritePainter';

export const PORTRAIT_WIDTH = 40;
export const PORTRAIT_HEIGHT = 64;
export const PORTRAIT_CENTER_X = 19;
// The backdrop draws a floor line at y 58. The feet end one pixel above it.
const OUTLINE_MARGIN = 1;

export interface PortraitDrawing {
  art: HeroCanvas;
  painter: SpritePainter;
}

export function startPortrait(): PortraitDrawing {
  const art = createHeroCanvas(PORTRAIT_WIDTH, PORTRAIT_HEIGHT);
  return { art, painter: createSpritePainter(art, OUTLINE_MARGIN, OUTLINE_MARGIN) };
}

export function finishPortrait({ art }: PortraitDrawing): HTMLCanvasElement {
  addHeroOutline(art);
  return art.canvas;
}
