import { pickHeroAppearance, type ClassLook } from '../content/heroAppearance';
import type { ClassId } from '../model/hero';
import { createDrawing, drawingToImage, type PixelDrawing } from './pixelDraw';

const INK = '#17110d';

function drawBackground(drawing: PixelDrawing, look: ClassLook): void {
  drawing.fill(look.background, 0, 0, 32, 32);
  for (let y = 0; y < 32; y += 2) {
    for (let x = (y / 2) % 2 === 0 ? 0 : 2; x < 32; x += 4) drawing.fill(look.backgroundShade, x, y, 2, 2);
  }
}

function drawBust(drawing: PixelDrawing, look: ClassLook, skin: string, skinShade: string): void {
  drawing.fill(look.clothShade, 3, 25, 26, 7);
  drawing.fill(look.cloth, 4, 25, 24, 7);
  drawing.fill(look.trim, 12, 24, 8, 2);
  drawing.fill(skinShade, 13, 20, 6, 5);
  drawing.fill(skin, 11, 7, 10, 1);
  drawing.fill(skin, 10, 8, 12, 12);
  drawing.fill(skin, 11, 20, 10, 1);
  drawing.fill(skinShade, 9, 13, 1, 4);
  drawing.fill(skinShade, 22, 13, 1, 4);
}

function drawFace(drawing: PixelDrawing, skinShade: string, eye: string, hair: string): void {
  drawing.fill('#ffffff', 12, 13, 3, 2);
  drawing.fill('#ffffff', 17, 13, 3, 2);
  drawing.fill(eye, 13, 13, 1, 2);
  drawing.fill(eye, 18, 13, 1, 2);
  drawing.fill(hair, 12, 12, 3, 1);
  drawing.fill(hair, 17, 12, 3, 1);
  drawing.fill(skinShade, 15, 15, 2, 2);
  drawing.fill('#8a3a3a', 14, 18, 4, 1);
}

function drawHair(drawing: PixelDrawing, hair: string): void {
  drawing.fill(hair, 10, 6, 12, 3);
  drawing.fill(hair, 9, 8, 2, 6);
  drawing.fill(hair, 21, 8, 2, 6);
}

const DRAW_GEAR: Record<ClassId, (drawing: PixelDrawing, look: ClassLook, hair: string) => void> = {
  warrior: (drawing, look) => {
    drawing.fill(look.cloth, 9, 4, 14, 5);
    drawing.fill(look.clothShade, 9, 8, 3, 9);
    drawing.fill(look.clothShade, 20, 8, 3, 9);
    drawing.fill(look.clothShade, 15, 9, 2, 8);
    drawing.fill(look.trim, 9, 8, 14, 1);
    drawing.fill('#b23a3a', 14, 0, 4, 5);
    drawing.fill('#d86a6a', 15, 0, 1, 4);
  },
  archer: (drawing, look, hair) => {
    drawing.fill(hair, 10, 7, 12, 2);
    drawing.fill(look.cloth, 8, 3, 16, 5);
    drawing.fill(look.cloth, 7, 7, 4, 15);
    drawing.fill(look.cloth, 21, 7, 4, 15);
    drawing.fill(look.clothShade, 10, 7, 1, 10);
    drawing.fill(look.clothShade, 21, 7, 1, 10);
    drawing.fill('#b23a3a', 22, 1, 2, 7);
    drawing.fill('#ffffff', 22, 0, 2, 2);
  },
  mage: (drawing, look, hair) => {
    drawHair(drawing, hair);
    drawing.fill(hair, 8, 12, 2, 9);
    drawing.fill(hair, 22, 12, 2, 9);
    drawing.fill(look.clothShade, 5, 8, 22, 2);
    drawing.fill(look.cloth, 10, 5, 12, 3);
    drawing.fill(look.cloth, 12, 3, 8, 2);
    drawing.fill(look.cloth, 14, 1, 4, 2);
    drawing.fill(look.cloth, 16, 0, 2, 1);
    drawing.fill(look.trim, 10, 7, 12, 1);
  },
  priest: (drawing, look, hair) => {
    drawHair(drawing, hair);
    drawing.fill(look.cloth, 9, 4, 14, 4);
    drawing.fill(look.clothShade, 9, 7, 14, 1);
    drawing.fill(look.trim, 10, 0, 12, 1);
    drawing.fill(look.trim, 9, 1, 1, 2);
    drawing.fill(look.trim, 22, 1, 1, 2);
    drawing.fill(look.trim, 14, 5, 4, 2);
  },
  thief: (drawing, look) => {
    drawing.fill(look.cloth, 8, 3, 16, 6);
    drawing.fill(look.cloth, 7, 8, 4, 14);
    drawing.fill(look.cloth, 21, 8, 4, 14);
    drawing.fill(look.clothShade, 8, 8, 16, 2);
    drawing.fill(look.cloth, 10, 16, 12, 5);
    drawing.fill(look.clothShade, 10, 16, 12, 1);
    drawing.fill(look.trim, 12, 21, 8, 1);
  },
  barbarian: (drawing, look) => {
    drawing.fill(look.cloth, 9, 4, 14, 4);
    drawing.fill(look.clothShade, 9, 7, 14, 1);
    drawing.fill('#c0c8d0', 6, 1, 3, 6);
    drawing.fill('#c0c8d0', 23, 1, 3, 6);
    drawing.fill(look.clothShade, 8, 20, 16, 3);
    drawing.fill(look.trim, 10, 21, 12, 1);
  },
  fighter: (drawing, look) => {
    drawing.fill('#b23a3a', 9, 6, 14, 2);
    drawing.fill('#b23a3a', 22, 7, 3, 6);
    drawing.fill(look.cloth, 9, 20, 14, 3);
    drawing.fill(look.clothShade, 9, 22, 14, 1);
    drawing.fill(look.trim, 14, 20, 4, 1);
  },
};

function drawBorder(drawing: PixelDrawing): void {
  drawing.fill(INK, 0, 0, 32, 1);
  drawing.fill(INK, 0, 31, 32, 1);
  drawing.fill(INK, 0, 0, 1, 32);
  drawing.fill(INK, 31, 0, 1, 32);
}

const portraitUrlCache = new Map<string, HTMLCanvasElement>();

function buildPortrait(classId: ClassId, heroName: string): PixelDrawing {
  const { skin, skinShade, hair, eye, look } = pickHeroAppearance(classId, heroName);
  const drawing = createDrawing(32, 32);
  drawBackground(drawing, look);
  drawBust(drawing, look, skin, skinShade);
  drawFace(drawing, skinShade, eye, hair);
  DRAW_GEAR[classId](drawing, look, hair);
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
