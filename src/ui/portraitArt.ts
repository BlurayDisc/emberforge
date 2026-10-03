import { pickHeroAppearance, type ClassLook, type HeroGender } from '../content/heroAppearance';
import type { ClassId } from '../model/hero';
import { BUST_GEAR } from './bustGear';
import { createDrawing, drawingToImage, type PixelDrawing } from './pixelDraw';

const INK = '#17110d';

function drawBackground(drawing: PixelDrawing, look: ClassLook): void {
  drawing.fill(look.background, 0, 0, 32, 32);
  for (let y = 0; y < 32; y += 2) {
    for (let x = (y / 2) % 2 === 0 ? 0 : 2; x < 32; x += 4) drawing.fill(look.backgroundShade, x, y, 2, 2);
  }
}

function drawBust(drawing: PixelDrawing, look: ClassLook, skin: string, skinShade: string): void {
  if (look.slender) {
    drawing.fill(look.clothShade, 9, 25, 14, 2);
    drawing.fill(look.cloth, 10, 25, 12, 2);
    drawing.fill(look.clothShade, 6, 27, 20, 5);
    drawing.fill(look.cloth, 7, 27, 18, 5);
    drawing.fill(look.trim, 13, 24, 6, 2);
  } else {
    drawing.fill(look.clothShade, 3, 25, 26, 7);
    drawing.fill(look.cloth, 4, 25, 24, 7);
    drawing.fill(look.trim, 12, 24, 8, 2);
  }
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

const LASH = '#2a1a14';
const BLUSH = '#eaa0a0';

// Girls get long hair beside the face, lashes, blush and fuller lips. Boys get a firm jaw line.
function drawGenderDetails(drawing: PixelDrawing, gender: HeroGender, skinShade: string, hair: string): void {
  if (gender === 'female') {
    drawing.fill(hair, 8, 8, 2, 16);
    drawing.fill(hair, 22, 8, 2, 16);
    drawing.fill(hair, 10, 10, 1, 10);
    drawing.fill(hair, 21, 10, 1, 10);
    drawing.fill(LASH, 11, 12, 1, 1);
    drawing.fill(LASH, 20, 12, 1, 1);
    drawing.fill(BLUSH, 11, 16, 2, 1);
    drawing.fill(BLUSH, 19, 16, 2, 1);
    drawing.fill('#c8505a', 14, 18, 4, 1);
    drawing.fill('#d8707a', 15, 19, 2, 1);
    return;
  }
  drawing.fill(skinShade, 10, 19, 2, 1);
  drawing.fill(skinShade, 20, 19, 2, 1);
  drawing.fill(skinShade, 13, 19, 1, 1);
  drawing.fill(skinShade, 18, 19, 1, 1);
}

// Hair covers the lower cheeks, so a girl's face tapers to a small chin. It runs after the gear, which paints on the same pixels.
function slimBustJaw(drawing: PixelDrawing, hair: string): void {
  drawing.fill(hair, 11, 15, 1, 6);
  drawing.fill(hair, 20, 15, 1, 6);
  drawing.fill(hair, 12, 17, 1, 4);
  drawing.fill(hair, 19, 17, 1, 4);
}

// The outer end of each brow would touch the hair strip at the temple. One skin pixel keeps them apart.
function separateBustBrowsFromHair(drawing: PixelDrawing, skin: string): void {
  drawing.fill(skin, 11, 10, 1, 2);
  drawing.fill(skin, 20, 10, 1, 2);
}

function drawBorder(drawing: PixelDrawing): void {
  drawing.fill(INK, 0, 0, 32, 1);
  drawing.fill(INK, 0, 31, 32, 1);
  drawing.fill(INK, 0, 0, 1, 32);
  drawing.fill(INK, 31, 0, 1, 32);
}

const portraitUrlCache = new Map<string, HTMLCanvasElement>();

function buildPortrait(classId: ClassId, heroName: string): PixelDrawing {
  const appearance = pickHeroAppearance(classId, heroName);
  const { gender, skin, skinShade, hair, eye, look } = appearance;
  const drawing = createDrawing(32, 32);
  drawBackground(drawing, look);
  drawBust(drawing, look, skin, skinShade);
  drawFace(drawing, skinShade, eye, hair);
  drawGenderDetails(drawing, gender, skinShade, hair);
  BUST_GEAR[classId](drawing, appearance);
  if (gender === 'female') {
    slimBustJaw(drawing, hair);
    separateBustBrowsFromHair(drawing, skin);
  }
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
