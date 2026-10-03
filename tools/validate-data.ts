import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CREATURE_DRAWERS } from '../src/render/creatureArt';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDirectory = join(projectRoot, 'data');

interface Identified {
  id: string;
}
interface Material extends Identified {
  name: string;
  craftedItemPrefix?: string;
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
  name: string;
  rank: string;
  spriteKey: string;
  drops: Drop[];
}
interface Dungeon extends Identified {
  name: string;
  unlockAfter: string | null;
  recommendedMinLevel: number;
  recommendedMaxLevel: number;
  maxPartySize: number;
  townId: string;
  level: number;
  monsterIds: string[];
  rareMonsterId: string | null;
  bossMonsterId: string | null;
}
interface Town extends Identified {
  name: string;
  region: string;
  firstLevel: number;
  lastLevel: number;
}
interface BaseItem extends Identified {
  name: string;
  craftLevelOffset: number;
  mainCategory: string;
  secondaryCategory: string;
  gearType: string;
  profession: string;
  width: number;
  height: number;
}
interface HeroClass extends Identified {
  displayName: string;
  roleDescription: string;
  spriteKey: string;
  weaponTypes: string[];
  offHandTypes: string[];
}
interface Affix extends Identified {
  displayName: string;
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
const itemBalance = load<{ catalystMaterialId: string; levelsPerBracket: number; rareNameFirstParts: string[]; rareNameSecondParts: string[] }>('balance/items.json');
const buildings = load<Array<Identified & { label: string; panelId: string | null }>>('buildings.json');
const languages = load<Array<{ id: string; nativeName: string }>>('i18n/languages.json');
const translationsByLanguage: Record<string, Record<string, string>> = {};
for (const language of languages) translationsByLanguage[language.id] = load<Record<string, string>>(`i18n/${language.id}.json`);

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
  if (!CREATURE_DRAWERS[monster.spriteKey]) report(`monsters.json: '${monster.id}' uses unknown sprite '${monster.spriteKey}'`);
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
  if (dungeon.unlockAfter !== null && !dungeons.some((other) => other.id === dungeon.unlockAfter)) report(`dungeons.json: '${dungeon.id}' unlocks after unknown dungeon '${dungeon.unlockAfter}'`);
  if (dungeon.recommendedMinLevel > dungeon.recommendedMaxLevel) report(`dungeons.json: '${dungeon.id}' has a bad recommended level range`);
  if (dungeon.maxPartySize < 1) report(`dungeons.json: '${dungeon.id}' needs maxPartySize of at least 1`);
  if (dungeon.bossMonsterId && dungeon.maxPartySize !== 2) report(`dungeons.json: boss dungeon '${dungeon.id}' must have maxPartySize 2`);
  if (!dungeon.bossMonsterId && dungeon.maxPartySize !== 1) report(`dungeons.json: normal dungeon '${dungeon.id}' must have maxPartySize 1`);
  if (dungeon.rareMonsterId && monstersById.get(dungeon.rareMonsterId)?.rank !== 'rare') report(`dungeons.json: '${dungeon.id}' rareMonsterId must be a rare monster`);
  if (dungeon.bossMonsterId && monstersById.get(dungeon.bossMonsterId)?.rank !== 'boss') report(`dungeons.json: '${dungeon.id}' bossMonsterId must be a boss monster`);
}

const tiersWithMaterials = [...new Set(materials.map((material) => material.tier))];
for (const base of baseItems) {
  if (!professions[base.profession]) report(`base-items.json: '${base.id}' uses unknown profession '${base.profession}'`);
  if (base.craftLevelOffset < 1 || base.craftLevelOffset > itemBalance.levelsPerBracket) report(`base-items.json: '${base.id}' needs a craftLevelOffset from 1 to ${itemBalance.levelsPerBracket}`);
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
  for (const gearType of [...heroClass.weaponTypes, ...heroClass.offHandTypes]) {
    if (!gearTypes.has(gearType)) report(`classes.json: '${heroClass.id}' allows gear type '${gearType}' that no base item has`);
  }
}
for (const affix of affixes) {
  if (!STAT_NAMES.includes(affix.stat)) report(`affixes.json: '${affix.id}' uses unknown stat '${affix.stat}'`);
}


const PANEL_IDS = ['heroes', 'inventory', 'dungeons', 'world', 'settings', 'tavern', 'workshop', 'merchant'];
const FIXED_KEY_GROUPS: Record<string, string[]> = {
  quality: ['common', 'magic', 'rare', 'unique'],
  stat: STAT_NAMES,
  slot: ['mainHand', 'offHand', 'helm', 'armour', 'gloves', 'boots', 'belt', 'amulet', 'ringOne', 'ringTwo'],
  category: ['ore', 'wood', 'hide', 'cloth', 'gem', 'fang', 'scale', 'bone', 'sinew', 'essence', 'catalyst'],
  armourweight: ['heavy', 'medium', 'light'],
  endreason: ['stopped', 'party-defeated', 'party-weakened', 'backpack-full'],
};

function expectedEnglishNames(): Array<[string, string]> {
  const expected: Array<[string, string]> = [];
  for (const heroClass of classes) {
    expected.push([`class.${heroClass.id}.name`, heroClass.displayName], [`class.${heroClass.id}.role`, heroClass.roleDescription]);
  }
  for (const monster of monsters) expected.push([`monster.${monster.id}`, monster.name]);
  for (const material of materials) {
    expected.push([`material.${material.id}`, material.name]);
    if (material.craftedItemPrefix) expected.push([`material.${material.id}.prefix`, material.craftedItemPrefix]);
  }
  for (const dungeon of dungeons) expected.push([`dungeon.${dungeon.id}`, dungeon.name]);
  for (const town of townsFile.towns) expected.push([`town.${town.id}`, town.name], [`town.${town.id}.region`, town.region]);
  for (const building of buildings) expected.push([`building.${building.id}`, building.label]);
  for (const base of baseItems) expected.push([`base.${base.id}`, base.name]);
  for (const affix of affixes) expected.push([`affix.${affix.id}`, affix.displayName]);
  for (const [professionId, label] of Object.entries(professions)) expected.push([`profession.${professionId}`, label]);
  for (const name of heroNames) expected.push([`heroname.${name}`, name]);
  for (const part of itemBalance.rareNameFirstParts) expected.push([`rarename.first.${part}`, part]);
  for (const part of itemBalance.rareNameSecondParts) expected.push([`rarename.second.${part}`, part]);
  return expected;
}

function expectedKeysWithoutEnglishSource(): string[] {
  const keys = PANEL_IDS.map((panelId) => `panel.${panelId}`);
  for (const [group, values] of Object.entries(FIXED_KEY_GROUPS)) keys.push(...values.map((value) => `${group}.${value}`));
  return keys;
}

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory, { recursive: true, encoding: 'utf8' })
    .filter((entry) => entry.endsWith('.ts'))
    .map((entry) => join(directory, entry));
}

function checkAudio(): void {
  const effects = load<{ effects: Record<string, unknown>; classAttack: Record<string, string>; monsterAttack: Record<string, string>; monsterHurt: Record<string, string>; armourHit: Record<string, string> }>('audio/sound-effects.json');
  const music = load<{ tracks: Record<string, { voices: Array<{ notes: string }> }> }>('audio/music.json');
  const mappedEffectIds = [...Object.values(effects.classAttack), ...Object.values(effects.monsterAttack), ...Object.values(effects.monsterHurt), ...Object.values(effects.armourHit)];
  for (const effectId of mappedEffectIds) if (!(effectId in effects.effects)) report(`audio/sound-effects.json: unknown effect '${effectId}'`);
  for (const heroClass of classes) if (!(heroClass.id in effects.classAttack)) report(`audio/sound-effects.json: class '${heroClass.id}' has no attack sound`);
  for (const monster of monsters) {
    if (!(monster.spriteKey in effects.monsterAttack)) report(`audio/sound-effects.json: sprite '${monster.spriteKey}' has no attack sound`);
    if (!(monster.spriteKey in effects.monsterHurt)) report(`audio/sound-effects.json: sprite '${monster.spriteKey}' has no hurt sound`);
  }
  for (const [trackId, track] of Object.entries(music.tracks)) {
    const lengths = track.voices.map((voice) => voice.notes.split(/\s+/).reduce((total, token) => total + Number(token.split(':')[1] ?? 1), 0));
    if (new Set(lengths).size !== 1) report(`audio/music.json: voices of track '${trackId}' must have the same length (found ${lengths.join(', ')})`);
  }
  for (const required of ['town', 'battle', 'boss']) if (!(required in music.tracks)) report(`audio/music.json: missing track '${required}'`);
}

checkAudio();

for (const town of townsFile.towns) {
  const townDungeons = dungeons.filter((dungeon) => dungeon.townId === town.id);
  if (townDungeons.length > 0 && townDungeons.filter((dungeon) => dungeon.unlockAfter === null).length !== 1) report(`dungeons.json: town '${town.id}' must have exactly one dungeon that is open from the start`);
}

function checkTranslations(): void {
  const english = translationsByLanguage.en;
  if (!english) return report('i18n: English translations are required');
  for (const [languageId, table] of Object.entries(translationsByLanguage)) {
    for (const key of Object.keys(english)) if (!(key in table)) report(`i18n/${languageId}.json: missing key '${key}'`);
    for (const key of Object.keys(table)) if (!(key in english)) report(`i18n/${languageId}.json: key '${key}' is not in en.json`);
    for (const [key, value] of Object.entries(table)) {
      if (value.includes('\u2014')) report(`i18n/${languageId}.json: '${key}' contains an em dash`);
      if (value === '' && key !== 'format.nameJoiner') report(`i18n/${languageId}.json: '${key}' is empty`);
    }
  }
  for (const [key, expectedValue] of expectedEnglishNames()) {
    if (english[key] !== expectedValue) report(`i18n/en.json: '${key}' should be '${expectedValue}' (same as the data file)`);
  }
  for (const key of expectedKeysWithoutEnglishSource()) if (!(key in english)) report(`i18n/en.json: missing key '${key}'`);

  const usedKeyPattern = /\bt\('([^'$`]+)'/g;
  for (const directory of ['src/ui', 'src/app']) {
    for (const file of listSourceFiles(join(projectRoot, directory))) {
      for (const match of readFileSync(file, 'utf8').matchAll(usedKeyPattern)) {
        const key = match[1] as string;
        if (!(key in english)) report(`${directory}: code uses unknown translation key '${key}' (${file.replace(projectRoot, '')})`);
      }
    }
  }
}

checkTranslations();

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`Data OK (${materials.length} materials, ${monsters.length} monsters, ${dungeons.length} dungeons, ${baseItems.length} base items)`);
