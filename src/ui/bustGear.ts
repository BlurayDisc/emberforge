import type { HeroAppearance } from '../content/heroAppearance';
import type { ClassId } from '../model/hero';
import {
  narrowBustEyes, paintBustBrows, paintBustMouth,
} from './bustExpressions';
import type { PixelDrawing } from './pixelDraw';

const STEEL = '#c0c8d0';
const STEEL_DARK = '#6f7a8c';
const RED = '#b23a3a';
const RED_DARK = '#8a2a2a';
const GOLD = '#f2c14e';
const WOOD = '#8a6340';
const LEATHER = '#3a2a1e';
const BONE = '#d8d4cc';
const ICE = '#8ad8f4';
const ICE_DARK = '#3a7fc0';
const WHITE = '#ffffff';
const MAKEUP_EYESHADOW = '#9a6ad8';
const MAKEUP_EYELINER = '#1a0f1c';
const MAKEUP_BLUSH = '#e8909a';
const MAKEUP_LIPSTICK = '#c01e3c';
const MAKEUP_LIPSTICK_LIGHT = '#e0587a';

type BustGearDrawer = (drawing: PixelDrawing, appearance: HeroAppearance) => void;

function drawHair(drawing: PixelDrawing, hair: string): void {
  drawing.fill(hair, 10, 6, 12, 3);
  drawing.fill(hair, 9, 8, 2, 6);
  drawing.fill(hair, 21, 8, 2, 6);
}

// Both eyes look straight ahead: white, iris, white on each side.
function paintBustMakeup(drawing: PixelDrawing, skin: string): void {
  [12, 17].forEach((x) => {
    drawing.fill(skin, x, 12, 3, 3);
    drawing.fill(MAKEUP_EYESHADOW, x, 12, 3, 1);
    drawing.fill(MAKEUP_EYELINER, x, 13, 3, 1);
    drawing.fill(WHITE, x, 14, 3, 1);
    drawing.fill(ICE_DARK, x + 1, 14, 1, 1);
  });
  drawing.fill(MAKEUP_EYELINER, 11, 12, 1, 1);
  drawing.fill(MAKEUP_EYELINER, 20, 12, 1, 1);
  drawing.fill(MAKEUP_BLUSH, 11, 16, 2, 1);
  drawing.fill(MAKEUP_BLUSH, 19, 16, 2, 1);
  drawing.fill(MAKEUP_LIPSTICK, 15, 18, 2, 1);
  drawing.fill(MAKEUP_LIPSTICK_LIGHT, 15, 19, 2, 1);
}

function drawMagicOrb(drawing: PixelDrawing): void {
  drawing.fill(ICE_DARK, 26, 12, 3, 1);
  drawing.fill(ICE_DARK, 25, 13, 5, 5);
  drawing.fill(ICE_DARK, 26, 18, 3, 1);
  drawing.fill(ICE, 26, 13, 3, 5);
  drawing.fill(WHITE, 27, 14, 1, 3);
  drawing.fill(WHITE, 24, 11, 1, 1);
  drawing.fill(WHITE, 30, 15, 1, 1);
  drawing.fill(ICE, 24, 19, 1, 1);
}

export const BUST_GEAR: Record<ClassId, BustGearDrawer> = {
  warrior: (drawing, { look, skin }) => {
    drawing.fill(STEEL_DARK, 1, 23, 9, 9);
    drawing.fill(STEEL, 1, 23, 9, 7);
    drawing.fill(GOLD, 1, 23, 9, 1);
    drawing.fill('#ffffff', 3, 24, 3, 1);
    drawing.fill(STEEL_DARK, 22, 23, 9, 9);
    drawing.fill(STEEL, 22, 23, 9, 7);
    drawing.fill(GOLD, 22, 23, 9, 1);
    drawing.fill('#ffffff', 24, 24, 3, 1);
    drawing.fill(look.cloth, 9, 3, 14, 6);
    drawing.fill(look.clothShade, 9, 8, 14, 1);
    drawing.fill(look.trim, 9, 6, 14, 1);
    drawing.fill(look.cloth, 9, 9, 2, 9);
    drawing.fill(look.cloth, 21, 9, 2, 9);
    drawing.fill(look.clothShade, 9, 16, 2, 2);
    drawing.fill(look.clothShade, 21, 16, 2, 2);
    drawing.fill(look.cloth, 15, 8, 2, 7);
    drawing.fill(look.clothShade, 16, 9, 1, 6);
    drawing.fill(RED, 12, 0, 8, 4);
    drawing.fill(RED, 19, 0, 7, 2);
    drawing.fill(RED_DARK, 25, 1, 3, 3);
    drawing.fill('#d86a6a', 13, 1, 5, 1);
    paintBustBrows(drawing, 'angry');
    paintBustMouth(drawing, skin, 'smirk');
  },
  archer: (drawing, { look, skin, skinShade, hair }) => {
    drawing.fill(look.cloth, 8, 3, 16, 5);
    drawing.fill(look.clothShade, 8, 7, 16, 1);
    drawing.fill(RED, 8, 8, 16, 1);
    drawing.fill(RED, 23, 6, 6, 2);
    drawing.fill(RED, 27, 8, 4, 1);
    drawing.fill(hair, 10, 7, 12, 1);
    drawing.fill(WOOD, 3, 4, 2, 2);
    drawing.fill(WOOD, 2, 6, 1, 14);
    drawing.fill(WOOD, 3, 20, 2, 2);
    drawing.fill(BONE, 5, 5, 1, 1);
    drawing.fill(BONE, 6, 7, 1, 3);
    drawing.fill(BONE, 7, 10, 1, 4);
    drawing.fill(BONE, 6, 14, 1, 3);
    drawing.fill(BONE, 5, 17, 1, 3);
    drawing.fill(WOOD, 23, 19, 2, 6);
    drawing.fill(RED, 22, 17, 1, 3);
    drawing.fill(WHITE, 24, 16, 1, 4);
    drawing.fill(RED, 25, 17, 1, 3);
    drawing.fill(LEATHER, 6, 25, 3, 7);
    drawing.fill(look.trim, 6, 28, 3, 1);
    narrowBustEyes(drawing, skinShade);
    paintBustBrows(drawing, 'angry');
    paintBustMouth(drawing, skin, 'smirk');
  },
  mage: (drawing, { look, hair, skin, skinShade }) => {
    drawHair(drawing, hair);
    drawing.fill(hair, 8, 12, 2, 12);
    drawing.fill(hair, 22, 12, 2, 12);
    drawing.fill(look.clothShade, 5, 8, 22, 2);
    drawing.fill(look.cloth, 10, 5, 12, 3);
    drawing.fill(look.cloth, 12, 3, 8, 2);
    drawing.fill(look.cloth, 14, 1, 4, 2);
    drawing.fill(look.cloth, 18, 0, 4, 2);
    drawing.fill(look.cloth, 21, 1, 3, 2);
    drawing.fill(look.trim, 10, 7, 12, 1);
    drawMagicOrb(drawing);
    drawing.fill(look.cloth, 23, 23, 5, 9);
    drawing.fill(look.trim, 23, 23, 5, 1);
    drawing.fill(skin, 25, 19, 5, 4);
    drawing.fill(skinShade, 25, 22, 5, 1);
    narrowBustEyes(drawing, skinShade);
    paintBustBrows(drawing, 'confident', hair);
    paintBustMouth(drawing, skin, 'smirk');
    paintBustMakeup(drawing, skin);
  },
  priest: (drawing, { look, hair, skin }) => {
    drawHair(drawing, hair);
    drawing.fill(look.cloth, 9, 4, 14, 4);
    drawing.fill(look.clothShade, 9, 7, 14, 1);
    drawing.fill(look.trim, 10, 0, 12, 1);
    drawing.fill(look.trim, 9, 1, 1, 2);
    drawing.fill(look.trim, 22, 1, 1, 2);
    drawing.fill(look.trim, 14, 5, 4, 2);
    paintBustMouth(drawing, skin, 'smile');
  },
  thief: (drawing, { look, skinShade }) => {
    drawing.fill(look.cloth, 8, 3, 16, 6);
    drawing.fill(look.cloth, 7, 8, 4, 14);
    drawing.fill(look.cloth, 21, 8, 4, 14);
    drawing.fill(look.clothShade, 8, 8, 16, 2);
    drawing.fill(look.cloth, 10, 16, 12, 5);
    drawing.fill(look.clothShade, 10, 16, 12, 1);
    drawing.fill(look.trim, 12, 21, 8, 1);
    narrowBustEyes(drawing, skinShade);
    paintBustBrows(drawing, 'sly');
  },
  barbarian: (drawing, { look, skin }) => {
    drawing.fill(look.cloth, 9, 4, 14, 4);
    drawing.fill(look.clothShade, 9, 7, 14, 1);
    drawing.fill(STEEL, 6, 1, 3, 6);
    drawing.fill(STEEL, 23, 1, 3, 6);
    drawing.fill(look.clothShade, 8, 20, 16, 3);
    drawing.fill(look.trim, 10, 21, 12, 1);
    paintBustMouth(drawing, skin, 'roar');
    paintBustBrows(drawing, 'angry');
    drawing.fill(RED, 11, 15, 3, 1);
    drawing.fill(RED, 18, 15, 3, 1);
    drawing.fill(RED, 12, 16, 2, 1);
    drawing.fill(RED, 18, 16, 2, 1);
  },
  fighter: (drawing, { look, skin }) => {
    drawing.fill(RED, 9, 6, 14, 2);
    drawing.fill(RED, 22, 7, 3, 6);
    drawing.fill(look.cloth, 9, 20, 14, 3);
    drawing.fill(look.clothShade, 9, 22, 14, 1);
    drawing.fill(look.trim, 14, 20, 4, 1);
    paintBustBrows(drawing, 'angry');
    paintBustMouth(drawing, skin, 'smirk');
  },
};
