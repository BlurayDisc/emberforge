import type { PixelCanvas } from '../pixelCanvas';
import type { Tones } from './creatureShading';
import { BONE, CAPE, GOLD, IRON, LEATHER, RUSTED_IRON, SKIN, SKIN_SHADOW } from './goblinChiefColors';
import { ditherRect, flatPolygon, line, shadedEllipse, shadedPolygon } from './goblinChiefShapes';

export function drawCape(art: PixelCanvas): void {
  shadedPolygon(art, [[14, 26], [58, 26], [62, 44], [58, 53], [54, 47], [50, 58], [45, 50], [40, 61], [35, 52], [29, 60], [25, 50], [20, 57], [16, 47], [11, 40]], CAPE);
  ditherRect(art, CAPE.dark, 14, 44, 46, 5);
  line(art, CAPE.dark, [24, 34], [22, 48]);
  line(art, CAPE.dark, [50, 34], [53, 46]);
}

const BOOT: Tones = { base: '#3b2a22', light: '#5e4636', dark: '#20150f' };

export function drawLegsAndBoots(art: PixelCanvas): void {
  shadedPolygon(art, [[23, 49], [34, 49], [33, 59], [24, 59]], SKIN_SHADOW);
  shadedPolygon(art, [[38, 49], [50, 49], [50, 59], [39, 59]], SKIN_SHADOW);
  shadedPolygon(art, [[14, 66], [17, 58], [35, 57], [35, 67], [14, 67]], BOOT);
  shadedPolygon(art, [[37, 57], [52, 57], [57, 63], [57, 67], [37, 67]], BOOT);
  ditherRect(art, BONE.base, 18, 56, 16, 2);
  ditherRect(art, BONE.base, 38, 56, 13, 2);
  art.fill(IRON.base, 14, 62, 5, 5);
  art.fill(IRON.light, 14, 62, 5, 1);
  art.fill(IRON.base, 52, 62, 5, 5);
  art.fill(IRON.light, 52, 62, 5, 1);
  art.fill(GOLD.base, 22, 62, 8, 1);
  art.fill(GOLD.base, 41, 62, 8, 1);
  art.fill(BOOT.light, 20, 59, 12, 1);
  art.fill(BOOT.light, 40, 59, 10, 1);
}

export function drawTorso(art: PixelCanvas): void {
  shadedEllipse(art, 36, 37, 18, 14, SKIN);
  shadedPolygon(art, [[25, 28], [48, 28], [46, 47], [27, 47]], LEATHER);
  for (const bandTop of [31, 36, 41]) {
    shadedPolygon(art, [[25, bandTop], [48, bandTop], [48, bandTop + 3], [25, bandTop + 3]], RUSTED_IRON);
    for (const rivetX of [27, 36, 46]) art.fill(IRON.light, rivetX, bandTop + 1, 1, 1);
  }
  flatPolygon(art, [[20, 28], [24, 28], [37, 46], [33, 46]], LEATHER.dark);
  line(art, LEATHER.light, [20, 27], [34, 45]);
  art.fill(BONE.base, 30, 40, 2, 3);
  art.fill(BONE.base, 27, 36, 2, 2);
  line(art, SKIN.dark, [16, 40], [19, 36]);
  line(art, SKIN.light, [17, 40], [20, 36]);
}

export function drawBeltAndTrophies(art: PixelCanvas): void {
  shadedPolygon(art, [[20, 46], [52, 46], [52, 51], [20, 51]], LEATHER);
  art.fill(LEATHER.light, 21, 47, 30, 1);
  shadedPolygon(art, [[32, 44], [41, 44], [41, 53], [32, 53]], GOLD);
  art.fill(BONE.base, 34, 46, 5, 4);
  art.fill('#1a0d0d', 35, 47, 1, 1);
  art.fill('#1a0d0d', 37, 47, 1, 1);
  art.fill('#1a0d0d', 36, 49, 1, 1);
  const dangling: Array<[number, number, string]> = [[23, 51, BONE.base], [27, 51, GOLD.base], [45, 51, BONE.base], [49, 51, SKIN.light]];
  for (const [x, y, color] of dangling) {
    art.fill(LEATHER.dark, x, y, 1, 2);
    art.fill(color as `#${string}`, x - 1, y + 2, 3, 3);
    art.fill(BONE.dark, x + 1, y + 4, 1, 1);
  }
  flatPolygon(art, [[33, 53], [41, 53], [40, 60], [37, 57], [34, 60]], LEATHER.base);
  art.fill(LEATHER.dark, 36, 54, 1, 4);
}

export function drawLeftArm(art: PixelCanvas): void {
  shadedPolygon(art, [[13, 28], [25, 28], [21, 38], [17, 47], [6, 47], [5, 38]], SKIN);
  line(art, SKIN.dark, [9, 33], [14, 36]);
  line(art, SKIN.dark, [10, 36], [13, 38]);
  shadedPolygon(art, [[5, 39], [19, 39], [18, 44], [5, 44]], IRON);
  for (const spikeX of [7, 11, 15]) flatPolygon(art, [[spikeX, 39], [spikeX + 2, 39], [spikeX + 1, 35]], IRON.light);
  shadedEllipse(art, 10, 50, 6, 5, SKIN);
  art.fill(BONE.base, 5, 54, 2, 2);
  art.fill(BONE.base, 9, 55, 2, 2);
  art.fill(BONE.base, 13, 54, 2, 2);
  art.fill(SKIN.dark, 7, 49, 1, 4);
  art.fill(SKIN.dark, 10, 49, 1, 5);
  art.fill(SKIN.dark, 13, 49, 1, 4);
  art.fill(SKIN.light, 6, 46, 4, 1);
}

export function drawRightArm(art: PixelCanvas): void {
  shadedPolygon(art, [[44, 28], [56, 28], [68, 34], [66, 46], [56, 44], [47, 38]], SKIN);
  line(art, SKIN.dark, [52, 32], [56, 38]);
  shadedPolygon(art, [[56, 39], [66, 38], [67, 44], [57, 45]], LEATHER);
  shadedEllipse(art, 69, 41, 5.5, 5, SKIN);
  art.fill(SKIN.dark, 66, 41, 7, 1);
  art.fill(SKIN.dark, 67, 44, 6, 1);
  art.fill(SKIN.light, 66, 38, 3, 1);
}

export function drawPauldrons(art: PixelCanvas): void {
  flatPolygon(art, [[11, 29], [8, 21], [16, 28]], IRON.light);
  flatPolygon(art, [[17, 28], [17, 20], [23, 28]], IRON.base);
  flatPolygon(art, [[7, 33], [2, 31], [9, 28]], IRON.base);
  shadedEllipse(art, 17, 32, 10, 5, IRON);
  art.fill(IRON.light, 11, 28, 8, 1);
  art.fill(RUSTED_IRON.dark, 9, 36, 16, 1);
  art.fill(BONE.base, 13, 32, 2, 2);
  flatPolygon(art, [[46, 28], [48, 20], [52, 28]], IRON.base);
  flatPolygon(art, [[53, 28], [57, 19], [59, 29]], IRON.light);
  flatPolygon(art, [[60, 33], [66, 30], [62, 37]], IRON.dark);
  shadedEllipse(art, 54, 33, 10, 5.5, IRON);
  art.fill(IRON.light, 47, 29, 9, 1);
  art.fill(RUSTED_IRON.dark, 45, 37, 17, 1);
  ditherRect(art, '#9b9aa0', 44, 33, 4, 4);
  art.fill(GOLD.base, 54, 32, 2, 2);
  art.fill(BONE.base, 58, 34, 2, 2);
}
