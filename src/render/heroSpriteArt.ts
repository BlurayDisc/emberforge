import { pickHeroAppearance, type ClassLook } from '../content/heroAppearance';
import type { ClassId } from '../model/hero';
import { addOutline, createPixelCanvas, type PixelCanvas } from './pixelCanvas';

type Hex = `#${string}`;
type Paint = (color: Hex, x: number, y: number, width: number, height: number) => void;

const BOOT_COLOR: Hex = '#3a2a1e';
const WOOD: Hex = '#8a6340';
const STEEL: Hex = '#c0c8d0';
const STEEL_DARK: Hex = '#6f7a8c';
const GOLD: Hex = '#f2c14e';
const RED: Hex = '#b23a3a';

function drawBody(paint: Paint, look: ClassLook): void {
  paint(look.clothShade as Hex, 8, 25, 3, 7);
  paint(look.clothShade as Hex, 13, 25, 3, 7);
  paint(BOOT_COLOR, 7, 31, 4, 3);
  paint(BOOT_COLOR, 13, 31, 4, 3);
  paint(look.cloth as Hex, 6, 13, 12, 12);
  paint(look.clothShade as Hex, 6, 22, 12, 3);
  paint(look.trim as Hex, 6, 21, 12, 1);
  paint(look.cloth as Hex, 3, 14, 3, 8);
  paint(look.cloth as Hex, 18, 14, 3, 8);
}

function drawHead(paint: Paint, skin: Hex, skinShade: Hex, eye: Hex, hair: Hex): void {
  paint(skin, 10, 4, 6, 1);
  paint(skinShade, 10, 12, 4, 2);
  paint(skin, 8, 5, 8, 8);
  paint(skinShade, 8, 12, 8, 1);
  paint('#ffffff', 9, 7, 2, 2);
  paint('#ffffff', 13, 7, 2, 2);
  paint(eye, 10, 7, 1, 2);
  paint(eye, 14, 7, 1, 2);
  paint(hair, 9, 6, 2, 1);
  paint(hair, 13, 6, 2, 1);
  paint('#8a3a3a', 12, 11, 3, 1);
  paint(skin, 3, 22, 3, 2);
  paint(skin, 18, 22, 3, 2);
}

const DRAW_GEAR: Record<ClassId, (paint: Paint, look: ClassLook, hair: Hex) => void> = {
  warrior: (paint, look) => {
    paint(look.cloth as Hex, 7, 2, 10, 5);
    paint(look.clothShade as Hex, 7, 6, 10, 1);
    paint(look.clothShade as Hex, 7, 6, 2, 6);
    paint(RED, 10, 0, 4, 3);
    paint(STEEL, 21, 6, 2, 16);
    paint('#ffffff', 21, 6, 1, 14);
    paint(GOLD, 19, 21, 6, 1);
    paint(WOOD, 21, 22, 2, 3);
    paint(look.cloth as Hex, 0, 15, 6, 9);
    paint(look.clothShade as Hex, 0, 22, 6, 2);
    paint(GOLD, 2, 18, 2, 3);
  },
  archer: (paint, look, hair) => {
    paint(hair, 8, 5, 8, 2);
    paint(look.cloth as Hex, 7, 2, 10, 5);
    paint(look.cloth as Hex, 7, 5, 2, 8);
    paint(look.clothShade as Hex, 7, 5, 1, 8);
    paint(WOOD, 2, 11, 1, 2);
    paint(WOOD, 1, 13, 1, 7);
    paint(WOOD, 2, 20, 1, 2);
    paint('#d8d4cc', 3, 11, 1, 11);
    paint(WOOD, 17, 12, 3, 9);
    paint(RED, 18, 10, 1, 2);
  },
  mage: (paint, look, hair) => {
    paint(hair, 7, 8, 2, 6);
    paint(hair, 15, 8, 2, 6);
    paint(look.clothShade as Hex, 5, 3, 14, 2);
    paint(look.cloth as Hex, 8, 0, 8, 3);
    paint(GOLD, 8, 3, 8, 1);
    paint(WOOD, 21, 6, 1, 26);
    paint('#5a8fe0', 19, 1, 5, 5);
    paint('#c8d8ff', 20, 2, 2, 2);
  },
  priest: (paint, look, hair) => {
    paint(hair, 7, 8, 2, 5);
    paint(look.cloth as Hex, 7, 3, 10, 4);
    paint(look.clothShade as Hex, 7, 6, 10, 1);
    paint(GOLD, 7, 0, 10, 1);
    paint(GOLD, 6, 1, 1, 2);
    paint(GOLD, 17, 1, 1, 2);
    paint(WOOD, 21, 11, 1, 14);
    paint(STEEL, 19, 6, 5, 5);
    paint(STEEL_DARK, 19, 10, 5, 1);
  },
  thief: (paint, look) => {
    paint(look.cloth as Hex, 7, 2, 10, 5);
    paint(look.cloth as Hex, 7, 5, 2, 8);
    paint(look.clothShade as Hex, 8, 11, 8, 3);
    paint(RED, 8, 14, 8, 1);
    paint(STEEL, 21, 16, 1, 6);
    paint(GOLD, 20, 22, 3, 1);
    paint(WOOD, 21, 23, 1, 2);
  },
};

export function drawHeroSprite(classId: ClassId, heroName: string): HTMLCanvasElement {
  const { skin, skinShade, hair, eye, look } = pickHeroAppearance(classId, heroName);
  const art: PixelCanvas = createPixelCanvas(26, 36);
  const paint: Paint = (color, x, y, width, height) => art.fill(color, x + 1, y + 1, width, height);
  drawBody(paint, look);
  drawHead(paint, skin as Hex, skinShade as Hex, eye as Hex, hair as Hex);
  DRAW_GEAR[classId](paint, look, hair as Hex);
  addOutline(art, 'outline');
  return art.canvas;
}
