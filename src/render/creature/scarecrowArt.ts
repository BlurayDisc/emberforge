import { addOutline, createPixelCanvas, type PixelCanvas } from '../pixelCanvas';
import { shadedBlob, type Hex, type Tones } from './creatureShading';

const SACK: Tones = { base: '#c9b07a', light: '#e6d3a0', dark: '#8a7448' };
const SHIRT: Tones = { base: '#8f4f36', light: '#b57049', dark: '#58301f' };
const WOOD: Tones = { base: '#6a4a2a', light: '#8a6438', dark: '#3e2a18' };
const HAT: Tones = { base: '#5a4636', light: '#7a6048', dark: '#32261c' };
const STRAW: Tones = { base: '#d9b84a', light: '#f0d878', dark: '#9c7c2a' };
const PATCH: Tones = { base: '#4f7a3a', light: '#6f9a4e', dark: '#2f4c24' };
const STEEL: Tones = { base: '#9aa4ae', light: '#d4dbe2', dark: '#56606c' };
const INK: Hex = '#17110d';
const EYE_GLOW: Hex = '#ffb02e';
const EYE_CORE: Hex = '#fff2a0';

function dots(art: PixelCanvas, color: Hex, points: Array<[number, number]>): void {
  for (const [x, y] of points) art.fill(color, x, y, 1, 1);
}

function strawTuft(art: PixelCanvas, x: number, y: number, length: number, lean: number): void {
  for (let step = 0; step < length; step++) {
    const stepX = x + Math.round((lean * step) / 2);
    art.fill(step % 3 === 1 ? STRAW.dark : STRAW.base, stepX, y + step, 1, 1);
  }
  art.fill(STRAW.light, x, y, 1, 1);
}

function drawPole(art: PixelCanvas): void {
  art.fill(WOOD.dark, 15, 24, 3, 17);
  art.fill(WOOD.base, 15, 24, 2, 17);
  art.fill(WOOD.light, 15, 24, 1, 17);
  art.fill(WOOD.dark, 3, 16, 26, 3);
  art.fill(WOOD.base, 3, 16, 26, 2);
  art.fill(WOOD.light, 3, 16, 26, 1);
  dots(art, WOOD.dark, [[9, 17], [21, 17], [24, 16]]);
}

function drawSleevesAndStraw(art: PixelCanvas): void {
  art.fill(SHIRT.dark, 5, 15, 8, 5);
  art.fill(SHIRT.base, 5, 15, 8, 3);
  art.fill(SHIRT.light, 6, 15, 6, 1);
  art.fill(SHIRT.dark, 20, 15, 7, 5);
  art.fill(SHIRT.base, 20, 15, 7, 3);
  art.fill(PATCH.base, 7, 17, 3, 2);
  dots(art, INK, [[7, 17], [9, 18], [24, 18]]);
  dots(art, SHIRT.dark, [[5, 20], [7, 20], [9, 20], [22, 20], [24, 20], [26, 20]]);
  strawTuft(art, 3, 15, 5, -1);
  strawTuft(art, 4, 18, 5, -1);
  strawTuft(art, 5, 20, 4, 0);
  strawTuft(art, 8, 20, 3, 0);
  strawTuft(art, 26, 19, 3, 1);
  strawTuft(art, 24, 20, 4, 0);
  strawTuft(art, 22, 20, 3, 0);
  strawTuft(art, 11, 20, 3, 0);
  strawTuft(art, 2, 17, 4, -1);
}

function drawShirt(art: PixelCanvas): void {
  art.fill(SHIRT.dark, 10, 18, 13, 14);
  art.fill(SHIRT.base, 10, 18, 11, 13);
  art.fill(SHIRT.light, 11, 18, 5, 6);
  art.fill(SHIRT.light, 11, 24, 2, 3);
  art.fill(SHIRT.dark, 18, 22, 4, 9);
  art.fill(PATCH.base, 12, 26, 4, 4);
  art.fill(PATCH.light, 12, 26, 4, 1);
  art.fill(PATCH.dark, 12, 29, 4, 1);
  dots(art, INK, [[12, 27], [14, 27], [13, 28], [15, 28]]);
  art.fill('#7a6a8a', 19, 20, 3, 3);
  dots(art, INK, [[19, 20], [21, 22]]);
  art.fill(SHIRT.dark, 10, 31, 13, 1);
  art.fill(INK, 16, 18, 1, 5);
  for (const [x, depth] of [[10, 2], [12, 4], [14, 2], [16, 3], [18, 5], [20, 2], [22, 3]] as const) {
    art.fill(SHIRT.dark, x, 32, 2, depth - 1);
  }
}

function drawHemStraw(art: PixelCanvas): void {
  strawTuft(art, 9, 31, 5, -1);
  strawTuft(art, 11, 33, 5, -1);
  strawTuft(art, 13, 34, 4, 0);
  strawTuft(art, 19, 34, 4, 1);
  strawTuft(art, 21, 33, 5, 1);
  strawTuft(art, 23, 31, 4, 1);
  strawTuft(art, 17, 35, 3, 0);
}

function drawHead(art: PixelCanvas): void {
  art.fill(SACK.dark, 13, 15, 7, 2);
  shadedBlob(art, 16, 11, 6.5, 6, SACK);
  dots(art, SACK.dark, [[11, 7], [21, 12], [20, 8]]);
  art.fill(INK, 10, 8, 5, 4);
  art.fill(INK, 17, 8, 5, 4);
  art.fill(EYE_GLOW, 11, 9, 3, 2);
  art.fill(EYE_GLOW, 18, 9, 3, 2);
  dots(art, EYE_CORE, [[12, 9], [19, 9]]);
  art.fill(INK, 15, 11, 2, 2);
  art.fill(INK, 11, 13, 11, 1);
  dots(art, INK, [[10, 12], [22, 12]]);
  for (const stitchX of [12, 14, 16, 18, 20]) dots(art, INK, [[stitchX, 12], [stitchX, 14]]);
  for (const toothX of [13, 15, 17, 19]) dots(art, SACK.light, [[toothX, 13]]);
  art.fill(INK, 21, 6, 1, 3);
  dots(art, INK, [[20, 6], [22, 6], [20, 8], [22, 8]]);
}

function drawHat(art: PixelCanvas): void {
  art.fill(HAT.dark, 7, 6, 19, 3);
  art.fill(HAT.base, 7, 6, 18, 2);
  art.fill(HAT.light, 8, 6, 8, 1);
  art.fill(HAT.dark, 11, 1, 11, 6);
  art.fill(HAT.base, 11, 1, 9, 5);
  art.fill(HAT.light, 11, 1, 5, 2);
  art.fill(HAT.dark, 19, 0, 3, 2);
  art.fill('#a8322a', 11, 5, 11, 1);
  art.fill('#6e1c18', 11, 6, 11, 1);
  art.fill(STRAW.base, 14, 3, 3, 2);
  dots(art, INK, [[14, 3], [16, 4]]);
  dots(art, INK, [[9, 8], [24, 8], [7, 8]]);
  strawTuft(art, 7, 7, 3, -1);
  strawTuft(art, 24, 7, 3, 1);
  dots(art, STRAW.base, [[22, 4], [23, 3]]);
}

function drawCrow(art: PixelCanvas): void {
  const crow: Tones = { base: '#2a2a3a', light: '#4a4a62', dark: '#14141e' };
  art.fill(crow.dark, 3, 11, 6, 5);
  art.fill(crow.base, 3, 11, 5, 4);
  art.fill(crow.light, 4, 11, 3, 1);
  art.fill(crow.base, 1, 8, 4, 4);
  art.fill(crow.light, 1, 8, 2, 1);
  art.fill('#d98a2a', 0, 10, 1, 1);
  dots(art, EYE_GLOW, [[3, 9]]);
  art.fill(crow.dark, 8, 13, 3, 2);
  dots(art, '#d98a2a', [[5, 16], [7, 16]]);
}

function drawSickle(art: PixelCanvas): void {
  art.fill(STRAW.base, 25, 16, 4, 4);
  art.fill(STRAW.dark, 25, 19, 4, 1);
  art.fill(WOOD.dark, 27, 8, 2, 11);
  art.fill(WOOD.light, 27, 8, 1, 11);
  art.fill(STEEL.dark, 24, 3, 6, 2);
  art.fill(STEEL.base, 22, 2, 7, 2);
  art.fill(STEEL.light, 22, 2, 6, 1);
  art.fill(STEEL.dark, 21, 3, 2, 4);
  art.fill(STEEL.base, 21, 3, 1, 3);
  art.fill(STEEL.dark, 27, 5, 2, 3);
  dots(art, STEEL.light, [[24, 2], [26, 2]]);
}

export function drawScarecrow(): HTMLCanvasElement {
  const art = createPixelCanvas(32, 40);
  drawPole(art);
  drawCrow(art);
  drawSleevesAndStraw(art);
  drawShirt(art);
  drawHemStraw(art);
  drawHead(art);
  drawHat(art);
  drawSickle(art);
  addOutline(art, 'outline');
  return art.canvas;
}
