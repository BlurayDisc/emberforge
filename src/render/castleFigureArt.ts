import { BODY_DRAWERS, type BodyStyle } from './castleFigureBodies';
import { drawBeard, drawFace, drawHair, drawHairBehindBody, type BeardStyle, type HairStyle } from './castleFigureHead';
import { HEADWEAR_DRAWERS, type Headwear } from './castleFigureHeadwear';
import { HELD_DRAWERS, type HeldItem } from './castleFigureHeld';
import { FIGURE_HEADROOM, FIGURE_HEIGHT, FIGURE_WIDTH, type FigureColors, type Painter } from './castleFigureTypes';
import type { PaletteColor } from './palette';
import { addOutline, createPixelCanvas } from './pixelCanvas';

interface Cape {
  color: PaletteColor;
  shade: PaletteColor;
  trim: PaletteColor;
}

interface FigureSpec {
  colors: FigureColors;
  body: BodyStyle;
  headwear: Headwear | null;
  hair: HairStyle;
  beard: BeardStyle;
  cape: Cape | null;
  held: HeldItem | null;
  // Ermine fur: a white collar and front stripe with black tails.
  ermine?: boolean;
  // A chain of office across the chest.
  chain?: boolean;
  spectacles?: boolean;
}

const LIGHT_SKIN = { skin: 'skin', skinShade: 'skinShade' } as const;
const DARK_SKIN = { skin: 'skinShade', skinShade: 'skinDark' } as const;

const FIGURE_SPECS: Record<string, FigureSpec> = {
  king: {
    colors: { ...LIGHT_SKIN, hair: 'hairGrey', cloth: 'royalPurple', clothShade: 'royalPurpleDark', trim: 'gold', accent: 'blood', legs: 'royalPurpleDark', boots: 'leatherDark' },
    body: 'robe', headwear: 'crown', hair: 'short', beard: 'long', cape: { color: 'blood', shade: 'carpetDark', trim: 'robeWhite' }, held: 'sceptre', ermine: true,
  },
  queen: {
    colors: { ...LIGHT_SKIN, hair: 'hairBlond', cloth: 'royalPurpleDark', clothShade: 'void', trim: 'steel', accent: 'steel', legs: 'void', boots: 'leatherDark' },
    body: 'gown', headwear: 'veilAndTiara', hair: 'long', beard: 'none', cape: null, held: 'ribbon',
  },
  knightCommander: {
    colors: { ...LIGHT_SKIN, hair: 'hairGrey', cloth: 'steel', clothShade: 'steelDark', trim: 'gold', accent: 'blood', legs: 'steelDark', boots: 'steelDark' },
    body: 'plate', headwear: 'plumedHelm', hair: 'none', beard: 'moustache', cape: { color: 'carpetDark', shade: 'void', trim: 'gold' }, held: 'swordPlanted',
  },
  youngKnight: {
    colors: { ...LIGHT_SKIN, hair: 'hairBrown', cloth: 'steel', clothShade: 'steelDark', trim: 'gold', accent: 'glassBlue', legs: 'steelDark', boots: 'steelDark' },
    body: 'plate', headwear: null, hair: 'short', beard: 'none', cape: null, held: 'pennantSpear',
  },
  bishop: {
    colors: { ...LIGHT_SKIN, hair: 'hairGrey', cloth: 'robeWhite', clothShade: 'robeWhiteShade', trim: 'gold', accent: 'royalPurple', legs: 'robeWhite', boots: 'leatherDark' },
    body: 'robe', headwear: 'mitre', hair: 'sides', beard: 'short', cape: null, held: 'crozier',
  },
  steward: {
    colors: { ...DARK_SKIN, hair: 'hairBlack', cloth: 'forest', clothShade: 'woodDark', trim: 'gold', accent: 'forest', legs: 'leatherDark', boots: 'leatherDark' },
    body: 'tunic', headwear: 'flatCap', hair: 'short', beard: 'moustache', cape: null, held: 'ledger', chain: true,
  },
  jester: {
    colors: { ...LIGHT_SKIN, hair: 'hairBlond', cloth: 'glassBlue', clothShade: 'royalPurpleDark', trim: 'gold', accent: 'blood', legs: 'blood', boots: 'gold' },
    body: 'tunic', headwear: 'jesterHorns', hair: 'none', beard: 'none', cape: null, held: 'bauble',
  },
  chronicler: {
    colors: { ...LIGHT_SKIN, hair: 'hairGrey', cloth: 'leather', clothShade: 'leatherDark', trim: 'parchment', accent: 'leather', legs: 'leatherDark', boots: 'leatherDark' },
    body: 'robe', headwear: 'hood', hair: 'none', beard: 'short', cape: null, held: 'scrollAndQuill', spectacles: true,
  },
  captain: {
    colors: { ...LIGHT_SKIN, hair: 'hairBlond', cloth: 'steel', clothShade: 'steelDark', trim: 'gold', accent: 'glassBlue', legs: 'steelDark', boots: 'steelDark' },
    body: 'plate', headwear: null, hair: 'braid', beard: 'none', cape: { color: 'glassBlue', shade: 'royalPurpleDark', trim: 'gold' }, held: 'halberd',
  },
  sentry: {
    colors: { ...LIGHT_SKIN, hair: 'hairBrown', cloth: 'crop', clothShade: 'cropDark', trim: 'leather', accent: 'cropDark', legs: 'leatherDark', boots: 'leatherDark' },
    body: 'tunic', headwear: 'hood', hair: 'none', beard: 'none', cape: null, held: 'bowAndQuiver',
  },
  falconer: {
    colors: { ...DARK_SKIN, hair: 'hairBlack', cloth: 'leather', clothShade: 'leatherDark', trim: 'wheat', accent: 'blood', legs: 'leatherDark', boots: 'leatherDark' },
    body: 'tunic', headwear: 'wideHat', hair: 'short', beard: 'short', cape: null, held: 'hawkOnFist',
  },
  lamplighter: {
    colors: { ...LIGHT_SKIN, hair: 'hairGrey', cloth: 'shadow', clothShade: 'night', trim: 'ash', accent: 'shadow', legs: 'night', boots: 'leatherDark' },
    body: 'tunic', headwear: null, hair: 'sides', beard: 'long', cape: null, held: 'lampPole',
  },
};

function drawCape(paint: Painter, cape: Cape): void {
  paint(cape.color, 5, 17, 18, 29);
  paint(cape.shade, 19, 17, 4, 29);
  paint(cape.shade, 9, 30, 1, 16);
  paint(cape.trim, 5, 44, 18, 2);
}

function drawErmine(paint: Painter): void {
  paint('robeWhite', 6, 16, 16, 4);
  paint('robeWhite', 12, 20, 4, 26);
  for (const [x, y] of [[8, 17], [12, 18], [17, 17], [20, 18], [13, 24], [14, 31], [13, 38]] as const) paint('void', x, y, 1, 2);
}

function drawChainOfOffice(paint: Painter): void {
  for (let step = 0; step < 6; step++) paint('gold', 8 + step * 2, 19 + Math.round(Math.sin((step / 5) * Math.PI) * 5), 2, 1);
  paint('gold', 13, 25, 2, 3);
}

function drawSpectacles(paint: Painter): void {
  paint('steelDark', 10, 9, 4, 4);
  paint('steelDark', 15, 9, 4, 4);
  paint('cloud', 11, 10, 2, 2);
  paint('cloud', 16, 10, 2, 2);
  paint('void', 12, 10, 1, 2);
  paint('void', 17, 10, 1, 2);
  paint('steelDark', 14, 10, 1, 1);
}

function drawFigure(spec: FigureSpec): HTMLCanvasElement {
  const art = createPixelCanvas(FIGURE_WIDTH, FIGURE_HEIGHT);
  const paint: Painter = (color, x, y, width, height) => art.fill(color, x, y + FIGURE_HEADROOM, width, height);
  const { colors } = spec;
  if (spec.cape) drawCape(paint, spec.cape);
  drawHairBehindBody(paint, colors, spec.hair);
  BODY_DRAWERS[spec.body](paint, colors);
  if (spec.ermine) drawErmine(paint);
  if (spec.chain) drawChainOfOffice(paint);
  drawFace(paint, colors);
  drawHair(paint, colors, spec.hair);
  drawBeard(paint, colors, spec.beard);
  if (spec.spectacles) drawSpectacles(paint);
  if (spec.headwear) HEADWEAR_DRAWERS[spec.headwear](paint, colors);
  if (spec.held) HELD_DRAWERS[spec.held](paint, colors);
  addOutline(art, 'outline');
  return art.canvas;
}

// Each figure is drawn when it is first asked for. The validator reads only the keys.
export const FIGURE_DRAWERS: Record<string, () => HTMLCanvasElement> = Object.fromEntries(
  Object.entries(FIGURE_SPECS).map(([look, spec]) => [look, () => drawFigure(spec)]),
);
