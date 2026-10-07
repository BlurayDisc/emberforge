import { addOutline, createPixelCanvas, type PixelCanvas } from '../pixelCanvas';
import { ellipse, shadedBlob, type Hex, type Tones } from './creatureShading';

const SKIN: Tones = { base: '#6b8e3a', light: '#9cc25c', dark: '#3f5a22' };
const BELLY: Tones = { base: '#d8d49a', light: '#f0ecc0', dark: '#a8a46c' };
const WART_LIGHT: Hex = '#b4d86e';
const PATCH: Hex = '#546f2b';
const MOUTH_INSIDE: Hex = '#5a1f2a';
const TONGUE: Hex = '#e8708a';
const EYE_GOLD: Hex = '#ffd75e';
const EYE_RIM: Hex = '#a07a1c';
const PUPIL: Hex = '#17110d';
const TOOTH: Hex = '#f4efd8';

function drawHindLeg(art: PixelCanvas): void {
  shadedBlob(art, 27, 19, 7, 6, SKIN);
  art.fill(SKIN.dark, 21, 22, 3, 1);
  art.fill(SKIN.light, 24, 15, 4, 1);
  art.fill(SKIN.dark, 14, 25, 17, 2);
  art.fill(SKIN.base, 13, 24, 13, 2);
  art.fill(SKIN.light, 15, 24, 8, 1);
  for (const toeX of [10, 12, 14]) {
    art.fill(SKIN.base, toeX, 25, 2, 2);
    art.fill(SKIN.dark, toeX, 27, 2, 1);
    art.fill(SKIN.light, toeX, 25, 1, 1);
  }
  art.fill(SKIN.dark, 12, 24, 1, 1);
  art.fill(SKIN.dark, 14, 24, 1, 1);
  art.fill(SKIN.dark, 16, 25, 1, 1);
}

function drawFrontLeg(art: PixelCanvas): void {
  art.fill(SKIN.dark, 8, 20, 5, 7);
  art.fill(SKIN.base, 8, 20, 4, 6);
  art.fill(SKIN.light, 8, 20, 1, 4);
  for (const toeX of [3, 5, 7]) {
    art.fill(SKIN.base, toeX, 25, 2, 2);
    art.fill(SKIN.dark, toeX, 27, 2, 1);
  }
  art.fill(SKIN.base, 4, 24, 7, 2);
}

function drawBodyAndWarts(art: PixelCanvas): void {
  shadedBlob(art, 21, 14, 14, 9, SKIN);
  ellipse(art, 19, 20, 9, 3, BELLY.dark);
  ellipse(art, 18.5, 19.5, 8, 2, BELLY.base);
  for (const [patchX, patchY, patchW, patchH] of [[19, 8, 4, 2], [27, 10, 3, 3], [23, 14, 3, 2], [30, 15, 2, 2]] as const) {
    art.fill(PATCH, patchX, patchY, patchW, patchH);
  }
  for (const [wartX, wartY] of [[16, 7], [21, 6], [25, 8], [29, 12], [20, 11], [26, 13], [14, 11]] as const) {
    art.fill(WART_LIGHT, wartX, wartY, 2, 2);
    art.fill(SKIN.dark, wartX + 1, wartY + 2, 2, 1);
  }
  art.fill(SKIN.dark, 33, 17, 1, 2);
}

function drawHeadAndFace(art: PixelCanvas): void {
  shadedBlob(art, 9, 13, 8, 6, SKIN);
  art.fill(SKIN.dark, 1, 16, 14, 1);
  art.fill(MOUTH_INSIDE, 1, 17, 12, 2);
  art.fill(TONGUE, 2, 18, 5, 1);
  art.fill(SKIN.base, 1, 19, 12, 1);
  art.fill(BELLY.base, 3, 19, 8, 2);
  art.fill(BELLY.light, 4, 20, 4, 1);
  art.fill(BELLY.dark, 5, 21, 6, 1);
  art.fill(BELLY.base, 6, 21, 3, 1);
  art.fill(PUPIL, 0, 16, 1, 1);
  art.fill(PUPIL, 13, 15, 2, 1);
  art.fill(PUPIL, 15, 14, 1, 1);
  for (const toothX of [3, 6, 9]) art.fill(TOOTH, toothX, 17, 1, 1);
  art.fill(PUPIL, 3, 12, 1, 1);
  art.fill(SKIN.dark, 2, 13, 2, 1);
  for (const [eyeX, eyeY] of [[4, 4], [11, 4]] as const) {
    ellipse(art, eyeX + 2, eyeY + 2.5, 3.5, 3.5, SKIN.dark);
    ellipse(art, eyeX + 2, eyeY + 2, 3, 3, SKIN.base);
    ellipse(art, eyeX + 2, eyeY + 2, 2.5, 2.5, EYE_RIM);
    ellipse(art, eyeX + 2, eyeY + 2, 2, 2, EYE_GOLD);
    art.fill(PUPIL, eyeX + 2, eyeY + 1, 1, 3);
    art.fill('#ffffff', eyeX + 1, eyeY + 1, 1, 1);
  }
}

export function drawToad(): HTMLCanvasElement {
  const art = createPixelCanvas(38, 28);
  drawBodyAndWarts(art);
  drawFrontLeg(art);
  drawHindLeg(art);
  drawHeadAndFace(art);
  addOutline(art, 'outline');
  return art.canvas;
}
