import { printEconomy } from './economy';
import { DUNGEONS, type DungeonDefinition } from '../../src/content/dungeons';
import { createRandom, type Random } from '../../src/kernel/random';
import type { ClassId, Hero } from '../../src/model/hero';
import { simulateBattle } from '../../src/systems/battle';
import { createEncounter } from '../../src/systems/dungeons';
import { equipItem } from '../../src/systems/equipment';
import { findRecipe } from '../../src/systems/crafting';
import { generateCraftedItem } from '../../src/systems/items';
import { equipSpell, learnSpell } from '../../src/systems/spells';
import { NORMAL_SPELL_SLOT_COUNT } from '../../src/content/balance/spells';
import { spellsOfClass } from '../../src/content/spells';
import { heroToBattleUnit } from '../../src/systems/stats';

const BATTLES_PER_CASE = 300;
const SHORT_FIGHT_SECONDS_AT_LEVEL_ONE = 7;
const SECONDS_ADDED_PER_LEVEL_IN_FIRST_TIER = 2;
const SECONDS_ADDED_PER_LEVEL_AFTER_FIRST_TIER = 0.4;
const LEVELS_PER_TIER = 10;
const BOSS_DURATION_MULTIPLIER = 5;

type GearMode = 'no gear' | 'best weapon only' | 'crafted gear' | 'gear + first spells' | 'gear + best spells';

interface PartyCase {
  label: string;
  classIds: readonly ClassId[];
}

const SOLO_CASES: readonly PartyCase[] = (['warrior', 'archer', 'mage', 'priest', 'thief', 'barbarian', 'fighter'] as const).map((classId) => ({ label: `solo ${classId}`, classIds: [classId] }));

const DUO_CASES: readonly PartyCase[] = [
  { label: 'duo warrior+priest', classIds: ['warrior', 'priest'] },
  { label: 'duo archer+mage', classIds: ['archer', 'mage'] },
  { label: 'duo thief+priest', classIds: ['thief', 'priest'] },
];

const GEAR_BASE_IDS_BY_CLASS: Record<ClassId, readonly string[]> = {
  warrior: ['broadsword', 'shield', 'helm-heavy', 'armour-heavy', 'gloves-heavy', 'boots-heavy', 'belt', 'amulet', 'ring', 'ring'],
  archer: ['warbow', 'quiver', 'helm-medium', 'armour-medium', 'gloves-medium', 'boots-medium', 'belt', 'amulet', 'ring', 'ring'],
  mage: ['arcane-staff', 'tome', 'helm-light', 'armour-light', 'gloves-light', 'boots-light', 'belt', 'amulet', 'ring', 'ring'],
  priest: ['scepter', 'tome', 'helm-light', 'armour-light', 'gloves-light', 'boots-light', 'belt', 'amulet', 'ring', 'ring'],
  barbarian: ['greataxe', 'helm-medium', 'armour-medium', 'gloves-medium', 'boots-medium', 'belt', 'amulet', 'ring', 'ring'],
  fighter: ['steel-claws', 'cestus', 'helm-medium', 'armour-medium', 'gloves-medium', 'boots-medium', 'belt', 'amulet', 'ring', 'ring'],
  thief: ['kris', 'parrying-dagger', 'helm-medium', 'armour-medium', 'gloves-medium', 'boots-medium', 'belt', 'amulet', 'ring', 'ring'],
};

// A normal fight grows from 7 s at level 1 to 25 s at level 10, then more slowly.
function targetDurationSeconds(level: number): number {
  const levelsInFirstTier = Math.min(level, LEVELS_PER_TIER) - 1;
  const levelsAfterFirstTier = Math.max(0, level - LEVELS_PER_TIER);
  return SHORT_FIGHT_SECONDS_AT_LEVEL_ONE + SECONDS_ADDED_PER_LEVEL_IN_FIRST_TIER * levelsInFirstTier + SECONDS_ADDED_PER_LEVEL_AFTER_FIRST_TIER * levelsAfterFirstTier;
}

// The first base id of each class is its best weapon. Boss fights must still need the other slots.
function equipCraftedGear(hero: Hero, random: Random, gearMode: GearMode): Hero {
  const tier = Math.ceil(hero.level / LEVELS_PER_TIER);
  const baseIds = gearMode === 'best weapon only' ? GEAR_BASE_IDS_BY_CLASS[hero.classId].slice(0, 1) : GEAR_BASE_IDS_BY_CLASS[hero.classId];
  return baseIds.reduce((equippedHero, baseId, index) => {
    const recipe = findRecipe(baseId, tier);
    if (!recipe) throw new Error(`No tier ${tier} recipe for ${baseId}`);
    const item = generateCraftedItem(
      {
        itemId: `sim-item-${hero.id}-${index}`,
        baseId,
        tier,
        setMaterialId: null,
        itemLevel: recipe.itemLevel,
        upgradeLevel: 0,
        craftingCostCopper: 10,
      },
      random.fork(`${hero.id}-${index}`),
    );
    return equipItem(equippedHero, item).hero;
  }, hero);
}

// First spells: the hero keeps the spells that were learned first, as when the player never changes the slots.
// Best spells: the hero equips the highest level spells it can use and its highest ultimate.
function learnSpellsFor(hero: Hero, gearMode: GearMode): Hero {
  const available = spellsOfClass(hero.classId).filter((spell) => spell.unlockLevel <= hero.level);
  const learned = available.reduce(learnSpell, hero);
  if (gearMode === 'gear + first spells') return learned;
  const bestNormal = available.filter((spell) => !spell.isUltimate).slice(-NORMAL_SPELL_SLOT_COUNT);
  const bestUltimate = available.filter((spell) => spell.isUltimate).slice(-1);
  return [...bestNormal, ...bestUltimate].reduce((equipped, spell, index) => equipSpell(equipped, spell, index), learned);
}

function createParty(classIds: readonly ClassId[], level: number, gearMode: GearMode, random: Random): Hero[] {
  return classIds.map((classId, index) => {
    const hero: Hero = { id: `hero-${index}`, name: classId, classId, level, experience: 0, healthFraction: 1, healthAsOfMs: 0, downedUntilMs: null, equipment: {}, learnedSpellIds: [], equippedSpellIds: Array.from({ length: NORMAL_SPELL_SLOT_COUNT }, () => null), equippedUltimateId: null, statistics: { monstersDefeated: 0, damageDealt: 0, damageTaken: 0, healingDone: 0, secondsFought: 0, battlesWon: 0, battlesLost: 0 } };
    if (gearMode === 'no gear') return hero;
    const geared = equipCraftedGear(hero, random.fork('gear'), gearMode);
    return gearMode === 'gear + first spells' || gearMode === 'gear + best spells' ? learnSpellsFor(geared, gearMode) : geared;
  });
}

function measure(partyCase: PartyCase, dungeon: DungeonDefinition, gearMode: GearMode): string {
  let wins = 0;
  let totalSeconds = 0;
  let totalHealthLost = 0;
  const seedRandom = createRandom(2024);

  for (let battle = 0; battle < BATTLES_PER_CASE; battle++) {
    const random = seedRandom.fork(`battle-${battle}`);
    const partyUnits = createParty(partyCase.classIds, dungeon.level, gearMode, random).map(heroToBattleUnit);
    const monsterUnits = createEncounter(dungeon, partyUnits.length, random.fork('monsters'));
    const report = simulateBattle([...partyUnits, ...monsterUnits], random.fork('battle'));
    if (report.winner === 'party') wins += 1;
    totalSeconds += report.durationSeconds;
    const partyAfter = report.finalUnits.filter((unit) => unit.side === 'party');
    const maxTotal = partyAfter.reduce((sum, unit) => sum + unit.maxHp, 0);
    const hpTotal = partyAfter.reduce((sum, unit) => sum + unit.hp, 0);
    totalHealthLost += 1 - hpTotal / maxTotal;
  }

  const winRate = Math.round((wins / BATTLES_PER_CASE) * 100);
  const seconds = (totalSeconds / BATTLES_PER_CASE).toFixed(1);
  const healthLost = Math.round((totalHealthLost / BATTLES_PER_CASE) * 100);
  const targetMultiplier = dungeon.bossMonsterId === null ? 1 : BOSS_DURATION_MULTIPLIER;
  const target = (targetDurationSeconds(dungeon.level) * targetMultiplier).toFixed(1);
  const label = `${partyCase.label} / ${gearMode}`;
  return `${label.padEnd(40)} win ${String(winRate).padStart(3)}%  duration ${seconds.padStart(6)}s (target ${target}s)  hp lost ${String(healthLost).padStart(3)}%`;
}

for (const dungeon of DUNGEONS) {
  console.log(`\n${dungeon.name} (monster level ${dungeon.level}, heroes at level ${dungeon.level}, party size ${dungeon.maxPartySize})`);
  for (const partyCase of dungeon.maxPartySize === 1 ? SOLO_CASES : [...SOLO_CASES, ...DUO_CASES]) {
    for (const gearMode of ['no gear', 'best weapon only', 'crafted gear', 'gear + first spells', 'gear + best spells'] as const) {
      console.log(`  ${measure(partyCase, dungeon, gearMode)}`);
    }
  }
}

printEconomy();
