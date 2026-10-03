import type { HeroAppearance } from '../../content/heroAppearance';
import { LEATHER, WHITE, type Paint } from './figureColors';

const MOUTH = '#8a3a3a';

function drawLegsAndBoots(paint: Paint, { look }: HeroAppearance): void {
  paint(look.clothShade, 13, 39, 6, 17);
  paint(look.clothShade, 21, 39, 6, 17);
  paint(LEATHER, 12, 55, 7, 6);
  paint(LEATHER, 21, 55, 7, 6);
  paint(look.trim, 12, 55, 7, 1);
  paint(look.trim, 21, 55, 7, 1);
}

function drawTorsoAndArms(paint: Paint, { look, skin }: HeroAppearance): void {
  paint(look.cloth, 11, 20, 18, 17);
  paint(look.clothShade, 11, 34, 18, 3);
  paint(LEATHER, 11, 37, 18, 2);
  paint(look.trim, 19, 37, 2, 2);
  paint(look.cloth, 7, 21, 4, 15);
  paint(look.cloth, 29, 21, 4, 15);
  paint(look.clothShade, 10, 22, 1, 13);
  paint(look.clothShade, 29, 22, 1, 13);
  paint(skin, 7, 36, 4, 4);
  paint(skin, 29, 36, 4, 4);
}

const LASH = '#2a1a14';
const BLUSH = '#eaa0a0';

// Girls get long hair beside the face, lashes, blush and fuller lips. Boys get a firm jaw line.
function drawGenderDetails(paint: Paint, { gender, skinShade, hair }: HeroAppearance): void {
  if (gender === 'female') {
    paint(hair, 12, 6, 2, 22);
    paint(hair, 26, 6, 2, 22);
    paint(hair, 14, 9, 1, 9);
    paint(hair, 25, 9, 1, 9);
    paint(LASH, 15, 12, 1, 1);
    paint(LASH, 24, 12, 1, 1);
    paint(BLUSH, 15, 15, 2, 1);
    paint(BLUSH, 23, 15, 2, 1);
    paint('#c8505a', 18, 16, 4, 1);
    paint('#d8707a', 19, 17, 2, 1);
    return;
  }
  paint(skinShade, 14, 16, 1, 2);
  paint(skinShade, 25, 16, 1, 2);
  paint(skinShade, 17, 17, 1, 1);
  paint(skinShade, 22, 17, 1, 1);
}

function drawHead(paint: Paint, { skin, skinShade, hair, eye }: HeroAppearance): void {
  paint(skinShade, 17, 18, 6, 3);
  paint(skin, 15, 6, 10, 1);
  paint(skin, 14, 7, 12, 11);
  paint(skin, 15, 18, 10, 1);
  paint(skinShade, 13, 11, 1, 3);
  paint(skinShade, 26, 11, 1, 3);
  paint(WHITE, 16, 12, 2, 2);
  paint(WHITE, 22, 12, 2, 2);
  paint(eye, 17, 12, 1, 2);
  paint(eye, 22, 12, 1, 2);
  paint(hair, 16, 11, 2, 1);
  paint(hair, 22, 11, 2, 1);
  paint(skinShade, 19, 14, 2, 2);
  paint(MOUTH, 18, 16, 4, 1);
  paint(hair, 14, 5, 12, 3);
  paint(hair, 13, 7, 1, 4);
  paint(hair, 26, 7, 1, 4);
}

export function drawBaseFigure(paint: Paint, appearance: HeroAppearance): void {
  drawLegsAndBoots(paint, appearance);
  drawTorsoAndArms(paint, appearance);
  drawHead(paint, appearance);
  drawGenderDetails(paint, appearance);
}
