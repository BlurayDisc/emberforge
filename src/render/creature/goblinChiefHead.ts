import type { PixelCanvas } from '../pixelCanvas';
import { BONE, EYE_CORE, EYE_GLOW, GOLD, GUM, MOUTH_DARK, SKIN, SKIN_SHADOW } from './goblinChiefColors';
import { flatPolygon, line, shadedEllipse, shadedPolygon } from './goblinChiefShapes';

function drawGoldRing(art: PixelCanvas, x: number, y: number): void {
  art.fill(GOLD.base, x, y, 4, 4);
  art.fill(GOLD.light, x, y, 2, 1);
  art.fill(GOLD.dark, x + 3, y + 3, 1, 1);
  art.fill(SKIN_SHADOW.dark, x + 1, y + 1, 2, 2);
}

export function drawEars(art: PixelCanvas): void {
  shadedPolygon(art, [[28, 14], [27, 20], [17, 14], [4, 2], [18, 9]], SKIN);
  flatPolygon(art, [[26, 15], [26, 18], [17, 14], [9, 6]], '#a85a4a');
  line(art, SKIN.dark, [5, 3], [26, 15]);
  drawGoldRing(art, 15, 12);
  drawGoldRing(art, 21, 16);
  art.fill(SKIN.dark, 9, 8, 1, 1);
  shadedPolygon(art, [[43, 14], [44, 20], [53, 14], [58, 4], [52, 9]], SKIN_SHADOW);
  flatPolygon(art, [[45, 15], [45, 18], [53, 13], [56, 6]], '#7a3d34');
  drawGoldRing(art, 49, 17);
}

function drawJawAndTusks(art: PixelCanvas): void {
  shadedPolygon(art, [[23, 19], [45, 18], [46, 25], [42, 29], [27, 29], [22, 25]], SKIN);
  art.fill(MOUTH_DARK, 26, 21, 17, 4);
  art.fill(GUM, 27, 22, 15, 1);
  for (const toothX of [29, 33, 36, 39]) art.fill(BONE.base, toothX, 21, 2, 2);
  art.fill(BONE.base, 31, 24, 2, 2);
  art.fill(BONE.base, 37, 24, 2, 1);
  art.fill(BONE.dark, 30, 22, 1, 1);
  flatPolygon(art, [[25, 25], [28, 25], [28, 20], [26, 18]], BONE.base);
  art.fill(BONE.light, 26, 20, 1, 4);
  art.fill(BONE.dark, 27, 21, 1, 3);
  flatPolygon(art, [[41, 25], [44, 25], [44, 18], [42, 20]], BONE.base);
  art.fill(BONE.light, 42, 21, 1, 3);
  art.fill(BONE.dark, 43, 20, 1, 4);
  art.fill(SKIN.dark, 27, 28, 14, 1);
}

function drawFace(art: PixelCanvas): void {
  art.fill(SKIN.dark, 24, 11, 22, 1);
  flatPolygon(art, [[23, 11], [47, 10], [46, 15], [38, 14], [34, 16], [30, 14], [24, 16]], SKIN_SHADOW.base);
  art.fill(SKIN_SHADOW.dark, 23, 15, 7, 1);
  art.fill(SKIN_SHADOW.dark, 39, 14, 7, 1);
  art.fill(EYE_GLOW, 26, 14, 5, 3);
  art.fill(EYE_CORE, 28, 15, 2, 2);
  art.fill('#fff0a0', 26, 14, 1, 1);
  art.fill(EYE_GLOW, 38, 13, 4, 3);
  art.fill(EYE_CORE, 39, 14, 2, 2);
  art.fill('#fff0a0', 38, 13, 1, 1);
  art.fill(SKIN_SHADOW.dark, 24, 12, 2, 2);
  art.fill(SKIN_SHADOW.dark, 43, 11, 3, 2);
  shadedEllipse(art, 34, 18, 3, 2.5, SKIN);
  art.fill(SKIN.dark, 32, 19, 1, 1);
  art.fill(SKIN.dark, 35, 19, 1, 1);
  art.fill(SKIN.light, 41, 17, 1, 1);
  art.fill('#5a2a28', 44, 12, 1, 4);
  art.fill('#c9d98a', 23, 19, 1, 1);
}

export function drawChiefHead(art: PixelCanvas): void {
  shadedEllipse(art, 35, 16, 12, 9.5, SKIN);
  drawJawAndTusks(art);
  drawFace(art);
}

export function drawChiefCrown(art: PixelCanvas): void {
  const spikes: Array<[number, number, number, boolean]> = [[27, 4, 3, true], [30, 1, 4, false], [34, 5, 3, false], [37, 0, 4, true], [41, 3, 3, false]];
  for (const [x, top, width, isBone] of spikes) {
    const tones = isBone ? BONE : GOLD;
    flatPolygon(art, [[x, 9], [x + width, 9], [x + Math.floor(width / 2), top]], tones.base);
    art.fill(tones.light, x, Math.min(top + 3, 8), 1, 2);
    art.fill(tones.dark, x + width - 1, 8, 1, 1);
  }
  shadedPolygon(art, [[26, 8], [45, 7], [45, 12], [26, 13]], GOLD);
  art.fill(GOLD.light, 27, 9, 6, 1);
  art.fill(GOLD.dark, 31, 11, 1, 2);
  art.fill(GOLD.dark, 41, 10, 1, 2);
  art.fill('#c0282d', 35, 9, 3, 3);
  art.fill('#ff7a6a', 35, 9, 1, 1);
  art.fill(GOLD.dark, 26, 12, 20, 1);
}
