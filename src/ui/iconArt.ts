import type { MaterialCategory } from '../model/material';
import { ITEM_SHAPE_ROWS } from './itemShapes';
import { drawAscii, drawingToImage } from './pixelDraw';

type Rows = readonly string[];


const MATERIAL_ROWS: Readonly<Record<MaterialCategory, Rows>> = {
  ore: ['............', '....oooo....', '...oaalao...', '..oaaaaaaoo.', '.oaalaaaaaao', '.oaaaaadaaao', '.oaaaaaaaao.', '..oaaaaaao..', '...oooooo...', '............', '............', '............'],
  wood: ['............', '............', '..oooooooo..', '.oaaaaaaaaoo', 'oaalaaaaaado', 'oaaaaaaaaado', '.oaaaaaaaaoo', '..oooooooo..', '............', '............', '............', '............'],
  hide: ['............', '..oooooooo..', '.oaaaaaaaao.', 'oaalaaaaaaao', 'oaaaadaaaaao', 'oaaaaaaadaao', '.oaaaaaaaao.', '..oaaaaaao..', '...oooooo...', '............', '............', '............'],
  cloth: ['............', '............', '.oooooooooo.', '.oaaaaaaaao.', '.ollllllllo.', '.oaaaaaaaao.', '.ollllllllo.', '.oaaaaaaaao.', '.oooooooooo.', '............', '............', '............'],
  gem: ['............', '...oooooo...', '..ollllaao..', '.olllaaaaao.', '..oaaaaaao..', '...oaaaao...', '....oaao....', '.....oo.....', '............', '............', '............', '............'],
  fang: ['............', '...oooooo...', '..opppppso..', '..oppppsso..', '...opppso...', '...oppsso...', '....oppo....', '....opso....', '....ooo.....', '............', '............', '............'],
  scale: ['............', '...oooooo...', '..odddddso..', '.odppppddso.', '.odppppddso.', '..odddddso..', '...oooooo...', '............', '............', '............', '............', '............'],
  bone: ['............', '............', '............', '............', '..oo....oo..', '.oppooooppo.', '.oppppppppo.', '..oooooooo..', '............', '............', '............', '............'],
  sinew: ['............', '............', '...oooooo...', '..oprprpro..', '.oprooooorpo', '.orpo....opo', '.oprooooorpo', '..oprprpro..', '...oooooo...', '............', '............', '............'],
  essence: ['....oooo....', '....owwo....', '....obbo....', '...obbbbo...', '..obblbbbo..', '..obbbbbbo..', '..obbbbbbo..', '..obbbbbbo..', '...obbbbo...', '....oooo....', '............', '............'],
  skin: ['............', '..oooooooo..', '.oaaaaaaaao.', 'oaalaaaaaaao', 'oaaaadaaaaao', 'oaaaaaaadaao', '.oaaaaaaaao.', '..oaaaaaao..', '...oooooo...', '............', '............', '............'],
  silk: ['............', '............', '.oooooooooo.', '.oaaaaaaaao.', '.ollllllllo.', '.oaaaaaaaao.', '.ollllllllo.', '.oaaaaaaaao.', '.oooooooooo.', '............', '............', '............'],
  catalyst: ['............', '....oooo....', '...oggggo...', '..ogglggdo..', '..oglggggdo.', '..ogggggggdo', '..ogggggggdo', '..oggggggdo.', '...oggggdo..', '....oooo....', '............', '............'],
};

const DUNGEON_ROWS: Readonly<Record<string, Rows>> = {
  'rat-cellar': ['...oooooo...', '..oWWWWWWo..', '.owwwwwwwwo.', '.oggggggggo.', '.owwwwwwwwo.', '.owwWwwwwwo.', '.owwwwwwwwo.', '.oggggggggo.', '.owwwwwwwwo.', '..oWWWWWWo..', '...oooooo...', '............'],
  'scarecrow-field': ['....oooo....', '..oowwwwoo..', '...oppppo...', '...opoopo...', '...oppppo...', 'ogoowwwwoogo', 'o..owwwwo..o', '...owrrwo...', '...owrrwo...', '....owwo....', '....owwo....', '....oWWo....'],
  'wolf-trail': ['............', '...oooo.....', '..oggggo....', '.oggggo.....', '.ogggo......', '.ogggo......', '.ogggo......', '.oggggo.....', '..oggggooo..', '...oggggggo.', '....oooooo..', '............'],
  'sunken-mill': ['o..........o', '.o...oo...o.', '..o.owwo.o..', '...oowwoo...', '...owwwwo...', '....owwo....', '...owWWwo...', '...owWWwo...', '..owwwwwwo..', '.bbbbbbbbbb.', 'bbbFbbbbFbbb', '............'],
  'goblin-camp': ['.....rr.....', '.....oo.....', '....oaao....', '...oaaaao...', '..oaaaaaao..', '.oaaooooaao.', '.oaaooooaao.', '.oaaooooaao.', 'oooooooooooo', '............', '............', '............'],
  'old-wood-hollow': ['....oooo....', '..oofFfFoo..', '.offFfffFfo.', 'offfFffffFfo', 'offfffFfffo.', '.offfffffffo', '..oofffoo...', '....owwo....', '....owwo....', '....owwo....', '...oowwoo...', '............'],
  'goblin-chief-lair': ['..g..g..g...', '..gggggggg..', '..oooooooo..', '.oppppppppo.', '.opooppoopo.', '.opooppoopo.', '.opppoopppo.', '..oppppppo..', '..opopopopo.', '..oooooooo..', '............', '............'],
  town: ['............', '.....oo.....', '....orro....', '...orrrro...', '..orrrrrro..', '.orrrrrrrro.', '..oppppppo..', '..oppooppo..', '..oppooppo..', '..oooooooo..', '............', '............'],
};

const BASE_LEGEND = {
  o: '#17110d', s: '#c0c8d0', S: '#6f7482', g: '#f2c14e', d: '#b9821f', r: '#b23a3a', w: '#8a6340', W: '#5a3f28',
  p: '#ead9a8', b: '#5a8fe0', f: '#2d6a4f', F: '#4f9a3a',
} as const;

interface Tint {
  a: string;
  d: string;
  l: string;
}

const TINT_BY_MATERIAL: Readonly<Record<string, Tint>> = {
  'copper-ore': { a: '#d98a4e', d: '#8f4f26', l: '#f0b88a' },
  'pine-wood': { a: '#c9a26a', d: '#8a6a3a', l: '#e8c98e' },
  rawhide: { a: '#a8754a', d: '#6a4a2a', l: '#cfa070' },
  linen: { a: '#e0d4b0', d: '#a89c78', l: '#fff6d8' },
  quartz: { a: '#b08ae0', d: '#7a4aa8', l: '#e0c8ff' },
  'sharp-fang': { a: '#ddd2b0', d: '#9a8e6a', l: '#fff6d8' },
  toadskin: { a: '#6b8e3a', d: '#43601f', l: '#93b856' },
  'bone-shard': { a: '#d9d2bc', d: '#8f8870', l: '#f4f0e0' },
  'spider-silk': { a: '#d8d8e8', d: '#9a9ab8', l: '#ffffff' },
  'coarse-sinew': { a: '#b86a5a', d: '#7a3a30', l: '#e0968a' },
};

const TINT_BY_CATEGORY: Readonly<Record<string, Tint>> = {
  ore: { a: '#8d8f9a', d: '#5c5e6b', l: '#b4b6c0' },
  wood: { a: '#9a7a4a', d: '#6a4a2a', l: '#c9a26a' },
  hide: { a: '#8a5a3a', d: '#5a3a22', l: '#b9855a' },
  cloth: { a: '#c9bfa0', d: '#8a8068', l: '#efe6c8' },
  gem: { a: '#8a9ae0', d: '#4a5aa8', l: '#c8d0ff' },
};

const DEFAULT_TINT: Tint = { a: '#8d8f9a', d: '#5c5e6b', l: '#b4b6c0' };
const imageCache = new Map<string, HTMLCanvasElement>();

function tintFor(materialId: string, category: string): Tint {
  return TINT_BY_MATERIAL[materialId] ?? TINT_BY_CATEGORY[category] ?? DEFAULT_TINT;
}

function cachedImage(key: string, scale: number, rows: Rows, legend: Readonly<Record<string, string>>): HTMLImageElement {
  let canvas = imageCache.get(key);
  if (!canvas) {
    canvas = drawAscii(rows, legend).canvas;
    imageCache.set(key, canvas);
  }
  return drawingToImage({ canvas, fill: () => undefined }, scale);
}

export function createItemIcon(baseId: string, materialId: string, mainCategory: string, scale = 3): HTMLImageElement {
  const tint = tintFor(materialId, mainCategory);
  const rows = ITEM_SHAPE_ROWS[baseId] ?? ITEM_SHAPE_ROWS.sword ?? [];
  return cachedImage(`item:${baseId}:${materialId}`, scale, rows, { ...BASE_LEGEND, ...tint });
}

export function createMaterialIcon(materialId: string, category: MaterialCategory, scale = 3): HTMLImageElement {
  const tint = tintFor(materialId, category);
  return cachedImage(`material:${materialId}`, scale, MATERIAL_ROWS[category], { ...BASE_LEGEND, ...tint, a: category === 'catalyst' ? BASE_LEGEND.g : tint.a });
}

export function createDungeonIcon(dungeonId: string, scale = 3): HTMLImageElement {
  const rows = DUNGEON_ROWS[dungeonId] ?? DUNGEON_ROWS.town ?? [];
  return cachedImage(`dungeon:${dungeonId}`, scale, rows, { ...BASE_LEGEND, a: '#a8855a' });
}

function crossedSwordsRows(): string[] {
  return Array.from({ length: 12 }, (_, row) => {
    const cells = Array.from({ length: 12 }, () => '.');
    for (const column of [row, 11 - row]) {
      if (column > 0 && cells[column - 1] === '.') cells[column - 1] = 'o';
      if (column < 11 && cells[column + 1] === '.') cells[column + 1] = 'o';
    }
    for (const column of [row, 11 - row]) cells[column] = row >= 9 ? 'g' : 's';
    return cells.join('');
  });
}

const LOCK_ROWS: Rows = ['............', '....oooo....', '...oSSSSo...', '...oS..So...', '...oS..So...', '..oooooooo..', '..oggggggo..', '..oggooggo..', '..oggooggo..', '..oggggggo..', '..oooooooo..', '............'];

export function createLockIcon(scale = 3): HTMLImageElement {
  return cachedImage('lock', scale, LOCK_ROWS, BASE_LEGEND);
}

export function createFightIcon(scale = 2): HTMLImageElement {
  return cachedImage('fight', scale, crossedSwordsRows(), BASE_LEGEND);
}

export function createTownIcon(scale = 3): HTMLImageElement {
  return cachedImage('town', scale, DUNGEON_ROWS.town ?? [], BASE_LEGEND);
}
