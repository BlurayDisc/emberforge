import { MATERIALS } from '../content/materials';
import type { MaterialCategory } from '../model/material';
import { ITEM_SHAPE_ROWS } from './itemShapes';
import { stampSetEmblem } from './setEmblems';
import { drawAscii, drawingToImage } from './pixelDraw';

type Rows = readonly string[];


const MATERIAL_ROWS: Readonly<Record<MaterialCategory, Rows>> = {
  ore: ['................', '.......o........', '.....ooloo......', '....olllaaoo....', '...olllldaaao...', '..olllllllaao...', '..olllldaaaaao..', '..ollldaaaaaao..', '..olaadddaaado..', '..oaaaaaaddddo..', '...oaaaadddddo..', '....oadddddddo..', '.....oooooooo...', '................', '................', '................'],
  wood: ['................', '................', '................', '..oooooooooo....', '.olllllllllloo..', '.olllllllllallo.', '.oaaaaaaalaaalo.', '.oaddddddladalo.', '.oaaaaaalaldlalo', '.oaaaaaaalalalo.', '.odddddddlaaalo.', '.odddddddllallo.', '..oooooooooloo..', '...........o....', '................', '................'],
  hide: ['................', '................', '...oooooooooo...', '..opppppdllllo..', '..oppppdlllllao.', '..opppdaaaaallo.', '..oppdaaaaaallo.', '..opdaaaadaaaao.', '..odaaaaadaaado.', '..oaaaaaadaaado.', '..oddddddddddddo', '..oddddddddddao.', '...ooaaoooaaao..', '.....oo...ooo...', '................', '................'],
  cloth: ['................', '................', '................', '..oooooooooooo..', '.ollllllllllldo.', '.olllllllllldado', '.olaaaaaaaaadado', '.olddddddddddldo', '.olaaaaaaaadalad', '.olllllllllldado', '.olaaaaaaaaadado', '.olddddddddddado', '.oddddddddddddo.', '..oooooooooooo..', '................', '................'],
  gem: ['................', '................', '....oooooooo....', '...olllldaaao...', '..ollllldaaaao..', '..ollllaadaaao..', '.ollllaaaadaaao.', 'odddddaddddddddo', '.ooaaadadddddoo.', '...oaaadddddo...', '....oaaddddo....', '.....oaddddo....', '......odddo.....', '.......odo......', '.......odo......', '........o.......'],
  fang: ['................', '...oooooooo.....', '..oSsssSSSSo....', '..oSSSSSSSSo....', '...oplpppppo....', '....olpppppso...', '....oplppppso...', '.....olppppso...', '......olpppso...', '.......opppsso..', '.......opppsso..', '........oppsso..', '.........oossso.', '...........ooso.', '.............o..', '................'],
  scale: ['...ooo.ooo.ooo..', '..olaaolaaolaao.', '.ollaallaallaaao', 'ollaallaallaaaaa', 'oddaaddaaddaaadd', 'oodaaodaaodaaado', 'llodddodddodddoa', 'laaoooaoooaoooaa', 'daaddaaddaaddaaa', 'daaodaaodaaodaaa', 'odddodddodddoddd', 'ooooaoooaoooaooo', 'oddaaddaaddaaadd', 'oodaaodaaodaaado', '.oodddodddodddoo', '..ooooooooooooo.'],
  bone: ['...oo.......oo..', '..oppo.....oppo.', '.ollppo...opllpo', '.olpppo...opplpo', '..oppppo.oppppo.', '...oopppoppooo..', '.....opddpo.....', '......oddpo.....', '.....opppppo....', '...ooppoopppoo..', '..opppo..oppppo.', '.oppdpo...oppdpo', '.opddpo...opddpo', '..oppo.....oppo.', '...oo.......oo..', '................'],
  sinew: ['................', '................', '.....oooooo.....', '....odlallloo...', '...ollddaadaao..', '..olaaaaaaadaao.', '..odaaaoooaadao.', '..odaao...oadao.', '.olado.....oadao', '..oadao...oaado.', '..olaaaoooaaaao.', '..oadaadddddaao.', '...oldaadaaado..', '....oodaadaoo...', '......ooooo.....', '................'],
  essence: ['......oooo......', '.....oWWWWo.....', '.....oWWWWo.....', '......osso......', '......olso......', '......ossso.....', '.....osssso.....', '.....ossssso....', '....oslllllso...', '...oslbbbbbbo...', '...oblbbllbbbo..', '...oblbblbbddo..', '...obbblbbbddo..', '...odddddddddo..', '....ooooooooo...', '................'],
  skin: ['................', '.ooo........ooo.', 'ollloooooooolllo', 'oaaallllllllaaao', 'oaaallllllllaaao', '.oooollaaaaaooo.', '...oaaddaaaaao..', '...oaaaaaddaao..', '..oaaaaaaaaadao.', '...oaaaddaaado..', '.oooadddddddaoo.', 'oaaaoddddddaaaao', 'oaaaooaaaaaoaaao', 'odddo.oooooodddo', '.ooo........ooo.', '................'],
  silk: ['................', '.......oo.......', '..oooooggooooo..', '.olllllgglllllo.', '.olllllggldlllo.', '..oldalgdldalao.', '.oaldalggadalaao', '.oaaldaggaldlaao', '.oaaldaggaldalao', '.oaaldagdaldalao', '.odddddggdddddao', '.odddddggdddddo.', '..ooaaaggdaldo..', '....ooaggaaoo...', '......ooooo.....', '................'],
  catalyst: ['........o.......', '.......odo...o..', '......oldao.olo.', '.....olldaaolllo', '....olladaaaolo.', '...oaalaaaaaao..', '...ollladaddo...', '...ollladdddo...', '...ollladdddo...', '...olaaaddddo...', '....oaaaddddo...', '.....oaadddo....', '......oaddo.....', '.......odo......', '.......odo......', '........o.......'],
};

const DUNGEON_ROWS: Readonly<Record<string, Rows>> = {
  'rat-cellar': ['................', '...ooooo........', '..oSSSSSo.......', '.oSSSSSSSo......', '.oSSWwWSSo......', 'oSSWWwWSSSo.....', 'sSSWWwWWSSoooo..', 'sSWWWwWWSSoSrro.', 'sSWWWwWWSSoSrrSo', 'sSssssssSsssssoS', 'sSWWWwWSsssssssr', 'sSWWWwWSssssSSSr', 'sSsssssSSsssSSSo', 'sssssssSSSSSSSSo', 'oooooorrSSSSSoo.', '..orrrooooooo...'],
  'scarecrow-field': ['....ooWWWWoo....', '...oWWWWWWWWo...', '...oWrrrrrrWo...', '....oppppppo....', '....opoppopo....', '....oppppppo....', '.ooooppppppoooo.', 'oggggggggggggggo', 'oddddddddddddddo', 'gogoooWWWWooogog', 'ogo..orrrro..ogo', '.o...orrrro...o.', '.....orrrro..o..', '..oo..owwo..oFo.', 'ooFFooowwoooFFoo', 'FFFFFFFFFFFFFFFF'],
  'wolf-trail': ['..o.............', '.oSo.........o..', '.oSSo.......oSo.', '.oSSo.......oSo.', '.oSSSoooooooSSo.', '.oSSSSSSSSSSSSo.', '.oSSSsssssssSSo.', '.oSSsrrsssrrSSo.', '.oSSsssssssssSo.', '..oSsssssssssSo.', '...oSsspppssSo..', '...oSSspppsSSo..', '....oSSoopSSo...', '.....oSSSSSo....', '.....oSSSSSo....', '......ooooo.....'],
  'sunken-mill': ['....ooWWwWWoo...', '...oWWWWwWWWWo..', '..owwWSSwSSWwwo.', '..oWWwSSwSSwWWo.', '.oWWSSwSwSwSSWWo', '.oWWSSSgggSSSWWo', '.owwwwwgggwwwwwo', '.oWWSSSgggSSSWWo', '.oWWSSwSwSwSSWWo', 'oooWWwSSwSSwWWoo', 'ssssssssssssssss', 'bbbbbbbbbbbbbbbb', 'bbssbbbbbbbbbssb', 'bbbbbbbbbssbbbbb', 'bbbbbbbbbbbSSbbb', 'bbbbSSbbbbbbbbbb'],
  'goblin-camp': ['......o.........', '.....oFo........', '.....oFo........', '....oFFfo.......', '....oFFfo.......', '...oFFFFfo......', '..oFFFoFfo......', '..oFFFoFffo...o.', '.oFFFooofffo.ogo', '.oFFFooofffo.ogo', 'oFFFoooooffforgr', 'oFFFoooooffforgr', 'wwwwwwwwwwwwWWrW', 'WWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWW', 'oooooooooooooooo'],
  'old-wood-hollow': ['......ooooo.....', '....ooFFFFFoo...', '...oFFFFFfFFFo..', '..oFFFFFFFffFFo.', '.oFFFFFFFFFFFFFo', '.oFfFFFFFFFFFfFo', '.oFFfFFFFFFFfFFo', '..oFFfFFFFfFFFo.', '...oFFwwwWWFFo..', '....oowwwWWoo...', '.....owwoWWo....', '.....owgogwo....', '.....owooowo....', '....owwoooWwo...', '...owowwoWWowo..', '..oWWWWWWWWWWo..'],
  'goblin-chief-lair': ['........o.......', '....o..ogo..o...', '...ogo.ogo.ogo..', '..oggoogrgoggo..', '..ogggogggogggo.', '.oggbgggggggbgo.', '.oddddddddddddo.', '..ooopppppppoo..', '...opppppppppo..', '..opooppppooppo.', '..oporpppproppo.', '..opppppppppppo.', '...opppooppppo..', '....opppppppo...', '....opopopoo....', '.....oooooo.....'],
  town: ['........o.......', '.......oro.oo...', '......orrdosso..', '.....orrrdrSSo..', '....orrrrdrrSo..', '...orrrrrrdrro..', '..orrrrrrrrdrro.', '.orrrrrrrrrrdrro', '.orrrrrrrrrrrdo.', '..oppppppppddo..', '..opbbpppppddo..', '..opbbpWWWpddo..', '..oppppWWWpddo..', '..oppppWWgpddo..', '..oppppWWWpddo..', '...oooooooooo...'],
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
  'sharp-fang': { a: '#8a93a6', d: '#4f576b', l: '#c3cadb' },
  toadskin: { a: '#6b8e3a', d: '#43601f', l: '#93b856' },
  'bone-shard': { a: '#e8dfc4', d: '#8a7a58', l: '#fffbe8' },
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

const CATALYST_TINT: Tint = { a: '#f2c14e', d: '#b9821f', l: '#fff0a8' };
const DEFAULT_TINT: Tint = { a: '#8d8f9a', d: '#5c5e6b', l: '#b4b6c0' };
const imageCache = new Map<string, HTMLCanvasElement>();

function tintFor(materialId: string, category: string): Tint {
  return TINT_BY_MATERIAL[materialId] ?? TINT_BY_CATEGORY[category] ?? DEFAULT_TINT;
}

function cachedCanvas(key: string, rows: Rows, legend: Readonly<Record<string, string>>): HTMLCanvasElement {
  let canvas = imageCache.get(key);
  if (!canvas) {
    canvas = drawAscii(rows, legend).canvas;
    imageCache.set(key, canvas);
  }
  return canvas;
}

function cachedImage(key: string, scale: number, rows: Rows, legend: Readonly<Record<string, string>>): HTMLImageElement {
  return drawingToImage({ canvas: cachedCanvas(key, rows, legend), fill: () => undefined }, scale);
}

// Travel to a new town frees the icons of lower tiers. A backpack item of a lower tier draws its icon again when the player looks at it.
export function releaseIconsBelowTier(tier: number): void {
  const lowerTierMaterialIds = new Set(MATERIALS.filter((material) => material.tier < tier).map((material) => material.id));
  for (const key of [...imageCache.keys()]) {
    const [kind, ...parts] = key.split(':');
    const materialId = parts[parts.length - 1] ?? '';
    if ((kind === 'item' || kind === 'material') && lowerTierMaterialIds.has(materialId)) imageCache.delete(key);
  }
}

export function drawItemIcon(baseId: string, materialId: string, mainCategory: string): HTMLCanvasElement {
  const tint = tintFor(materialId, mainCategory);
  const rows = stampSetEmblem(ITEM_SHAPE_ROWS[baseId] ?? ITEM_SHAPE_ROWS.sword ?? [], materialId);
  return cachedCanvas(`item:${baseId}:${materialId}`, rows, { ...BASE_LEGEND, ...tint });
}

export function createItemIcon(baseId: string, materialId: string, mainCategory: string, scale = 3): HTMLImageElement {
  return drawingToImage({ canvas: drawItemIcon(baseId, materialId, mainCategory), fill: () => undefined }, scale);
}

export function drawMaterialIcon(materialId: string, category: MaterialCategory): HTMLCanvasElement {
  const tint = tintFor(materialId, category);
  return cachedCanvas(`material:${materialId}`, MATERIAL_ROWS[category], { ...BASE_LEGEND, ...tint, ...(category === 'catalyst' ? CATALYST_TINT : {}) });
}

export function createMaterialIcon(materialId: string, category: MaterialCategory, scale = 3): HTMLImageElement {
  return drawingToImage({ canvas: drawMaterialIcon(materialId, category), fill: () => undefined }, scale);
}

const DUNGEON_LEGEND = { ...BASE_LEGEND, a: '#a8855a' };

export function drawDungeonIcon(dungeonId: string): HTMLCanvasElement {
  const rows = DUNGEON_ROWS[dungeonId] ?? DUNGEON_ROWS.town ?? [];
  return cachedCanvas(`dungeon:${dungeonId}`, rows, DUNGEON_LEGEND);
}

export function createDungeonIcon(dungeonId: string, scale = 3): HTMLImageElement {
  return drawingToImage({ canvas: drawDungeonIcon(dungeonId), fill: () => undefined }, scale);
}

const FIGHT_ROWS: Rows = ['.o............o.', 'olo..........olo', 'oslo........olso', '.oslo......olso.', '..oslo....olso..', '...oslo..olso...', '....osloolso....', '.....osllso.....', '....ogoslogo....', '.....oggsso.....', '....oWsggsWo....', '...oWoggggoWo...', '.ooWo.oooo.oWoo.', 'ogWo........oWgo', 'oggo........oggo', '.oo..........oo.'];

const LOCK_ROWS: Rows = ['....oooooooo....', '...osssssssso...', '...osssssssso...', '...ossooooSSo...', '...osso..oSSo...', '...osso..oSSo...', '..oossooooSSoo..', '.oggggggggggggo.', '.ogpggggggggggo.', '.oggpgggoggdddo.', '.ogggggooogdddo.', '.ogggggooggdddo.', '.ogggggooggdddo.', '.oddddddddddddo.', '.oddddddddddddo.', '..oooooooooooo..'];

export function drawLockIcon(): HTMLCanvasElement {
  return cachedCanvas('lock', LOCK_ROWS, BASE_LEGEND);
}

export function drawFightIcon(): HTMLCanvasElement {
  return cachedCanvas('fight', FIGHT_ROWS, BASE_LEGEND);
}

export function createLockIcon(scale = 3): HTMLImageElement {
  return cachedImage('lock', scale, LOCK_ROWS, BASE_LEGEND);
}

export function createFightIcon(scale = 2): HTMLImageElement {
  return cachedImage('fight', scale, FIGHT_ROWS, BASE_LEGEND);
}

export function createTownIcon(scale = 3): HTMLImageElement {
  return cachedImage('town', scale, DUNGEON_ROWS.town ?? [], BASE_LEGEND);
}
