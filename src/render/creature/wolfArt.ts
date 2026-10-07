import { addOutline, createPixelCanvas, type PixelCanvas } from '../pixelCanvas';
import type { Hex, Tones } from './creatureShading';

type Point = [number, number];

const FUR: Tones = { base: '#7c7f8e', light: '#a9adbd', dark: '#4a4c5c' };
const FAR_FUR: Tones = { base: '#5a5c6c', light: '#767989', dark: '#363847' };
const JAW: Tones = { base: '#6a6d7d', light: '#8e91a2', dark: '#3e4050' };
const PALE: Tones = { base: '#cfc9bb', light: '#ece7d9', dark: '#9d9686' };
const EAR_INNER: Hex = '#7a4a4a';
const MOUTH: Hex = '#6a1c24';
const FANG: Hex = '#f6f2e4';
const EYE: Hex = '#ffd23e';
const EYE_CORE: Hex = '#ff7a1c';
const NOSE: Hex = '#17110d';

function isInside(polygon: Point[], pointX: number, pointY: number): boolean {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
    const [currentX, currentY] = polygon[current] as Point;
    const [previousX, previousY] = polygon[previous] as Point;
    const crosses = currentY > pointY !== previousY > pointY
      && pointX < ((previousX - currentX) * (pointY - currentY)) / (previousY - currentY) + currentX;
    if (crosses) inside = !inside;
  }
  return inside;
}

function maskOf(polygon: Point[], width: number, height: number): boolean[][] {
  const mask: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    mask.push([]);
    for (let x = 0; x < width; x++) mask[y]?.push(isInside(polygon, x + 0.5, y + 0.5));
  }
  return mask;
}

function maskAt(mask: boolean[][], x: number, y: number): boolean {
  return mask[y]?.[x] === true;
}

// Light comes from the top-left: edges facing up-left get the light tone, edges facing down-right the dark tone.
function paintShadedPolygon(art: PixelCanvas, polygon: Point[], tones: Tones, width: number, height: number): boolean[][] {
  const mask = maskOf(polygon, width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!maskAt(mask, x, y)) continue;
      const litEdge = !maskAt(mask, x, y - 1) || !maskAt(mask, x - 1, y) || !maskAt(mask, x - 1, y - 1) || !maskAt(mask, x, y - 2);
      const shadowEdge = !maskAt(mask, x, y + 1) || !maskAt(mask, x + 1, y) || !maskAt(mask, x + 1, y + 1) || !maskAt(mask, x, y + 2);
      const color = litEdge && !shadowEdge ? tones.light : shadowEdge ? tones.dark : tones.base;
      art.fill(color, x, y, 1, 1);
    }
  }
  return mask;
}

export function drawWolf(): HTMLCanvasElement {
  const width = 44;
  const height = 33;
  const art = createPixelCanvas(width, height);
  const paint = (polygon: Point[], tones: Tones): void => {
    paintShadedPolygon(art, polygon, tones, width, height);
  };

  paint([[19, 18], [23, 18], [23, 24], [22, 27], [24, 31], [16, 31], [17, 28], [19, 25]], FAR_FUR);
  paint([[24, 19], [29, 19], [29, 24], [27, 27], [28, 31], [21, 31], [22, 28], [25, 25]], FAR_FUR);

  paint([[36, 11], [39, 9], [42, 12], [43, 18], [41, 24], [38, 25], [39, 20], [37, 16]], FUR);
  art.fill(FUR.dark, 40, 22, 1, 1);
  art.fill(PALE.base, 40, 24, 2, 1);

  paint([[12, 12], [16, 8], [22, 8], [28, 9], [34, 10], [38, 14], [38, 20], [33, 23], [24, 23], [16, 22], [12, 18]], FUR);
  for (const [tuftX, tuftY] of [[15, 7], [19, 6], [24, 7], [29, 8], [33, 8], [36, 10]] as Point[]) {
    art.fill(FUR.light, tuftX, tuftY, 2, 2);
    art.fill(FUR.base, tuftX + 1, tuftY + 1, 1, 1);
  }
  for (const [tuftX, tuftY] of [[13, 21], [17, 23], [22, 24]] as Point[]) art.fill(PALE.dark, tuftX, tuftY, 2, 1);
  paint([[15, 19], [24, 20], [30, 21], [30, 23], [22, 24], [16, 23]], PALE);
  paint([[27, 12], [33, 11], [38, 15], [38, 20], [33, 24], [28, 22], [26, 17]], { base: '#8b8e9e', light: '#b4b8c8', dark: '#585a6b' });
  art.fill('#a9adbd', 29, 14, 1, 3);
  art.fill('#a9adbd', 31, 16, 1, 3);
  art.fill('#4a4c5c', 25, 12, 2, 1);
  art.fill('#4a4c5c', 22, 11, 2, 1);

  paint([[13, 17], [19, 17], [19, 24], [18, 27], [20, 30], [20, 32], [11, 32], [12, 29], [14, 27], [14, 23]], FUR);
  art.fill(PALE.base, 11, 30, 9, 2);
  art.fill(PALE.dark, 14, 31, 1, 1);
  art.fill(PALE.dark, 17, 31, 1, 1);
  art.fill(PALE.light, 11, 30, 3, 1);
  paint([[29, 17], [36, 17], [36, 23], [34, 27], [35, 30], [36, 32], [28, 32], [29, 29], [31, 26], [29, 22]], FUR);
  art.fill(PALE.base, 28, 30, 8, 2);
  art.fill(PALE.dark, 31, 31, 1, 1);
  art.fill(PALE.dark, 34, 31, 1, 1);
  art.fill(PALE.light, 28, 30, 3, 1);

  paint([[10, 8], [17, 4], [19, 9], [14, 11]], FAR_FUR);
  paint([[10, 11], [14, 9], [16, 14], [14, 22], [8, 22]], FUR);

  paint([[1, 19], [9, 20], [13, 22], [11, 25], [6, 25], [2, 22]], JAW);
  art.fill(MOUTH, 2, 18, 9, 2);
  paint([[7, 9], [10, 1], [14, 4], [17, 9], [12, 11]], FUR);
  art.fill(EAR_INNER, 11, 4, 1, 3);
  art.fill(EAR_INNER, 12, 6, 2, 2);
  art.fill(FUR.dark, 7, 9, 5, 1);
  paint([[4, 10], [8, 8], [13, 9], [15, 14], [13, 19], [8, 19], [3, 18], [0, 17], [0, 14], [2, 12]], FUR);
  paint([[0, 14], [3, 15], [8, 16], [10, 19], [3, 19], [0, 17]], PALE);
  art.fill(FUR.dark, 15, 11, 1, 7);
  art.fill(NOSE, 0, 14, 2, 2);
  art.fill(FUR.dark, 3, 12, 4, 1);
  art.fill(FUR.dark, 5, 10, 4, 1);
  art.fill(FUR.dark, 9, 12, 1, 4);
  art.fill(FANG, 2, 18, 1, 3);
  art.fill(FANG, 5, 18, 1, 2);
  art.fill(FANG, 9, 18, 1, 2);
  art.fill(FANG, 4, 17, 1, 1);
  art.fill(FANG, 4, 20, 1, 0);
  art.fill(FANG, 3, 19, 1, 0);
  art.fill(FANG, 7, 20, 1, 1);
  art.fill(FANG, 4, 19, 1, 1);
  art.fill(EYE, 6, 12, 3, 2);
  art.fill(EYE_CORE, 7, 12, 1, 2);
  art.fill(NOSE, 6, 11, 4, 1);
  art.fill(FUR.light, 5, 9, 4, 1);
  art.fill(FUR.dark, 5, 17, 3, 1);

  addOutline(art, 'outline');
  return art.canvas;
}
