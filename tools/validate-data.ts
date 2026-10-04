import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIGURE_DRAWERS } from '../src/render/castleFigureArt';
import { CREATURE_DRAWERS } from '../src/render/creatureArt';
import { CASTLE_SCREEN_COUNT, LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../src/kernel/stageSize';
import { ITEM_SHAPE_ROWS } from '../src/ui/itemShapes';
import { SPELL_ICON_MOTIFS } from '../src/content/spellVisuals';
import { SPELL_ICON_GLYPHS } from '../src/ui/spellIconGlyphs';
import { BUFF_ART_IDS, CAST_ART_IDS, DEBUFF_ART_IDS, IMPACT_ART_IDS, PROJECTILE_ART_IDS } from '../src/content/spellVisuals';
import { SPELL_THEMES } from '../src/render/spellEffects/spellThemes';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDirectory = join(projectRoot, 'data');

interface Identified {
  id: string;
}
interface Material extends Identified {
  name: string;
  craftedItemPrefix?: string;
  setBonus?: { stat: string; value: number };
  setCraftLevelOffset?: number;
  setBodyArmourCraftLevelOffset?: number;
  tier: number;
  category: string;
  sellValueCopper: number;
  width: number;
  height: number;
}
interface Drop {
  materialId: string;
  chance: number;
  minQuantity: number;
  maxQuantity: number;
}
interface Monster extends Identified {
  name: string;
  spellIds?: string[];
  hpFactor?: number;
  attackFactor?: number;
  defenceFactor?: number;
  fixedStats?: { hp: number; attack: number; defence: number; resistance: number };
  rank: string;
  spriteKey: string;
  drops: Drop[];
}
interface Dungeon extends Identified {
  name: string;
  unlockAfter: string | null;
  minimumHeroLevel: number;
  recommendedMaxLevel: number;
  minimumPartySize: number;
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
const RECIPE_OFFSETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const ARMOUR_PROFESSIONS = ['armoursmithing', 'tailoring'];
const ODD_RECIPE_OFFSETS = RECIPE_OFFSETS.filter((offset) => offset % 2 === 1);
interface BaseItem extends Identified {
  name: string;
  slot: string;
  craftLevelOffset: number;
  baseStats: Record<string, number>;
  mainCategory: string;
  gearType: string;
  armourWeight: string | null;
  profession: string;
  width: number;
  height: number;
}
interface HeroClass extends Identified {
  displayName: string;
  roleDescription: string;
  recoveryRate: number;
  resourceId: string;
  unlockAfterDungeonId: string | null;
  spriteKey: string;
  weaponTypes: string[];
  offHandTypes: string[];
  armourWeights: string[];
  attackKind: string;
  primaryAttribute: string;
}
interface Advancement extends Identified {
  baseClassId: string;
  promotesFrom: string;
  requiredLevel: number;
  displayName: string;
  roleDescription: string;
}
interface Affix extends Identified {
  displayName: string;
  stat: string;
}

const STAT_NAMES = ['hp', 'strength', 'magic', 'skill', 'speed', 'defence', 'resistance'];
const AFFIX_STAT_NAMES = [...STAT_NAMES, 'lifeSteal', 'criticalChance', 'criticalDamage'];
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
const advancements = load<Advancement[]>('advancements.json');
const affixes = load<Affix[]>('affixes.json');
const heroNames = load<string[]>('hero-names.json');
const professions = load<Record<string, string>>('professions.json');
const itemBalance = load<{ catalystMaterialId: string; levelsPerBracket: number; rareNameFirstParts: string[]; rareNameSecondParts: string[] }>('balance/items.json');
interface SpellEffectData {
  kind: string;
  target: string;
  power?: number;
  hits?: number;
  strength?: number;
  durationSeconds?: number;
  inflicts?: { status: string; strength: number; durationSeconds: number };
}
interface SpellData extends Identified {
  classId: string;
  unlockLevel: number;
  isUltimate: boolean;
  cooldownSeconds: number;
  resourceCost: number;
  effect: SpellEffectData;
}
const spells = load<SpellData[]>('spells.json');
const monsterSpells = load<Array<Omit<SpellData, 'classId' | 'unlockLevel'>>>('monster-spells.json');
const buildings = load<Array<Identified & { label: string | null; panelId: string | null; opens?: string; style: string }>>('buildings.json');
const castleSpots = load<{ spots: Array<Identified & { screen: number; kind: string; look: string | null; x: number; y: number; width: number; height: number; tales: number }> }>('castle.json').spots;
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
checkUniqueIds('advancements.json (with classes.json)', [...classes, ...advancements]);
checkUniqueIds('affixes.json', affixes);
checkUniqueIds('spells.json', spells);
checkUniqueIds('monster-spells.json', monsterSpells);
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
const millBalance = load<{
  baseStorageCapacity: number;
  storageCapacityUpgradeCostsCopper: number[];
  productionIntervalSecondsBySpeedUpgrade: number[];
  speedUpgradeCostsCopper: number[];
  producedMaterialIds: string[];
}>('balance/mill.json');
if (millBalance.baseStorageCapacity < 1) report('balance/mill.json: the Mill must hold at least 1 material');
if (millBalance.storageCapacityUpgradeCostsCopper.some((cost) => cost <= 0) || millBalance.speedUpgradeCostsCopper.some((cost) => cost <= 0)) report('balance/mill.json: every upgrade price must be positive');
const millIntervals = millBalance.productionIntervalSecondsBySpeedUpgrade;
if (millIntervals.length !== millBalance.speedUpgradeCostsCopper.length + 1) report('balance/mill.json: there must be one more production interval than speed upgrade prices');
if (millIntervals.some((seconds, index) => seconds <= 0 || (index > 0 && seconds >= (millIntervals[index - 1] ?? 0)))) report('balance/mill.json: the production intervals must be positive and shrink with each speed upgrade');
if (millBalance.producedMaterialIds.length === 0) report('balance/mill.json: the Mill needs at least one material');
for (const materialId of millBalance.producedMaterialIds) {
  const material = materialsById.get(materialId);
  if (!material) report(`balance/mill.json: unknown material '${materialId}'`);
  else if (material.tier !== 1 || material.setBonus) report(`balance/mill.json: '${materialId}' must be a basic tier 1 material without a set bonus`);
}
const catalyst = materialsById.get(itemBalance.catalystMaterialId);
if (!catalyst || catalyst.category !== 'catalyst') report('balance/items.json: catalystMaterialId must name a catalyst material');

for (const monster of monsters) {
  if (!MONSTER_RANKS.includes(monster.rank)) report(`monsters.json: '${monster.id}' has an unknown rank '${monster.rank}'`);
  if (!CREATURE_DRAWERS[monster.spriteKey]) report(`monsters.json: '${monster.id}' uses unknown sprite '${monster.spriteKey}'`);
  const hasFactors = monster.hpFactor !== undefined || monster.attackFactor !== undefined || monster.defenceFactor !== undefined;
  if (monster.rank === 'boss') {
    if (hasFactors) report(`monsters.json: boss '${monster.id}' must use fixedStats, not factors`);
    const stats = monster.fixedStats;
    if (!stats || !(stats.hp > 0 && stats.attack > 0 && stats.defence >= 0 && stats.resistance >= 0)) report(`monsters.json: boss '${monster.id}' needs fixedStats with hp, attack, defence and resistance`);
  } else {
    if (monster.fixedStats) report(`monsters.json: '${monster.id}' is not a boss, so it must use the level curve and factors, not fixedStats`);
    if (!(monster.hpFactor !== undefined && monster.hpFactor > 0 && monster.attackFactor !== undefined && monster.attackFactor > 0 && monster.defenceFactor !== undefined && monster.defenceFactor > 0)) report(`monsters.json: '${monster.id}' needs hpFactor, attackFactor and defenceFactor above 0`);
  }
  for (const drop of monster.drops) {
    if (!materialsById.has(drop.materialId)) report(`monsters.json: '${monster.id}' drops unknown material '${drop.materialId}'`);
    if (drop.chance <= 0 || drop.chance > 1) report(`monsters.json: '${monster.id}' drop '${drop.materialId}' needs a chance between 0 and 1`);
    if (drop.minQuantity < 1 || drop.minQuantity > drop.maxQuantity) report(`monsters.json: '${monster.id}' drop '${drop.materialId}' has a bad quantity range`);
  }
}

const dungeonOfMonster = new Map<string, string>();
const dungeonOfSprite = new Map<string, string>();
for (const dungeon of dungeons) {
  const monsterIdsInDungeon = [...dungeon.monsterIds, ...(dungeon.rareMonsterId ? [dungeon.rareMonsterId] : []), ...(dungeon.bossMonsterId ? [dungeon.bossMonsterId] : [])];
  for (const monsterId of new Set(monsterIdsInDungeon)) {
    const otherDungeonId = dungeonOfMonster.get(monsterId);
    if (otherDungeonId) report(`dungeons.json: monster '${monsterId}' is in both '${otherDungeonId}' and '${dungeon.id}'. Every dungeon needs its own monsters.`);
    dungeonOfMonster.set(monsterId, dungeon.id);
    const spriteKey = monstersById.get(monsterId)?.spriteKey;
    const otherSpriteDungeonId = spriteKey ? dungeonOfSprite.get(spriteKey) : undefined;
    if (spriteKey && otherSpriteDungeonId && otherSpriteDungeonId !== dungeon.id) report(`dungeons.json: sprite '${spriteKey}' looks the same in '${otherSpriteDungeonId}' and '${dungeon.id}'`);
    if (spriteKey) dungeonOfSprite.set(spriteKey, dungeon.id);
  }
}
const MAXIMUM_SHARED_MATERIALS_BETWEEN_DUNGEONS = 1;
const craftingMaterialsOfDungeon = (dungeon: Dungeon): Set<string> => {
  const normalMonsters = dungeon.monsterIds.map((monsterId) => monstersById.get(monsterId));
  const drops = normalMonsters.flatMap((monster) => monster?.drops ?? []);
  return new Set(drops.map((drop) => drop.materialId).filter((materialId) => !['essence', 'catalyst'].includes(materialsById.get(materialId)?.category ?? '')));
};
dungeons.forEach((dungeon, index) => {
  const materialsHere = craftingMaterialsOfDungeon(dungeon);
  for (const otherDungeon of dungeons.slice(index + 1)) {
    const sharedMaterials = [...craftingMaterialsOfDungeon(otherDungeon)].filter((materialId) => materialsHere.has(materialId));
    if (sharedMaterials.length > MAXIMUM_SHARED_MATERIALS_BETWEEN_DUNGEONS) report(`dungeons.json: '${dungeon.id}' and '${otherDungeon.id}' drop the same materials from normal monsters (${sharedMaterials.join(', ')}). Share at most ${MAXIMUM_SHARED_MATERIALS_BETWEEN_DUNGEONS}.`);
  }
});

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
  if (dungeon.minimumHeroLevel > dungeon.recommendedMaxLevel) report(`dungeons.json: '${dungeon.id}' has a bad level range`);
  if (dungeon.minimumHeroLevel > dungeon.level) report(`dungeons.json: '${dungeon.id}' needs a hero level above its monster level`);
  if (dungeon.maxPartySize < 1) report(`dungeons.json: '${dungeon.id}' needs maxPartySize of at least 1`);
  if (dungeon.minimumPartySize < 1 || dungeon.minimumPartySize > dungeon.maxPartySize) report(`dungeons.json: '${dungeon.id}' needs a minimumPartySize from 1 up to its maxPartySize`);
  if (dungeon.maxPartySize > 2) report(`dungeons.json: '${dungeon.id}' must have maxPartySize 1 or 2`);
  if ((dungeon.bossMonsterId !== null) !== (dungeon.minimumPartySize === 2)) report(`dungeons.json: '${dungeon.id}' needs minimumPartySize 2 if and only if it has a boss`);
  if (dungeon.rareMonsterId && monstersById.get(dungeon.rareMonsterId)?.rank !== 'rare') report(`dungeons.json: '${dungeon.id}' rareMonsterId must be a rare monster`);
  if (dungeon.bossMonsterId && monstersById.get(dungeon.bossMonsterId)?.rank !== 'boss') report(`dungeons.json: '${dungeon.id}' bossMonsterId must be a boss monster`);
}

const droppedMaterialIds = new Set(monsters.flatMap((monster) => (monster as unknown as { drops: Array<{ materialId: string }> }).drops.map((drop) => drop.materialId)));
for (const material of materials) {
  if (material.category !== 'catalyst' && !droppedMaterialIds.has(material.id)) report(`monsters.json: no monster drops material '${material.id}'`);
}

const tiersWithMaterials = [...new Set(materials.map((material) => material.tier))];
for (const material of materials) {
  if (!(material.width >= 1 && material.height >= 1)) report(`materials.json: '${material.id}' needs a width and a height of at least 1`);
}
for (const base of baseItems) {
  const shapeRows = ITEM_SHAPE_ROWS[base.id];
  if (!shapeRows) report(`ui/itemShapes.ts: base item '${base.id}' has no icon picture`);
  else if (shapeRows.length !== 12 || shapeRows.some((row) => row.length !== 12)) report(`ui/itemShapes.ts: the picture of '${base.id}' must be 12 rows of 12 letters`);
  if (!professions[base.profession]) report(`base-items.json: '${base.id}' uses unknown profession '${base.profession}'`);
  if (!RECIPE_OFFSETS.includes(base.craftLevelOffset)) report(`base-items.json: '${base.id}' needs a craftLevelOffset of ${RECIPE_OFFSETS.join(', ')}`);
  if (!ARMOUR_PROFESSIONS.includes(base.profession) && !ODD_RECIPE_OFFSETS.includes(base.craftLevelOffset)) report(`base-items.json: '${base.id}' needs an odd craftLevelOffset (${ODD_RECIPE_OFFSETS.join(', ')}), only armour bases may use even levels`);
  if (base.craftLevelOffset < 1 || base.craftLevelOffset > itemBalance.levelsPerBracket) report(`base-items.json: '${base.id}' needs a craftLevelOffset from 1 to ${itemBalance.levelsPerBracket}`);
  if (base.width < 1 || base.height < 1) report(`base-items.json: '${base.id}' has an invalid size`);
  for (const tier of tiersWithMaterials) {
    for (const category of [base.mainCategory]) {
      const hasMaterial = materials.some((material) => material.tier === tier && material.category === category);
      if (!hasMaterial) report(`recipe rule: base '${base.id}' needs a '${category}' material in tier ${tier}`);
    }
  }
}

// A class must get a stronger weapon every 2 crafter levels, so a bracket never leaves a hero with one weapon until the boss.
// Weapons and jewellery open on an odd crafter level (1, 3, 5, 7 or 9), and each new weapon of a class beats every weapon before it.
const MAXIMUM_WEAPON_OFFSET_GAP = 2;
const MINIMUM_LAST_WEAPON_OFFSET = 7;
// Base materials (ore, wood, hide, cloth) drop only in the first dungeons of a bracket. Later dungeons drop beast parts, gems and essence.
const BASE_MATERIAL_CATEGORIES = ['ore', 'wood', 'hide', 'cloth'];
for (const dungeon of dungeons) {
  const firstLevelOfBracket = Math.min(...dungeons.filter((other) => bracketOf(other.level) === bracketOf(dungeon.level)).map((other) => other.level));
  if (dungeon.level === firstLevelOfBracket) continue;
  const monsterIdsInDungeon = [...dungeon.monsterIds, ...(dungeon.rareMonsterId ? [dungeon.rareMonsterId] : []), ...(dungeon.bossMonsterId ? [dungeon.bossMonsterId] : [])];
  for (const drop of monsterIdsInDungeon.flatMap((monsterId) => monstersById.get(monsterId)?.drops ?? [])) {
    const category = materialsById.get(drop.materialId)?.category ?? '';
    if (BASE_MATERIAL_CATEGORIES.includes(category)) report(`base material rule: '${dungeon.id}' (level ${dungeon.level}) drops base material '${drop.materialId}'. Base materials drop only in the first dungeons of a bracket.`);
  }
}

// A set material is dropped by one dungeon only, and every dungeon after the first of its bracket drops exactly one.
// The set recipe opens at or after the level of that dungeon.
const dungeonsDroppingMaterial = (materialId: string): Dungeon[] => dungeons.filter((dungeon) =>
  [...dungeon.monsterIds, ...(dungeon.rareMonsterId ? [dungeon.rareMonsterId] : []), ...(dungeon.bossMonsterId ? [dungeon.bossMonsterId] : [])]
    .some((monsterId) => monstersById.get(monsterId)?.drops.some((drop) => drop.materialId === materialId)));
const upgradeBalance = load<{ upgradeMaximumLevel: number; upgradeChanceAtRecipeLevel: number[]; upgradeChanceFarAboveRecipe: number[] }>('balance/crafting.json');
for (const [name, chances] of [['upgradeChanceAtRecipeLevel', upgradeBalance.upgradeChanceAtRecipeLevel], ['upgradeChanceFarAboveRecipe', upgradeBalance.upgradeChanceFarAboveRecipe]] as const) {
  if (chances.length !== upgradeBalance.upgradeMaximumLevel) report(`balance/crafting.json: ${name} needs one chance for each upgrade level (${upgradeBalance.upgradeMaximumLevel})`);
  chances.forEach((chance, index) => {
    if (!(chance > 0 && chance < 1) || (index > 0 && chance >= (chances[index - 1] ?? 1))) report(`balance/crafting.json: ${name} must fall with each upgrade level and stay between 0 and 1`);
  });
}
upgradeBalance.upgradeChanceFarAboveRecipe.forEach((chance, index) => {
  if (chance < (upgradeBalance.upgradeChanceAtRecipeLevel[index] ?? 0)) report('balance/crafting.json: a crafter far above the recipe must not do worse than one at the recipe level');
});
const setMaterials = materials.filter((material) => material.setBonus !== undefined);
for (const material of setMaterials) {
  const { setBonus, setCraftLevelOffset } = material;
  if (!setBonus || !STAT_NAMES.includes(setBonus.stat) || !(setBonus.value > 0)) report(`materials.json: set material '${material.id}' needs a bonus on a known stat above 0`);
  if (!material.craftedItemPrefix) report(`materials.json: set material '${material.id}' needs a craftedItemPrefix`);
  if (material.setBodyArmourCraftLevelOffset === undefined || material.setBodyArmourCraftLevelOffset < (setCraftLevelOffset ?? 0)) report(`materials.json: set material '${material.id}' needs a setBodyArmourCraftLevelOffset that is not below its setCraftLevelOffset`);
  const sources = dungeonsDroppingMaterial(material.id);
  if (sources.length !== 1) report(`materials.json: set material '${material.id}' must drop in exactly one dungeon (found ${sources.length})`);
  const source = sources[0];
  if (source && (setCraftLevelOffset === undefined || setCraftLevelOffset < source.level - (material.tier - 1) * itemBalance.levelsPerBracket || setCraftLevelOffset > itemBalance.levelsPerBracket)) {
    report(`materials.json: set material '${material.id}' needs a setCraftLevelOffset from the level of '${source.id}' up to ${itemBalance.levelsPerBracket}`);
  }
}
for (const dungeon of dungeons) {
  const firstLevelOfBracket = Math.min(...dungeons.filter((other) => bracketOf(other.level) === bracketOf(dungeon.level)).map((other) => other.level));
  if (dungeon.level === firstLevelOfBracket) continue;
  const setMaterialsHere = setMaterials.filter((material) => dungeonsDroppingMaterial(material.id).some((source) => source.id === dungeon.id));
  if (setMaterialsHere.length !== 1) report(`dungeons.json: '${dungeon.id}' must drop exactly one set material (found ${setMaterialsHere.length})`);
}

// A recipe must not need a material that first drops in a dungeon above the recipe's craft level.
const firstDungeonLevelOfCategory = new Map<string, number>();
for (const dungeon of dungeons.filter((candidate) => bracketOf(candidate.level) === 1)) {
  for (const monsterId of dungeon.monsterIds) {
    for (const drop of monstersById.get(monsterId)?.drops ?? []) {
      const category = materialsById.get(drop.materialId)?.category;
      if (category) firstDungeonLevelOfCategory.set(category, Math.min(dungeon.level, firstDungeonLevelOfCategory.get(category) ?? Infinity));
    }
  }
}
for (const base of baseItems) {
  for (const category of [base.mainCategory]) {
    const dungeonLevel = firstDungeonLevelOfCategory.get(category);
    if (dungeonLevel === undefined || dungeonLevel > base.craftLevelOffset) report(`recipe rule: '${base.id}' needs craft level ${base.craftLevelOffset}, but '${category}' first drops in a level ${dungeonLevel} dungeon`);
  }
}

// Armour sets come one piece at a time. The set pieces open on the odd crafter levels, one every 2 levels, and the body armour is the last piece.
// Other armour bases (shield, belt, tome) open on even levels, so no two armour bases of a profession share a crafter level.
const ARMOUR_SET_LEVEL_STEP = 2;
const ARMOUR_SET_PIECE_SLOTS = ['helm', 'gloves', 'boots', 'legs', 'armour'];
const ARMOUR_EXTRA_SLOTS = ['belt', 'offHand'];
for (const professionId of ARMOUR_PROFESSIONS) {
  const armourBases = baseItems.filter((base) => base.profession === professionId && [...ARMOUR_SET_PIECE_SLOTS, ...ARMOUR_EXTRA_SLOTS].includes(base.slot));
  const setPieces = armourBases.filter((base) => ARMOUR_SET_PIECE_SLOTS.includes(base.slot));
  const lastOtherOffset = Math.max(...armourBases.filter((base) => base.slot !== 'armour').map((base) => base.craftLevelOffset));
  for (const bodyArmour of setPieces.filter((base) => base.slot === 'armour')) {
    if (bodyArmour.craftLevelOffset <= lastOtherOffset) report(`base-items.json: body armour '${bodyArmour.id}' (offset ${bodyArmour.craftLevelOffset}) must come after every other piece of ${professionId} (last offset ${lastOtherOffset})`);
  }
  const offsets = [...new Set(setPieces.map((base) => base.craftLevelOffset))].sort((first, second) => first - second);
  offsets.forEach((offset, index) => {
    const expectedOffset = 1 + ARMOUR_SET_LEVEL_STEP * index;
    if (offset !== expectedOffset) report(`base-items.json: ${professionId} set pieces must unlock every ${ARMOUR_SET_LEVEL_STEP} crafter levels from 1, but found offset ${offset} where ${expectedOffset} is expected`);
  });
  const distinctSlotOffsets = new Map<number, string>();
  for (const base of armourBases) {
    const clashingSlot = distinctSlotOffsets.get(base.craftLevelOffset);
    if (clashingSlot !== undefined && clashingSlot !== base.slot) report(`base-items.json: ${professionId} slots '${clashingSlot}' and '${base.slot}' both open at crafter level ${base.craftLevelOffset}`);
    distinctSlotOffsets.set(base.craftLevelOffset, base.slot);
  }
  for (const base of armourBases.filter((candidate) => ARMOUR_EXTRA_SLOTS.includes(candidate.slot))) {
    if (base.craftLevelOffset % 2 !== 0) report(`base-items.json: '${base.id}' is not a set piece, so it needs an even crafter level (found ${base.craftLevelOffset})`);
  }
}
const gearTypes = new Set(baseItems.map((base) => base.gearType));
for (const heroClass of classes) {
  if (!['strength', 'skill', 'magic'].includes(heroClass.primaryAttribute)) report(`classes.json: '${heroClass.id}' has an unknown primaryAttribute '${heroClass.primaryAttribute}'`);
  if (heroClass.attackKind === 'magic' && heroClass.primaryAttribute !== 'magic') report(`classes.json: '${heroClass.id}' attacks with magic, so its primaryAttribute must be magic`);
  if (heroClass.attackKind === 'physical' && heroClass.primaryAttribute === 'magic') report(`classes.json: '${heroClass.id}' attacks with physical damage, so its primaryAttribute must be strength or skill`);
  if (!(heroClass.recoveryRate > 0)) report(`classes.json: '${heroClass.id}' needs a recoveryRate above 0`);
  const startingRecipes = baseItems.filter((base) => base.craftLevelOffset === 1);
  if (!startingRecipes.some((base) => heroClass.weaponTypes.includes(base.gearType))) report(`base-items.json: class '${heroClass.id}' has no weapon it can craft at crafter level 1`);
  if (!startingRecipes.some((base) => heroClass.armourWeights.includes(base.armourWeight ?? ''))) report(`base-items.json: class '${heroClass.id}' has no armour it can craft at crafter level 1`);
  const weaponOffsets = baseItems
    .filter((base) => base.slot === 'mainHand' && heroClass.weaponTypes.includes(base.gearType))
    .map((base) => base.craftLevelOffset)
    .sort((first, second) => first - second);
  const damageStat = heroClass.attackKind === 'magic' ? 'magicalDamage' : 'physicalDamage';
  const bestDamageByOffset = new Map<number, number>();
  for (const weapon of baseItems.filter((base) => base.slot === 'mainHand' && heroClass.weaponTypes.includes(base.gearType))) {
    bestDamageByOffset.set(weapon.craftLevelOffset, Math.max(bestDamageByOffset.get(weapon.craftLevelOffset) ?? 0, weapon.baseStats[damageStat] ?? 0));
  }
  let bestDamageSoFar = 0;
  for (const [offset, damage] of [...bestDamageByOffset].sort((first, second) => first[0] - second[0])) {
    if (damage <= bestDamageSoFar) report(`base-items.json: class '${heroClass.id}' gets no stronger weapon at crafter level ${offset} (best ${damageStat} ${damage}, earlier weapons reach ${bestDamageSoFar})`);
    bestDamageSoFar = Math.max(bestDamageSoFar, damage);
  }
  weaponOffsets.forEach((offset, index) => {
    const previousOffset = weaponOffsets[index - 1] ?? 1;
    if (offset - previousOffset > MAXIMUM_WEAPON_OFFSET_GAP) report(`base-items.json: class '${heroClass.id}' waits ${offset - previousOffset} crafter levels for the weapon at offset ${offset}. The limit is ${MAXIMUM_WEAPON_OFFSET_GAP}`);
  });
  if ((weaponOffsets.at(-1) ?? 0) < MINIMUM_LAST_WEAPON_OFFSET) report(`base-items.json: class '${heroClass.id}' has no weapon at offset ${MINIMUM_LAST_WEAPON_OFFSET} or higher`);
  for (const gearType of [...heroClass.weaponTypes, ...heroClass.offHandTypes]) {
    if (!gearTypes.has(gearType)) report(`classes.json: '${heroClass.id}' allows gear type '${gearType}' that no base item has`);
  }
}
const FIRST_PROMOTION_LEVEL = 20;
const MASTER_PROMOTION_LEVEL = 50;
const dungeonIds = new Set(dungeons.map((dungeon) => dungeon.id));
const startingClasses = classes.filter((heroClass) => heroClass.unlockAfterDungeonId === null);
if (startingClasses.length === 0) report('classes.json: at least one class must be open from the start');
for (const heroClass of classes) {
  if (heroClass.unlockAfterDungeonId !== null && !dungeonIds.has(heroClass.unlockAfterDungeonId)) report(`classes.json: '${heroClass.id}' unlocks after unknown dungeon '${heroClass.unlockAfterDungeonId}'`);
  const branches = advancements.filter((advancement) => advancement.baseClassId === heroClass.id && advancement.promotesFrom === heroClass.id);
  if (branches.length !== 2) report(`advancements.json: base class '${heroClass.id}' needs exactly 2 branches, found ${branches.length}`);
  for (const branch of branches) {
    if (branch.requiredLevel !== FIRST_PROMOTION_LEVEL) report(`advancements.json: branch '${branch.id}' must need level ${FIRST_PROMOTION_LEVEL}`);
    const masters = advancements.filter((advancement) => advancement.promotesFrom === branch.id);
    if (masters.length !== 1) report(`advancements.json: branch '${branch.id}' needs exactly 1 master class, found ${masters.length}`);
    for (const master of masters) {
      if (master.requiredLevel !== MASTER_PROMOTION_LEVEL) report(`advancements.json: master '${master.id}' must need level ${MASTER_PROMOTION_LEVEL}`);
      if (master.baseClassId !== heroClass.id) report(`advancements.json: master '${master.id}' must keep base class '${heroClass.id}'`);
    }
  }
}
const advancementParentIds = new Set([...classes.map((heroClass) => heroClass.id), ...advancements.map((advancement) => advancement.id)]);
for (const advancement of advancements) {
  if (!advancementParentIds.has(advancement.promotesFrom)) report(`advancements.json: '${advancement.id}' promotes from unknown class '${advancement.promotesFrom}'`);
}
const progressionBalance = load<{ victoryDungeonId: string }>('balance/progression.json');
const victoryDungeon = dungeons.find((dungeon) => dungeon.id === progressionBalance.victoryDungeonId);
if (!victoryDungeon) report(`balance/progression.json: victoryDungeonId '${progressionBalance.victoryDungeonId}' is not a dungeon`);
else if (!victoryDungeon.bossMonsterId) report(`balance/progression.json: victory dungeon '${victoryDungeon.id}' needs a boss`);
for (const affix of affixes) {
  if (!AFFIX_STAT_NAMES.includes(affix.stat)) report(`affixes.json: '${affix.id}' uses unknown stat '${affix.stat}'`);
}


const PANEL_IDS = ['heroes', 'inventory', 'dungeons', 'world', 'settings', 'tavern', 'workshop', 'merchant', 'bank', 'academy', 'mill'];
const FIXED_KEY_GROUPS: Record<string, string[]> = {
  quality: ['common', 'magic', 'rare', 'unique'],
  resource: ['mana', 'stamina', 'hatred', 'rage'],
  statname: ['hp', 'health', 'lifeSteal', 'criticalChance', 'criticalDamage', 'physicalDamage', 'magicalDamage', 'defence', 'armour', 'resistance', 'speed', 'strength', 'skill', 'magic'],
  slot: ['mainHand', 'offHand', 'helm', 'armour', 'gloves', 'legs', 'boots', 'belt', 'amulet', 'ringOne', 'ringTwo'],
  category: ['ore', 'wood', 'hide', 'cloth', 'gem', 'fang', 'scale', 'bone', 'sinew', 'skin', 'silk', 'essence', 'catalyst'],
  armourweight: ['heavy', 'medium', 'light'],
  endreason: ['stopped', 'party-defeated', 'party-weakened', 'backpack-full'],
};

function expectedEnglishNames(): Array<[string, string]> {
  const expected: Array<[string, string]> = [];
  for (const heroClass of classes) {
    expected.push([`class.${heroClass.id}.name`, heroClass.displayName], [`class.${heroClass.id}.role`, heroClass.roleDescription]);
  }
  for (const advancement of advancements) {
    expected.push([`class.${advancement.id}.name`, advancement.displayName], [`class.${advancement.id}.role`, advancement.roleDescription]);
  }
  for (const monster of monsters) expected.push([`monster.${monster.id}`, monster.name]);
  for (const material of materials) {
    expected.push([`material.${material.id}`, material.name]);
    if (material.craftedItemPrefix) expected.push([`material.${material.id}.prefix`, material.craftedItemPrefix]);
  }
  for (const dungeon of dungeons) expected.push([`dungeon.${dungeon.id}`, dungeon.name]);
  for (const town of townsFile.towns) expected.push([`town.${town.id}`, town.name], [`town.${town.id}.region`, town.region]);
  for (const building of buildings) if (building.label !== null) expected.push([`building.${building.id}`, building.label]);
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
  keys.push('lore.prologue.title', 'lore.prologue.1', 'lore.prologue.2', 'lore.prologue.3', 'lore.begin');
  keys.push('castle.leave', 'castle.farewell');
  for (let screen = 0; screen < CASTLE_SCREEN_COUNT; screen++) keys.push(`castle.screen.${screen}`);
  for (const spot of castleSpots) {
    keys.push(`castle.${spot.id}.name`, `castle.${spot.id}.title`);
    for (let tale = 1; tale <= spot.tales; tale++) keys.push(`castle.${spot.id}.tale.${tale}`);
  }
  for (const spell of [...spells, ...monsterSpells]) keys.push(`spell.${spell.id}`);
  for (const affix of affixes) keys.push(`affix.${affix.id}.short`);
  for (const town of townsFile.towns) keys.push(`town.${town.id}.lore`);
  for (const monster of monsters) keys.push(`monster.${monster.id}.lore`);
  for (const material of materials) keys.push(`material.${material.id}.lore`);
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

function checkCastle(): void {
  const knownIds = new Set<string>();
  for (const spot of castleSpots) {
    if (knownIds.has(spot.id)) report(`castle.json: duplicate spot '${spot.id}'`);
    knownIds.add(spot.id);
    if (spot.screen < 0 || spot.screen >= CASTLE_SCREEN_COUNT) report(`castle.json: '${spot.id}' is on screen ${spot.screen}, but the castle has ${CASTLE_SCREEN_COUNT} screens`);
    if (spot.kind === 'person' && (spot.look === null || !FIGURE_DRAWERS[spot.look])) report(`castle.json: person '${spot.id}' uses unknown figure look '${spot.look}'`);
    if (spot.kind === 'landmark' && spot.look !== null) report(`castle.json: landmark '${spot.id}' must have look null, because the backdrop draws it`);
    const fitsScreen = spot.x - spot.width / 2 >= 0 && spot.x + spot.width / 2 <= LOGICAL_WIDTH && spot.y - spot.height >= 0 && spot.y <= LOGICAL_HEIGHT;
    if (!fitsScreen) report(`castle.json: '${spot.id}' reaches outside its screen`);
    if (spot.tales < 1) report(`castle.json: '${spot.id}' needs at least one tale`);
  }
  for (const building of buildings) if (building.opens !== undefined && building.opens !== 'castle') report(`buildings.json: '${building.id}' opens unknown place '${building.opens}'`);
}

checkCastle();

for (const town of townsFile.towns) {
  const townDungeons = dungeons.filter((dungeon) => dungeon.townId === town.id);
  if (townDungeons.length > 0 && townDungeons.filter((dungeon) => dungeon.unlockAfter === null).length !== 1) report(`dungeons.json: town '${town.id}' must have exactly one dungeon that is open from the start`);
}

const resourceRules = load<Record<string, { attribute: string; startFraction: number; regenFractionPerSecond: number; gainFractionPerHitDealt: number; gainFractionPerHitTaken: number }>>('balance/resources.json');

function checkResources(): void {
  for (const heroClass of classes) if (!(heroClass.resourceId in resourceRules)) report(`classes.json: '${heroClass.id}' uses unknown resource '${heroClass.resourceId}'`);
  for (const [resourceId, rules] of Object.entries(resourceRules)) {
    if (!STAT_NAMES.includes(rules.attribute)) report(`balance/resources.json: '${resourceId}' uses unknown attribute '${rules.attribute}'`);
    if (rules.startFraction < 0 || rules.startFraction > 1) report(`balance/resources.json: '${resourceId}' start fraction must be between 0 and 1`);
    const canFill = rules.regenFractionPerSecond > 0 || rules.gainFractionPerHitDealt > 0 || rules.gainFractionPerHitTaken > 0;
    if (rules.startFraction === 0 && !canFill) report(`balance/resources.json: '${resourceId}' starts empty and never fills`);
  }
}

checkResources();

function checkSpellEffect(file: string, spell: Omit<SpellData, 'classId' | 'unlockLevel'>): void {
  if (spell.cooldownSeconds <= 0 || spell.resourceCost < 0) report(`${file}: '${spell.id}' needs a positive cooldown and a resource cost of 0 or more`);
  const { effect } = spell;
  const needsPower = effect.kind === 'damage' || effect.kind === 'drain' || effect.kind === 'heal';
  if (needsPower && !(effect.power !== undefined && effect.power > 0)) report(`${file}: '${spell.id}' needs a positive power`);
  if (effect.kind === 'status' && !((effect.strength ?? 0) > 0 && (effect.strength ?? 0) < 1 && (effect.durationSeconds ?? 0) > 0)) report(`${file}: '${spell.id}' status needs a strength between 0 and 1 and a duration`);
  if (!['damage', 'drain', 'heal', 'status'].includes(effect.kind)) report(`${file}: '${spell.id}' has unknown effect '${effect.kind}'`);
  if (effect.inflicts) {
    if (effect.kind !== 'damage') report(`${file}: '${spell.id}' can only inflict a status with a damage effect`);
    if (!['guard', 'haste', 'weaken', 'slow', 'wound'].includes(effect.inflicts.status)) report(`${file}: '${spell.id}' inflicts unknown status '${effect.inflicts.status}'`);
    if (!(effect.inflicts.strength > 0 && effect.inflicts.strength < 1 && effect.inflicts.durationSeconds > 0)) report(`${file}: '${spell.id}' inflicted status needs a strength between 0 and 1 and a duration`);
  }
}

function checkMonsterSpells(): void {
  const castSpellIds = new Set(monsters.flatMap((monster) => monster.spellIds ?? []));
  for (const monster of monsters) {
    for (const spellId of monster.spellIds ?? []) {
      if (!monsterSpells.some((spell) => spell.id === spellId)) report(`monsters.json: '${monster.id}' casts unknown spell '${spellId}'`);
      if (!spellId.startsWith(`${monster.id}.`)) report(`monsters.json: spell '${spellId}' must start with the id of its monster '${monster.id}'`);
    }
  }
  for (const spell of monsterSpells) {
    checkSpellEffect('monster-spells.json', spell);
    if (!castSpellIds.has(spell.id)) report(`monster-spells.json: no monster casts '${spell.id}'`);
  }
}
checkMonsterSpells();

function checkSpells(): void {
  const classIds = new Set(classes.map((heroClass) => heroClass.id));
  for (const spell of spells) {
    if (!classIds.has(spell.classId)) report(`spells.json: '${spell.id}' has unknown class '${spell.classId}'`);
    if (!spell.id.startsWith(`${spell.classId}.`)) report(`spells.json: '${spell.id}' must start with its class id`);
    if (spell.unlockLevel < 1 || spell.unlockLevel > 100) report(`spells.json: '${spell.id}' unlock level is outside 1-100`);
    checkSpellEffect('spells.json', spell);
  }
  for (const heroClass of classes) {
    const own = spells.filter((spell) => spell.classId === heroClass.id);
    if (!own.some((spell) => spell.unlockLevel === 2 && !spell.isUltimate)) report(`spells.json: class '${heroClass.id}' needs a normal spell at level 2`);
    if (!own.some((spell) => spell.isUltimate)) report(`spells.json: class '${heroClass.id}' needs an ultimate spell`);
    if (new Set(own.map((spell) => `${spell.unlockLevel}-${spell.isUltimate}`)).size !== own.length) report(`spells.json: class '${heroClass.id}' has two spells of one kind at one level`);
  }
}

checkSpells();

// Every spell up to level 10 has a look (cast, projectile, impact, buff or debuff) and a sound for each part of its look.
const SPELLS_WITH_LOOK_UP_TO_LEVEL = 10;
interface SpellLookData {
  theme: string;
  icon?: string;
  cast?: string;
  projectile?: string;
  impact?: string;
  buff?: string;
  debuff?: string;
}
function checkSpellLooks(): void {
  for (const motif of SPELL_ICON_MOTIFS) {
    const rows = SPELL_ICON_GLYPHS[motif];
    if (rows.length !== 12 || rows.some((row) => row.length !== 12)) report(`ui/spellIconGlyphs.ts: the icon '${motif}' must be 12 rows of 12 letters`);
  }
  const looks = load<{ spells: Record<string, SpellLookData> }>('spell-visuals.json').spells;
  const audio = load<{ effects: Record<string, unknown>; spellSounds: Record<string, Partial<Record<'cast' | 'projectile' | 'impact' | 'buff' | 'debuff', string>>> }>('audio/sound-effects.json');
  const artIdsByPhase = { cast: CAST_ART_IDS, projectile: PROJECTILE_ART_IDS, impact: IMPACT_ART_IDS, buff: BUFF_ART_IDS, debuff: DEBUFF_ART_IDS } as const;
  const phases = Object.keys(artIdsByPhase) as Array<keyof typeof artIdsByPhase>;
  for (const spell of spells) {
    if (spell.unlockLevel <= SPELLS_WITH_LOOK_UP_TO_LEVEL && !looks[spell.id]) report(`spell-visuals.json: spell '${spell.id}' (level ${spell.unlockLevel}) has no look`);
    if (spell.unlockLevel <= SPELLS_WITH_LOOK_UP_TO_LEVEL && !audio.spellSounds[spell.id]) report(`audio/sound-effects.json: spell '${spell.id}' (level ${spell.unlockLevel}) has no sounds`);
  }
  for (const [spellId, look] of Object.entries(looks)) {
    const spell = spells.find((candidate) => candidate.id === spellId);
    if (!spell) {
      report(`spell-visuals.json: unknown spell '${spellId}'`);
      continue;
    }
    if (look.icon === undefined || !(SPELL_ICON_MOTIFS as readonly string[]).includes(look.icon)) report(`spell-visuals.json: '${spellId}' needs an icon from the list of icon motifs`);
    if (!(look.theme in SPELL_THEMES)) report(`spell-visuals.json: '${spellId}' has unknown theme '${look.theme}'`);
    const sounds = audio.spellSounds[spellId] ?? {};
    for (const phase of phases) {
      const artId = look[phase];
      if (artId === undefined) {
        if (sounds[phase] !== undefined) report(`audio/sound-effects.json: '${spellId}' has a ${phase} sound but no ${phase} look`);
        continue;
      }
      if (!(artIdsByPhase[phase] as readonly string[]).includes(artId)) report(`spell-visuals.json: '${spellId}' has unknown ${phase} look '${artId}'`);
      const soundId = sounds[phase];
      if (soundId === undefined) report(`audio/sound-effects.json: '${spellId}' has a ${phase} look but no ${phase} sound`);
      else if (!(soundId in audio.effects)) report(`audio/sound-effects.json: '${spellId}' uses unknown effect '${soundId}'`);
    }
    const { effect } = spell;
    if ((effect.kind === 'damage' || effect.kind === 'drain' || effect.kind === 'heal') && !look.impact) report(`spell-visuals.json: '${spellId}' needs an impact look`);
    if (effect.kind === 'damage' && effect.inflicts && !look.debuff) report(`spell-visuals.json: '${spellId}' inflicts a status, so it needs a debuff look`);
    if (effect.kind === 'status') {
      const isBuff = effect.target === 'self' || effect.target === 'allAllies';
      if (isBuff && !look.buff) report(`spell-visuals.json: '${spellId}' helps allies, so it needs a buff look`);
      if (!isBuff && !look.debuff) report(`spell-visuals.json: '${spellId}' hurts enemies, so it needs a debuff look`);
    }
  }
  for (const spellId of Object.keys(audio.spellSounds)) if (!looks[spellId]) report(`audio/sound-effects.json: spell sounds for '${spellId}' have no look in spell-visuals.json`);
}
checkSpellLooks();

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
