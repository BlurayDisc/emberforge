import type { ProfessionId } from '../content/baseItems';
import { drawingToImage } from './pixelDraw';
import { paintArmoursmith, paintArmourerBackground } from './crafterPortrait/armoursmithPortrait';
import { paintEnchanter, paintArcaneBackground } from './crafterPortrait/enchanterPortrait';
import { paintFletcher, paintGreenwoodBackground } from './crafterPortrait/fletcherPortrait';
import { paintJeweler, paintJewelerBackground } from './crafterPortrait/jewelerPortrait';
import { paintLeatherworker, paintTannerBackground } from './crafterPortrait/leatherworkerPortrait';
import { paintTailor, paintFabricShopBackground } from './crafterPortrait/tailorPortrait';
import { paintForgeBackground, paintWeaponsmith } from './crafterPortrait/weaponsmithPortrait';
import { PORTRAIT_SIZE, createPortraitPainter, type PortraitPainter } from './crafterPortrait/portraitPainter';

const OUTLINE = '#17110d';
const FRAME_SHADE = '#0d0906';

interface CrafterPortraitPainters {
  paintBackground: (painter: PortraitPainter) => void;
  paintFigure: (painter: PortraitPainter) => void;
}

const CRAFTER_PAINTERS: Record<ProfessionId, CrafterPortraitPainters> = {
  weaponsmithing: { paintBackground: paintForgeBackground, paintFigure: paintWeaponsmith },
  armoursmithing: { paintBackground: paintArmourerBackground, paintFigure: paintArmoursmith },
  fletching: { paintBackground: paintGreenwoodBackground, paintFigure: paintFletcher },
  enchanting: { paintBackground: paintArcaneBackground, paintFigure: paintEnchanter },
  leatherworking: { paintBackground: paintTannerBackground, paintFigure: paintLeatherworker },
  tailoring: { paintBackground: paintFabricShopBackground, paintFigure: paintTailor },
  jewelcrafting: { paintBackground: paintJewelerBackground, paintFigure: paintJeweler },
};

// The portrait is drawn at twice the old 32 px size, so the display scale is halved to keep the same on-screen size.
const DETAIL_FACTOR = 2;

export function buildCrafterPortrait(professionId: ProfessionId): HTMLCanvasElement {
  const { paintBackground, paintFigure } = CRAFTER_PAINTERS[professionId];
  const portrait = createPortraitPainter();
  paintBackground(portrait);
  const figure = createPortraitPainter();
  paintFigure(figure);
  figure.addOutline(OUTLINE);
  figure.drawOnto(portrait);
  portrait.rect(OUTLINE, 0, 0, PORTRAIT_SIZE, 2);
  portrait.rect(OUTLINE, 0, PORTRAIT_SIZE - 2, PORTRAIT_SIZE, 2);
  portrait.rect(OUTLINE, 0, 0, 2, PORTRAIT_SIZE);
  portrait.rect(OUTLINE, PORTRAIT_SIZE - 2, 0, 2, PORTRAIT_SIZE);
  portrait.rect(FRAME_SHADE, 2, PORTRAIT_SIZE - 3, PORTRAIT_SIZE - 4, 1);
  return portrait.canvas;
}

const portraitCache = new Map<ProfessionId, HTMLCanvasElement>();

export function createCrafterPortrait(professionId: ProfessionId, scale = 2): HTMLImageElement {
  let canvas = portraitCache.get(professionId);
  if (!canvas) {
    canvas = buildCrafterPortrait(professionId);
    portraitCache.set(professionId, canvas);
  }
  return drawingToImage({ canvas, fill: () => undefined }, scale / DETAIL_FACTOR, 'pixel-portrait');
}
