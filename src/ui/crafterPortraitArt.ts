import type { ProfessionId } from '../content/baseItems';
import { createDrawing, drawingToImage, type PixelDrawing } from './pixelDraw';

const INK = '#17110d';
const SKIN = '#e0ac84';
const SKIN_SHADE = '#b8845c';

interface CrafterLook {
  background: string;
  backgroundShade: string;
  cloth: string;
  clothShade: string;
  trim: string;
  hair: string;
  skin: string;
  skinShade: string;
}

const CRAFTER_LOOKS: Record<ProfessionId, CrafterLook> = {
  weaponsmithing: { background: '#5a2d22', backgroundShade: '#6e382a', cloth: '#6a4a30', clothShade: '#4a3322', trim: '#c0c8d0', hair: '#2b1f17', skin: SKIN, skinShade: SKIN_SHADE },
  armoursmithing: { background: '#33414d', backgroundShade: '#3f5060', cloth: '#8a919c', clothShade: '#5e6672', trim: '#f2c14e', hair: '#8a8a8a', skin: '#c99a76', skinShade: '#9f7552' },
  fletching: { background: '#2c4a2a', backgroundShade: '#385a35', cloth: '#4f7f3f', clothShade: '#355a2a', trim: '#ead9a8', hair: '#8a5a2a', skin: SKIN, skinShade: SKIN_SHADE },
  woodworking: { background: '#4a3a22', backgroundShade: '#5a4729', cloth: '#a07a48', clothShade: '#7a5a32', trim: '#d9b878', hair: '#5a3a1e', skin: '#d29a70', skinShade: '#a8764f' },
  tailoring: { background: '#4a2a55', backgroundShade: '#5a3566', cloth: '#a85abf', clothShade: '#7a3e8f', trim: '#f2c14e', hair: '#17110d', skin: SKIN, skinShade: SKIN_SHADE },
  jewelcrafting: { background: '#223a5a', backgroundShade: '#2c4a70', cloth: '#5a8fe0', clothShade: '#3a62a8', trim: '#f2c14e', hair: '#c9a24a', skin: '#f0c8a4', skinShade: '#c9966c' },
};

function drawBackground(drawing: PixelDrawing, look: CrafterLook): void {
  drawing.fill(look.background, 0, 0, 32, 32);
  for (let y = 0; y < 32; y += 2) {
    for (let x = (y / 2) % 2 === 0 ? 0 : 2; x < 32; x += 4) drawing.fill(look.backgroundShade, x, y, 2, 2);
  }
}

function drawBustAndFace(drawing: PixelDrawing, look: CrafterLook): void {
  drawing.fill(look.clothShade, 3, 25, 26, 7);
  drawing.fill(look.cloth, 4, 25, 24, 7);
  drawing.fill(look.trim, 12, 24, 8, 2);
  drawing.fill(look.skinShade, 13, 20, 6, 5);
  drawing.fill(look.skin, 11, 7, 10, 1);
  drawing.fill(look.skin, 10, 8, 12, 12);
  drawing.fill(look.skin, 11, 20, 10, 1);
  drawing.fill('#ffffff', 12, 13, 3, 2);
  drawing.fill('#ffffff', 17, 13, 3, 2);
  drawing.fill(INK, 13, 13, 1, 2);
  drawing.fill(INK, 18, 13, 1, 2);
  drawing.fill(look.skinShade, 15, 15, 2, 2);
  drawing.fill('#8a3a3a', 14, 18, 4, 1);
}

const DRAW_TRADE: Record<ProfessionId, (drawing: PixelDrawing, look: CrafterLook) => void> = {
  weaponsmithing: (drawing, look) => {
    drawing.fill(look.hair, 10, 6, 12, 2);
    drawing.fill(look.hair, 10, 17, 12, 4);
    drawing.fill(look.hair, 12, 21, 8, 1);
    drawing.fill(look.cloth, 9, 4, 14, 3);
    drawing.fill('#8a6340', 25, 4, 2, 12);
    drawing.fill('#c0c8d0', 22, 2, 8, 4);
    drawing.fill('#6f7482', 22, 5, 8, 1);
  },
  armoursmithing: (drawing, look) => {
    drawing.fill(look.cloth, 9, 3, 14, 6);
    drawing.fill(look.cloth, 8, 8, 3, 10);
    drawing.fill(look.cloth, 21, 8, 3, 10);
    drawing.fill(look.clothShade, 9, 8, 14, 1);
    drawing.fill(look.trim, 15, 3, 2, 6);
    drawing.fill(look.hair, 12, 19, 8, 2);
  },
  fletching: (drawing, look) => {
    drawing.fill(look.cloth, 8, 3, 16, 5);
    drawing.fill(look.cloth, 7, 7, 4, 14);
    drawing.fill(look.cloth, 21, 7, 4, 14);
    drawing.fill(look.clothShade, 10, 7, 1, 10);
    drawing.fill(look.trim, 22, 0, 2, 8);
    drawing.fill('#b23a3a', 24, 2, 2, 4);
    drawing.fill(look.hair, 11, 8, 10, 1);
  },
  woodworking: (drawing, look) => {
    drawing.fill(look.cloth, 9, 4, 14, 4);
    drawing.fill(look.clothShade, 8, 8, 16, 1);
    drawing.fill(look.hair, 10, 17, 12, 3);
    drawing.fill('#c0c8d0', 4, 12, 4, 8);
    drawing.fill('#8a6340', 5, 18, 2, 8);
  },
  tailoring: (drawing, look) => {
    drawing.fill(look.hair, 10, 6, 12, 3);
    drawing.fill(look.hair, 9, 8, 2, 8);
    drawing.fill(look.hair, 21, 8, 2, 8);
    drawing.fill(look.cloth, 8, 4, 16, 3);
    drawing.fill(look.trim, 8, 6, 16, 1);
    drawing.fill('#ffffff', 23, 20, 5, 1);
    drawing.fill('#c0c8d0', 27, 16, 1, 5);
  },
  jewelcrafting: (drawing, look) => {
    drawing.fill(look.hair, 10, 5, 12, 4);
    drawing.fill(look.hair, 9, 8, 2, 7);
    drawing.fill(look.hair, 21, 8, 2, 7);
    drawing.fill(look.trim, 16, 11, 5, 5);
    drawing.fill(INK, 17, 12, 3, 3);
    drawing.fill('#ffffff', 17, 12, 3, 3);
    drawing.fill('#5ad0e0', 25, 24, 4, 4);
    drawing.fill('#ffffff', 26, 24, 1, 1);
  },
};

const portraitCache = new Map<ProfessionId, HTMLCanvasElement>();

function buildCrafterPortrait(professionId: ProfessionId): HTMLCanvasElement {
  const look = CRAFTER_LOOKS[professionId];
  const drawing = createDrawing(32, 32);
  drawBackground(drawing, look);
  drawBustAndFace(drawing, look);
  DRAW_TRADE[professionId](drawing, look);
  drawing.fill(INK, 0, 0, 32, 1);
  drawing.fill(INK, 0, 31, 32, 1);
  drawing.fill(INK, 0, 0, 1, 32);
  drawing.fill(INK, 31, 0, 1, 32);
  return drawing.canvas;
}

export function createCrafterPortrait(professionId: ProfessionId, scale = 2): HTMLImageElement {
  let canvas = portraitCache.get(professionId);
  if (!canvas) {
    canvas = buildCrafterPortrait(professionId);
    portraitCache.set(professionId, canvas);
  }
  return drawingToImage({ canvas, fill: () => undefined }, scale, 'pixel-portrait');
}
