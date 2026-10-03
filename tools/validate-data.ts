import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPRITE_ART } from '../src/render/spriteArt';

const dataDirectory = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'data');

interface Identified {
  id: string;
}
interface Material extends Identified {
  tier: number;
  category: string;
  sellValueCopper: number;
}
interface Drop {
  materialId: string;
  chance: number;
  minQuantity: number;
  maxQuantity: number;
}
interface Monster extends Identified {
  rank: string;
  spriteKey: string;
  drops: Drop[];
}
interface Dungeon extends Identified {
  townId: string;
  level: number;
  monsterIds: string[];
  rareMonsterId: string | null;
  bossMonsterId: string | null;
}
interface Town extends Identified {
  firstLevel: number;
  lastLevel: number;
}
interface BaseItem extends Identified {
  mainCategory: string;
  secondaryCategory: string;
  gearType: string;
  profession: string;
  width: number;
  height: number;
}
interface HeroClass extends Identified {
  spriteKey: string;
  weaponTypes: string[];
  offHandTypes: string[];
}
interface Affix extends Identified {
  stat: string;
}

const STAT_NAMES = ['hp', 'strength', 'magic', 'skill', 'speed', 'defence', 'resistance'];
const MONSTER_RANKS = ['normal', 'rare', 'boss'];

function load<Content>(file: string): Content {
  return JSON.parse(readFileSync(join(dataDirectory, file), 'utf8')) as Content;
}

const materials = load<Material[]>('materials.json');
const monsters = load<Monster[]>('monsters.json');
const dungeons = load<Dungeon[]>('dungeons.json');
const townsFile = load<{ startingTownId: string; towns: Town[] }>('towns.json');
const baseItems = load<BaseItem[]>('base-items.json');
const classes = load<HeroClass[]>('classes.json');
const affixes = load<Affix[]>('affixes.json');
const heroNames = load<string[]>('hero-names.json');
const professions = load<Record<string, string>>('professions.json');
const itemBalance = load<{ catalystMaterialId: string; levelsPerBracket: number }>('balance/items.json');

const problems: string[] = [];
const report = (message: string): void => {
  problems.push(message);
};

function checkUniqueIds(fileName: string, entries: readonly Identified[]): void {
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.id)) report(`${fileName}: duplicate id '${entry.id}'`);
    seen.add(entry.id);
  }
}

checkUniqueIds('materials.json', materials);
checkUniqueIds('monsters.json', monsters);
checkUniqueIds('dungeons.json', dungeons);
checkUniqueIds('towns.json', townsFile.towns);
checkUniqueIds('base-items.json', baseItems);
checkUniqueIds('classes.json', classes);
checkUniqueIds('affixes.json', affixes);
if (new Set(heroNames).size !== heroNames.length) report('hero-names.json: duplicate names');

const materialsById = new Map(materials.map((material) => [material.id, material]));
const monstersById = new Map(monsters.map((monster) => [monster.id, monster]));
const townsById = new Map(townsFile.towns.map((town) => [town.id, town]));
const bracketOf = (level: number): number => Math.ceil(level / itemBalance.levelsPerBracket);

if (!townsById.has(townsFile.startingTownId)) report(`towns.json: unknown startingTownId '${townsFile.startingTownId}'`);
townsFile.towns.forEach((town, index) => {
  const expectedFirstLevel = index * itemBalance.levelsPerBracket + 1;
  if (town.firstLevel !== expectedFirstLevel || town.lastLevel !== expectedFirstLevel + itemBalance.levelsPerBracket - 1) {
    report(`towns.json: town '${town.id}' must cover levels ${expectedFirstLevel}-${expectedFirstLevel + itemBalance.levelsPerBracket - 1}`);
  }
});

for (const material of materials) {
  if (material.tier < 1) report(`materials.json: '${material.id}' has an invalid tier`);
  if (material.sellValueCopper <= 0) report(`materials.json: '${material.id}' must have a positive sell value`);
}
const catalyst = materialsById.get(itemBalance.catalystMaterialId);
if (!catalyst || catalyst.category !== 'catalyst') report('balance/items.json: catalystMaterialId must name a catalyst material');

for (const monster of monsters) {
  if (!MONSTER_RANKS.includes(monster.rank)) report(`monsters.json: '${monster.id}' has an unknown rank '${monster.rank}'`);
  if (!SPRITE_ART[monster.spriteKey]) report(`monsters.json: '${monster.id}' uses unknown sprite '${monster.spriteKey}'`);
  for (const drop of monster.drops) {
    if (!materialsById.has(drop.materialId)) report(`monsters.json: '${monster.id}' drops unknown material '${drop.materialId}'`);
    if (drop.chance <= 0 || drop.chance > 1) report(`monsters.json: '${monster.id}' drop '${drop.materialId}' needs a chance between 0 and 1`);
    if (drop.minQuantity < 1 || drop.minQuantity > drop.maxQuantity) report(`monsters.json: '${monster.id}' drop '${drop.materialId}' has a bad quantity range`);
  }
}

for (const dungeon of dungeons) {
  const town = townsById.get(dungeon.townId);
  if (!town) report(`dungeons.json: '${dungeon.id}' uses unknown town '${dungeon.townId}'`);
  else if (dungeon.level < town.firstLevel || dungeon.level > town.lastLevel) {
    report(`dungeons.json: '${dungeon.id}' level ${dungeon.level} is outside its town bracket`);
  }
  const monsterIds = [...dungeon.monsterIds, ...(dungeon.rareMonsterId ? [dungeon.rareMonsterId] : []), ...(dungeon.bossMonsterId ? [dungeon.bossMonsterId] : [])];
  for (const monsterId of monsterIds) {
    const monster = monstersById.get(monsterId);
    if (!monster) {
      report(`dungeons.json: '${dungeon.id}' uses unknown monster '${monsterId}'`);
      continue;
    }
    for (const drop of monster.drops) {
      const material = materialsById.get(drop.materialId);
      if (material && material.tier !== bracketOf(dungeon.level)) {
        report(`bracket rule: '${monsterId}' in '${dungeon.id}' (tier ${bracketOf(dungeon.level)}) drops tier ${material.tier} material '${material.id}'`);
      }
    }
  }
  if (dungeon.rareMonsterId && monstersById.get(dungeon.rareMonsterId)?.rank !== 'rare') report(`dungeons.json: '${dungeon.id}' rareMonsterId must be a rare monster`);
  if (dungeon.bossMonsterId && monstersById.get(dungeon.bossMonsterId)?.rank !== 'boss') report(`dungeons.json: '${dungeon.id}' bossMonsterId must be a boss monster`);
}

const tiersWithMaterials = [...new Set(materials.map((material) => material.tier))];
for (const base of baseItems) {
  if (!professions[base.profession]) report(`base-items.json: '${base.id}' uses unknown profession '${base.profession}'`);
  if (base.width < 1 || base.height < 1) report(`base-items.json: '${base.id}' has an invalid size`);
  for (const tier of tiersWithMaterials) {
    for (const category of [base.mainCategory, base.secondaryCategory]) {
      const hasMaterial = materials.some((material) => material.tier === tier && material.category === category);
      if (!hasMaterial) report(`recipe rule: base '${base.id}' needs a '${category}' material in tier ${tier}`);
    }
  }
}

const gearTypes = new Set(baseItems.map((base) => base.gearType));
for (const heroClass of classes) {
  if (!SPRITE_ART[heroClass.spriteKey]) report(`classes.json: '${heroClass.id}' uses unknown sprite '${heroClass.spriteKey}'`);
  for (const gearType of [...heroClass.weaponTypes, ...heroClass.offHandTypes]) {
    if (!gearTypes.has(gearType)) report(`classes.json: '${heroClass.id}' allows gear type '${gearType}' that no base item has`);
  }
}
for (const affix of affixes) {
  if (!STAT_NAMES.includes(affix.stat)) report(`affixes.json: '${affix.id}' uses unknown stat '${affix.stat}'`);
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`Data OK (${materials.length} materials, ${monsters.length} monsters, ${dungeons.length} dungeons, ${baseItems.length} base items)`);
