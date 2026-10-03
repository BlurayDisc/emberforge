import type { PaletteColor } from './palette';

export type SpriteLegend = Readonly<Record<string, PaletteColor>>;

export interface SpriteArt {
  rows: readonly string[];
  legend: SpriteLegend;
}

const HERO_ROWS = [
  '................',
  '.....oooooo.....',
  '....oggggggo....',
  '....oggggggo....',
  '....ogssssgo....',
  '....ogossogo....',
  '....oggssggo....',
  '.....obbbbo.....',
  '...ogbbbbbbgo...',
  '...ogbyyyybgo...',
  '..sogbbbbbbgos..',
  '..sobbbbbbbbos..',
  '...obbbbbbbbo...',
  '....obbo.obbo...',
  '....oggo.oggo...',
  '....oooo.oooo...',
] as const;

const GOBLIN_ROWS = [
  '................',
  '....oooooooo....',
  '.o.oggggggggo.o.',
  '.ogoggyggyggogo.',
  '.oggoggggggoggo.',
  '....ogrwwrgo....',
  '.....oggggo.....',
  '...ooggggggoo...',
  '..ogoccccccogo..',
  '..ogoccccccogo..',
  '..oggoccccoggo..',
  '....ooccccoo....',
  '....ogg..ggo....',
  '....ogg..ggo....',
  '...oggo..oggo...',
  '...oooo..oooo...',
] as const;

const GOBLIN_CHIEF_ROWS = [
  '....y.y.yy.y....',
  '....yyyyyyyy....',
  ...GOBLIN_ROWS.slice(2),
] as const;

const RAT_ROWS = [
  '..oo........',
  '.opgo.......',
  'ogggggoooo..',
  'orgggggggggo',
  'opgggggggggo',
  '.oggggggggoo',
  '..oo.oo..oo.',
] as const;

const WOLF_ROWS = [
  '...oo...........',
  '..ogo...oo......',
  '.oggooooggo.....',
  'oggwggggggggo...',
  'ogrggggggggggoo.',
  'oppggggggggggggo',
  '.oogggggggggggo.',
  '..oggoggggoggo..',
  '..ogo.oggo.ogo..',
  '..ooo.oooo.ooo..',
] as const;

function heroArt(helmet: PaletteColor, tunic: PaletteColor, trim: PaletteColor = 'gold'): SpriteArt {
  return { rows: HERO_ROWS, legend: { o: 'outline', s: 'skin', g: helmet, b: tunic, y: trim } };
}

const GOBLIN_LEGEND: SpriteLegend = { o: 'outline', g: 'goblin', y: 'gold', r: 'blood', w: 'parchment', c: 'soil' };

export const SPRITE_ART: Readonly<Record<string, SpriteArt>> = {
  'hero-warrior': heroArt('steel', 'cobalt'),
  'hero-archer': heroArt('forest', 'goblin'),
  'hero-mage': heroArt('shadow', 'violet'),
  'hero-priest': heroArt('parchment', 'bone'),
  'hero-thief': heroArt('shadow', 'ash', 'blood'),
  'monster-goblin': { rows: GOBLIN_ROWS, legend: GOBLIN_LEGEND },
  'monster-goblin-chief': { rows: GOBLIN_CHIEF_ROWS, legend: { ...GOBLIN_LEGEND, c: 'blood' } },
  'monster-rat': { rows: RAT_ROWS, legend: { o: 'outline', g: 'fur', p: 'skin', r: 'blood' } },
  'monster-wolf': { rows: WOLF_ROWS, legend: { o: 'outline', g: 'ash', p: 'skin', r: 'blood', w: 'parchment' } },
};
