import { addOutline, createPixelCanvas, type PixelCanvas } from './pixelCanvas';

export type AnimalKind = 'cat' | 'dog' | 'hen';
// Walking frames face right. The rest pose is a sitting cat, a lying dog or a pecking hen.
export type AnimalPose = 'stepA' | 'stepB' | 'rest';
type HexColor = `#${string}`;

export interface AnimalCoat {
  body: HexColor;
  accent: HexColor;
}

const DRAWN_SIZES: Record<AnimalKind, { width: number; height: number }> = {
  cat: { width: 12, height: 10 },
  dog: { width: 14, height: 10 },
  hen: { width: 9, height: 9 },
};

export const ANIMAL_COATS: Record<AnimalKind, readonly AnimalCoat[]> = {
  cat: [
    { body: '#d08a3a', accent: '#f0d9a8' },
    { body: '#7a8294', accent: '#e8e0d0' },
    { body: '#2e2a33', accent: '#6f7a8c' },
    { body: '#e8e0d0', accent: '#d08a3a' },
  ],
  dog: [
    { body: '#8a5a2a', accent: '#c9a24e' },
    { body: '#c9a24e', accent: '#f0e6c8' },
    { body: '#2e2a33', accent: '#a0643a' },
    { body: '#e8e0d0', accent: '#8a5a2a' },
  ],
  hen: [
    { body: '#e8e0d0', accent: '#c9a24e' },
    { body: '#a0643a', accent: '#6a3f22' },
    { body: '#2f2a2a', accent: '#58607a' },
  ],
};

const EYE: HexColor = '#17110d';
const COLLAR: HexColor = '#b23a3a';
const COMB: HexColor = '#b23a3a';
const BEAK_AND_LEGS: HexColor = '#d9a23a';

function drawCat(art: PixelCanvas, { body, accent }: AnimalCoat, pose: AnimalPose): void {
  if (pose === 'rest') {
    art.fill(body, 3, 0, 1, 1);
    art.fill(body, 7, 0, 1, 1);
    art.fill(body, 3, 1, 5, 3);
    art.fill(EYE, 4, 2, 1, 1);
    art.fill(EYE, 6, 2, 1, 1);
    art.fill(body, 3, 4, 5, 5);
    art.fill(accent, 4, 5, 3, 3);
    art.fill(body, 8, 8, 3, 1);
    art.fill(accent, 10, 7, 1, 1);
    return;
  }
  const isStepA = pose === 'stepA';
  art.fill(accent, 1, 0, 1, 1);
  art.fill(body, 1, 1, 1, 4);
  art.fill(body, 2, 4, 7, 3);
  art.fill(body, 8, 2, 4, 4);
  art.fill(body, 8, 1, 1, 1);
  art.fill(body, 11, 1, 1, 1);
  art.fill(EYE, 10, 3, 1, 1);
  art.fill(body, 3, 7, 1, isStepA ? 2 : 1);
  art.fill(body, 4, 7, 1, isStepA ? 1 : 2);
  art.fill(body, 7, 7, 1, isStepA ? 1 : 2);
  art.fill(body, 8, 7, 1, isStepA ? 2 : 1);
  art.fill(accent, isStepA ? 3 : 4, 8, 1, 1);
  art.fill(accent, isStepA ? 8 : 7, 8, 1, 1);
}

function drawDog(art: PixelCanvas, { body, accent }: AnimalCoat, pose: AnimalPose): void {
  if (pose === 'rest') {
    art.fill(body, 0, 6, 2, 1);
    art.fill(body, 2, 5, 8, 3);
    art.fill(accent, 4, 7, 5, 1);
    art.fill(COLLAR, 8, 5, 1, 3);
    art.fill(body, 9, 3, 4, 4);
    art.fill(accent, 12, 5, 2, 2);
    art.fill(EYE, 13, 5, 1, 1);
    art.fill(EYE, 11, 4, 1, 1);
    art.fill(accent, 9, 3, 1, 3);
    art.fill(accent, 10, 7, 3, 1);
    return;
  }
  const isStepA = pose === 'stepA';
  art.fill(body, 1, 1, 1, 2);
  art.fill(body, 2, 2, 1, 2);
  art.fill(body, 3, 3, 7, 4);
  art.fill(accent, 4, 6, 5, 1);
  art.fill(COLLAR, 8, 3, 1, 3);
  art.fill(body, 9, 1, 4, 4);
  art.fill(accent, 12, 3, 2, 2);
  art.fill(EYE, 13, 3, 1, 1);
  art.fill(EYE, 11, 2, 1, 1);
  art.fill(accent, 9, 1, 1, 3);
  art.fill(body, 3, 7, 1, isStepA ? 3 : 2);
  art.fill(body, 5, 7, 1, isStepA ? 2 : 3);
  art.fill(body, 8, 7, 1, isStepA ? 2 : 3);
  art.fill(body, 9, 7, 1, isStepA ? 3 : 2);
}

function drawHen(art: PixelCanvas, { body, accent }: AnimalCoat, pose: AnimalPose): void {
  art.fill(body, 0, 2, 2, 3);
  art.fill(body, 2, 3, 5, 4);
  art.fill(accent, 3, 4, 3, 2);
  if (pose === 'rest') {
    art.fill(body, 6, 3, 2, 2);
    art.fill(COMB, 6, 2, 1, 1);
    art.fill(body, 7, 5, 2, 1);
    art.fill(BEAK_AND_LEGS, 8, 6, 1, 1);
    art.fill(BEAK_AND_LEGS, 3, 7, 1, 2);
    art.fill(BEAK_AND_LEGS, 5, 7, 1, 2);
    return;
  }
  const isStepA = pose === 'stepA';
  art.fill(body, 6, 1, 2, 3);
  art.fill(COMB, 6, 0, 2, 1);
  art.fill(BEAK_AND_LEGS, 8, 2, 1, 1);
  art.fill(EYE, 7, 2, 1, 1);
  art.fill(BEAK_AND_LEGS, 3, 7, 1, isStepA ? 2 : 1);
  art.fill(BEAK_AND_LEGS, 5, 7, 1, isStepA ? 1 : 2);
}

const ANIMAL_DRAWERS: Record<AnimalKind, (art: PixelCanvas, coat: AnimalCoat, pose: AnimalPose) => void> = {
  cat: drawCat,
  dog: drawDog,
  hen: drawHen,
};

// One empty pixel around the drawing leaves room for the outline.
const OUTLINE_MARGIN = 1;

export function animalSpriteSize(kind: AnimalKind): { width: number; height: number } {
  const { width, height } = DRAWN_SIZES[kind];
  return { width: width + OUTLINE_MARGIN * 2, height: height + OUTLINE_MARGIN * 2 };
}

export function drawAnimalFrame(kind: AnimalKind, coat: AnimalCoat, pose: AnimalPose): HTMLCanvasElement {
  const { width, height } = animalSpriteSize(kind);
  const art = createPixelCanvas(width, height);
  const insideMargin: PixelCanvas = { ...art, fill: (color, x, y, fillWidth, fillHeight) => art.fill(color, x + OUTLINE_MARGIN, y + OUTLINE_MARGIN, fillWidth, fillHeight) };
  ANIMAL_DRAWERS[kind](insideMargin, coat, pose);
  addOutline(art, 'outline');
  return art.canvas;
}

export function mirrorHorizontally(source: HTMLCanvasElement): HTMLCanvasElement {
  const art = createPixelCanvas(source.width, source.height);
  art.context.translate(source.width, 0);
  art.context.scale(-1, 1);
  art.context.drawImage(source, 0, 0);
  return art.canvas;
}
