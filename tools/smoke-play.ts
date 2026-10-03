import assert from 'node:assert/strict';
import {
  cancelSaleCommand,
  craftItemCommand,
  createGameStore,
  equipItemCommand,
  collectDungeonLootCommand,
  collectFinishedJobsCommand,
  collectMillMaterialsCommand,
  produceMillMaterialsCommand,
  collectWaitingCraftCommand,
  completeRunCommand,
  equipSpellCommand,
  learnSpellCommand,
  listSpellOffers,
  planNextEncounter,
  unequipSpellCommand,
  buyBankUnlockCommand,
  buyStorageUpgradeCommand,
  sortBackpackCommand,
  describeStorage,
  hireHeroCommand,
  listTavernOffers,
  runAwayCommand,
  moveBackpackEntryCommand,
  sellBackpackEntryCommand,
  startDungeonRunCommand,
  type GameStore,
} from '../src/game';
import { CURRENT_SAVE_VERSION, parseGameState } from '../src/systems/save';
import { createRandom } from '../src/kernel/random';
import type { Item } from '../src/model/item';
import { generateCraftedItem } from '../src/systems/items';
import { QUALITY_WEIGHTS, SELL_QUALITY_FACTOR } from '../src/content/balance/items';
import { requireById } from '../src/content/lookup';
import { MATERIALS } from '../src/content/materials';
import { findRecipe, listRecipes, rollUpgradeLevel, upgradeReachChance, upgradeStepChance } from '../src/systems/crafting';
import { addMaterials, backpackExpansionCostCopper, backpackRowCount, usedCellCount } from '../src/systems/inventory';
import { healthFractionAt, heroAfterFight, isDowned } from '../src/systems/recovery';
import { computeHeroSheet, heroToBattleUnit } from '../src/systems/stats';
import { BASE_ITEMS } from '../src/content/baseItems';
import { CLASSES } from '../src/content/classes';
import { MILL_PRODUCED_MATERIAL_IDS, MILL_PRODUCTION_INTERVAL_SECONDS, MILL_STORAGE_CAPACITY } from '../src/content/balance/mill';
import type { ClassId } from '../src/model/hero';
import { DUNGEONS } from '../src/content/dungeons';
import { SPELLS, findSpell, spellsOfClass } from '../src/content/spells';
import type { SpellDefinition } from '../src/model/spell';
import { simulateBattle } from '../src/systems/battle';
import { itemDisplayName } from '../src/ui/displayNames';
import { createEncounter } from '../src/systems/dungeons';
import { createHero } from '../src/systems/heroes';
import { learnSpell } from '../src/systems/spells';

function createStore(seed: number): GameStore {
  const memory = { saved: null as string | null };
  const store = createGameStore({ read: () => memory.saved, write: (text) => { memory.saved = text; }, clear: () => { memory.saved = null; } });
  store.startNewGame();
  store.execute((state) => ({ ...state, seed }));
  return store;
}

function rejectionKey(store: GameStore, command: Parameters<GameStore['execute']>[0]): string | null {
  const result = store.execute(command);
  return result.accepted ? null : (result.rejection?.key ?? 'unknown');
}

// Materials do not stack, so the test backpack gets many expansions to hold the starter materials.
const TEST_BACKPACK_EXPANSIONS = 400;

function giveStarterMaterials(store: GameStore): void {
  store.execute((state) => ({
    ...state,
    copper: 100000,
    backpackExpansions: TEST_BACKPACK_EXPANSIONS,
    backpack: addMaterials(state.backpack, MATERIALS.map((material) => ({ materialId: material.id, quantity: 60 })), backpackRowCount(TEST_BACKPACK_EXPANSIONS)).entries,
  }));
}

// A fake clock. Jobs and recovery run by the clock, so the session moves it by hand.
const clock = { nowMs: 1_000_000 };
const ONE_HOUR_MS = 3_600_000;

function finishJobs(store: GameStore): void {
  clock.nowMs += ONE_HOUR_MS;
  store.execute(collectFinishedJobsCommand(clock.nowMs));
}

function levelUpCrafter(store: GameStore, baseId: string, professionId: string, targetLevel: number): void {
  for (let attempt = 0; attempt < 80 && (store.getState().crafters[professionId]?.level ?? 1) < targetLevel; attempt++) {
    assert.equal(rejectionKey(store, craftItemCommand(baseId, 1, null, clock.nowMs)), null, `craft ${baseId} to level up ${professionId}`);
    finishJobs(store);
    // Practice items would fill the backpack and block the next craft.
    store.execute((state) => ({ ...state, backpack: state.backpack.filter((entry) => entry.content.kind === 'material') }));
  }
  assert.ok((store.getState().crafters[professionId]?.level ?? 1) >= targetLevel, `${professionId} reaches level ${targetLevel}`);
}

function generateSwordForMigration(): Item {
  return generateCraftedItem({ itemId: 'old-sword', baseId: 'sword', tier: 1, setMaterialId: null, maximumItemLevel: 1, upgradeLevel: 0, craftingCostCopper: 10 }, createRandom(1));
}

function playSession(seed: number): string {
  clock.nowMs = 1_000_000;
  const store = createStore(seed);

  assert.equal(rejectionKey(store, hireHeroCommand('warrior')), null, 'the first hero is free');
  assert.equal(store.getState().company.length, 1);
  assert.equal(rejectionKey(store, hireHeroCommand('archer')), 'reject.notEnoughMoney', 'the second hero costs money');

  giveStarterMaterials(store);
  assert.equal(rejectionKey(store, hireHeroCommand('archer')), null);
  assert.equal(rejectionKey(store, hireHeroCommand('mage')), null);
  const [warrior, archer, mage] = store.getState().company;
  assert.ok(warrior && archer && mage);

  for (const lockedClassId of ['priest', 'thief', 'barbarian', 'fighter'] as const) {
    assert.equal(rejectionKey(store, hireHeroCommand(lockedClassId)), 'reject.classLocked', `${lockedClassId} is locked at the start`);
  }
  const offersAtStart = listTavernOffers(store.getState());
  assert.deepEqual(offersAtStart.filter((offer) => offer.lockedUntilDungeonId === null).map((offer) => offer.classId), ['warrior', 'archer', 'mage'], 'only warrior, archer and mage are open at the start');
  const stateBeforeUnlock = store.getState();
  store.execute((state) => ({ ...state, clearedDungeonIds: [...state.clearedDungeonIds, 'wolf-trail'] }));
  assert.equal(rejectionKey(store, hireHeroCommand('thief')), 'reject.classLocked', 'clearing Wolf Trail does not open the thief');
  store.execute((state) => ({ ...state, clearedDungeonIds: [...state.clearedDungeonIds, 'goblin-chief-lair'] }));
  assert.notEqual(rejectionKey(store, hireHeroCommand('thief')), 'reject.classLocked', 'clearing the first town opens the thief');
  assert.equal(rejectionKey(store, hireHeroCommand('priest')), 'reject.classLocked', 'the priest stays locked');
  store.execute(() => stateBeforeUnlock);
  for (const baseId of ['greataxe', 'maul', 'knuckles', 'cestus']) assert.ok(findRecipe(baseId, 1), `${baseId} has a tier 1 recipe`);

  const damageBefore = computeHeroSheet(warrior).physicalDamage;
  assert.equal(rejectionKey(store, craftItemCommand('axe', 1, null, clock.nowMs)), 'reject.craftLevelTooLow', 'an axe is locked at level 1');
  const copperBeforeSwordCraft = store.getState().copper;
  const itemCountBeforeSword = store.getState().backpack.filter((entry) => entry.content.kind === 'item').length;
  assert.equal(rejectionKey(store, craftItemCommand('sword', 1, null, clock.nowMs)), null, 'the first weapon recipe of a warrior is open at level 1');
  assert.equal(store.getState().copper, copperBeforeSwordCraft - (findRecipe('sword', 1)?.feeCopper ?? -1), 'the crafter takes the fee');
  assert.equal(rejectionKey(store, craftItemCommand('dagger', 1, null, clock.nowMs)), 'reject.crafterBusy', 'a crafter makes one item at a time');
  assert.equal(store.getState().backpack.filter((entry) => entry.content.kind === 'item').length, itemCountBeforeSword, 'the item waits for the end of the craft');
  finishJobs(store);
  const sword = store.getState().backpack.flatMap((entry) => (entry.content.kind === 'item' ? [entry.content.item] : [])).find((item) => item.baseId === 'sword');
  assert.ok(sword, 'the crafted sword is in the backpack');
  assert.equal(rejectionKey(store, equipItemCommand(warrior.id, sword.id)), null, 'the warrior equips the sword');
  const equippedWarrior = store.getState().company[0];
  assert.ok(equippedWarrior && computeHeroSheet(equippedWarrior).physicalDamage > damageBefore, 'the sword raises physical damage');

  // Spells: a trainer teaches a spell for money. The hero needs the class and the level.
  const copperBeforeSpell = store.getState().copper;
  assert.equal(rejectionKey(store, learnSpellCommand(warrior.id, 'archer.aimed-shot')), 'reject.spellWrongClass', 'a spell belongs to one class');
  assert.equal(rejectionKey(store, learnSpellCommand(warrior.id, 'warrior.heroic-strike')), 'reject.spellLevelTooLow', 'a spell needs its level');
  assert.equal(rejectionKey(store, learnSpellCommand(warrior.id, 'no.such-spell')), 'reject.spellUnknown');
  assert.equal(rejectionKey(store, equipSpellCommand(warrior.id, 'warrior.power-strike', 0)), 'reject.spellNotLearned', 'a spell must be learned before it is equipped');
  assert.equal(rejectionKey(store, learnSpellCommand(warrior.id, 'warrior.power-strike')), 'reject.spellLevelTooLow', 'the first spell needs level 2');
  store.execute((state) => ({ ...state, company: state.company.map((hero) => (hero.id === warrior.id ? { ...hero, level: 2 } : hero)) }));
  assert.equal(rejectionKey(store, learnSpellCommand(warrior.id, 'warrior.power-strike')), null, 'the warrior learns a level 2 spell');
  const spellOffer = listSpellOffers(store.getState(), warrior.id).find((offer) => offer.spell.id === 'warrior.power-strike');
  assert.ok(spellOffer?.isLearned && spellOffer.isEquipped, 'a new spell takes the first free slot');
  assert.equal(store.getState().copper, copperBeforeSpell - (spellOffer?.costCopper ?? -1), 'the trainer takes the fee');
  assert.equal(rejectionKey(store, learnSpellCommand(warrior.id, 'warrior.power-strike')), 'reject.spellAlreadyLearned');
  assert.equal(rejectionKey(store, unequipSpellCommand(warrior.id, 'warrior.power-strike')), null);
  assert.deepEqual(store.getState().company[0]?.equippedSpellIds, [null, null, null], 'an unequipped slot is empty');
  assert.equal(rejectionKey(store, equipSpellCommand(warrior.id, 'warrior.power-strike', 2)), null);
  assert.deepEqual(store.getState().company[0]?.equippedSpellIds, [null, null, 'warrior.power-strike'], 'the player chooses the slot');
  assert.equal(rejectionKey(store, equipSpellCommand(warrior.id, 'warrior.power-strike', 0)), null);
  assert.deepEqual(store.getState().company[0]?.equippedSpellIds, ['warrior.power-strike', null, null], 'an equipped spell moves and never sits in two slots');

  levelUpCrafter(store, 'bow', 'fletching', 4);
  assert.equal(rejectionKey(store, craftItemCommand('bow', 1, null, clock.nowMs)), null, 'craft a bow');
  finishJobs(store);
  const copperBeforeSale = store.getState().copper;
  const itemEntry = store.getState().backpack.find((entry) => entry.content.kind === 'item');
  assert.ok(itemEntry);
  assert.equal(rejectionKey(store, sellBackpackEntryCommand({ column: itemEntry.column, row: itemEntry.row }, clock.nowMs)), null);
  assert.equal(store.getState().copper, copperBeforeSale, 'a sale pays only when it ends');
  assert.equal(store.getState().jobs.length, 1, 'the sale is a timed job');
  for (let extraSale = 0; extraSale < 2; extraSale++) {
    const nextEntry = store.getState().backpack[0];
    assert.ok(nextEntry);
    assert.equal(rejectionKey(store, sellBackpackEntryCommand({ column: nextEntry.column, row: nextEntry.row }, clock.nowMs)), null);
  }
  const lastEntry = store.getState().backpack[0];
  assert.ok(lastEntry);
  assert.equal(rejectionKey(store, sellBackpackEntryCommand({ column: lastEntry.column, row: lastEntry.row }, clock.nowMs)), 'reject.merchantBusy', 'the merchant has few sale slots');
  finishJobs(store);
  assert.ok(store.getState().copper > copperBeforeSale, 'selling pays money');
  assert.equal(store.getState().jobs.length, 0, 'finished jobs leave the list');

  assert.equal(rejectionKey(store, craftItemCommand('armour-heavy', 1, null, clock.nowMs)), 'reject.craftLevelTooLow', 'a high recipe is locked at crafter level 1');
  assert.equal(rejectionKey(store, startDungeonRunCommand('wolf-trail', [archer.id], clock.nowMs)), 'reject.dungeonLocked', 'a dungeon is locked until the one before is cleared');
  assert.equal(rejectionKey(store, startDungeonRunCommand('rat-cellar', [warrior.id], clock.nowMs)), null, 'start the first run');
  assert.equal(rejectionKey(store, startDungeonRunCommand('rat-cellar', [mage.id], clock.nowMs)), 'reject.dungeonBusy', 'one run for each dungeon');
  assert.equal(rejectionKey(store, startDungeonRunCommand('goblin-chief-lair', [mage.id, archer.id, warrior.id], clock.nowMs)), 'reject.dungeonLocked');
  assert.equal(rejectionKey(store, equipItemCommand(warrior.id, sword.id)), 'reject.stopRunBeforeGearChange', 'no gear change in a run');
  assert.equal(rejectionKey(store, unequipSpellCommand(warrior.id, 'warrior.power-strike')), 'reject.stopRunBeforeSpellChange', 'no spell change in a run');
  const plannedFight = planNextEncounter(store.getState(), store.getState().dungeonRuns[0]?.runNumber ?? 0);
  assert.ok(plannedFight.report.events.some((event) => event.spellId === 'warrior.power-strike'), 'the hero casts its equipped spell in the fight');

  const copperBeforeRuns = store.getState().copper;
  assert.equal(rejectionKey(store, completeRunCommand(store.getState().dungeonRuns[0]?.runNumber ?? 0, clock.nowMs)), null, 'complete the run');
  let finalState = store.getState();
  assert.equal(finalState.dungeonRuns.length, 0, 'the run ends after one fight');
  assert.equal(finalState.reports.length, 1, 'a report waits for the player');
  assert.ok(!finalState.reports[0]?.result.won || (finalState.reports[0]?.result.materials.length ?? 0) > 0, 'a won fight drops crafting material');
  if (finalState.reports[0]?.result.won) {
    assert.ok(finalState.clearedDungeonIds.includes('rat-cellar'), 'a win clears the dungeon');
    assert.equal(finalState.copper, copperBeforeRuns, 'a win drops no money');
    assert.equal(rejectionKey(store, startDungeonRunCommand('wolf-trail', [archer.id], clock.nowMs)), 'reject.heroLevelTooLow', 'a hero below the dungeon level cannot enter');
    store.execute((state) => ({ ...state, company: state.company.map((hero) => (hero.id === archer.id ? { ...hero, level: 3 } : hero)) }));
    assert.equal(rejectionKey(store, startDungeonRunCommand('wolf-trail', [archer.id], clock.nowMs)), null, 'the next dungeon opens');
    assert.equal(rejectionKey(store, completeRunCommand(store.getState().dungeonRuns[0]?.runNumber ?? 0, clock.nowMs)), null);
    finalState = store.getState();
  }
  const fighter = finalState.company[0];
  assert.ok(fighter, 'the company has a fighter');
  assert.ok(healthFractionAt(fighter, clock.nowMs + ONE_HOUR_MS) === 1, 'heroes regenerate to full health with time');
  const woundedHeroLevelOne = { ...fighter, level: 1, healthFraction: 0, healthAsOfMs: clock.nowMs, downedUntilMs: null };
  assert.ok(healthFractionAt(woundedHeroLevelOne, clock.nowMs + 60_000) >= 0.99, 'a level 1 hero heals fully in one minute');
  const woundedHeroAtCap = { ...woundedHeroLevelOne, level: 100 };
  assert.ok(healthFractionAt(woundedHeroAtCap, clock.nowMs + 120_000) < 0.6 && healthFractionAt(woundedHeroAtCap, clock.nowMs + 300_000) >= 0.99, 'a level 100 hero needs about five minutes');
  const woundedHero = heroAfterFight(fighter, 0, clock.nowMs);
  assert.ok(isDowned(woundedHero, clock.nowMs), 'a hero at 0 health is down');
  assert.ok(!isDowned(woundedHero, clock.nowMs + ONE_HOUR_MS), 'a downed hero returns after the wait');
  assert.ok(healthFractionAt(woundedHero, (woundedHero.downedUntilMs ?? 0) + 1000) > 0, 'a revived hero has some health');
  assert.ok(finalState.company[0] && finalState.company[0].statistics.battlesWon + finalState.company[0].statistics.battlesLost > 0, 'the fighter records the battle');
  const crafter = finalState.crafters.weaponsmithing;
  assert.ok(crafter && (crafter.level > 1 || crafter.experience > 0), 'crafting gives the crafter experience');
  const encounters = finalState.reports.length;

  // A sale can be cancelled, and the goods come back.
  const goodsEntry = finalState.backpack[0];
  assert.ok(goodsEntry, 'the backpack holds something to sell');
  const entriesBeforeSale = finalState.backpack.length;
  assert.equal(rejectionKey(store, sellBackpackEntryCommand({ column: goodsEntry.column, row: goodsEntry.row }, clock.nowMs)), null);
  const saleJob = store.getState().jobs.find((job) => job.kind === 'sell');
  assert.ok(saleJob, 'the sale is a job');
  assert.equal(rejectionKey(store, cancelSaleCommand(saleJob.id)), null, 'cancel the sale');
  assert.equal(store.getState().jobs.length, 0, 'a cancelled sale leaves no job');
  assert.equal(store.getState().backpack.length, entriesBeforeSale, 'the goods return to the backpack');

  // Running away keeps no loot and no report, and the hero is not healed.
  const reportsBeforeRun = store.getState().reports.length;
  const runner = store.getState().company.find((candidate) => candidate.classId === 'mage');
  assert.ok(runner);
  assert.equal(rejectionKey(store, startDungeonRunCommand('rat-cellar', [runner.id], clock.nowMs)), null);
  const runNumber = store.getState().dungeonRuns[0]?.runNumber ?? 0;
  assert.equal(rejectionKey(store, runAwayCommand(runNumber, 6, clock.nowMs)), null, 'run away');
  assert.equal(store.getState().dungeonRuns.length, 0, 'the run is gone');
  assert.equal(store.getState().reports.length, reportsBeforeRun, 'running away leaves no report');
  const ranAwayHero = store.getState().company.find((candidate) => candidate.id === runner.id);
  assert.ok(ranAwayHero && ranAwayHero.healthAsOfMs === clock.nowMs, 'the health is settled at the moment of the escape');

  const hero = finalState.company[0];
  return JSON.stringify([finalState.copper, encounters, hero?.level, hero?.experience, hero?.statistics]);
}

// Smithing must pay a little: the average sale beats the fee plus what the raw materials would sell for.
for (let tier = 1; tier <= 2; tier++) {
  for (const recipe of listRecipes(tier)) {
    const materialValue = recipe.ingredients.reduce((total, ingredient) => total + requireById(MATERIALS, ingredient.materialId).sellValueCopper * ingredient.quantity, 0);
    const averageQualityFactor = Object.entries(QUALITY_WEIGHTS).reduce((total, [quality, weight]) => total + weight * SELL_QUALITY_FACTOR[quality as keyof typeof SELL_QUALITY_FACTOR], 0) / Object.values(QUALITY_WEIGHTS).reduce((total, weight) => total + weight, 0);
    const averageSale = (materialValue + recipe.feeCopper) * averageQualityFactor;
    assert.ok(averageSale > (materialValue + recipe.feeCopper) * 1.2, `crafting ${recipe.baseId} (tier ${tier}) pays more than it costs`);
  }
}

// A save from an older version must load, not reset. This is a minimal version 6 save.
const oldSave = JSON.stringify({ ...createStore(1).getState(), saveVersion: 6, jobs: undefined, jobsStarted: undefined });
const migrated = parseGameState(oldSave);
assert.ok(migrated && migrated.saveVersion === CURRENT_SAVE_VERSION && Array.isArray(migrated.jobs), 'a version 6 save migrates');
assert.equal(parseGameState(JSON.stringify({ saveVersion: CURRENT_SAVE_VERSION + 1, company: [], backpack: [] })), null, 'a newer save is not guessed');

// A version 7 save has one Blacksmithing crafter and weapons with strength and magic base stats.
const oldSword = { ...generateSwordForMigration(), baseStats: { strength: 7, skill: 1 } };
const versionSevenSave = JSON.stringify({
  ...createStore(1).getState(),
  saveVersion: 7,
  crafters: { blacksmithing: { level: 4, experience: 3 } },
  backpack: [{ column: 0, row: 0, content: { kind: 'item', item: oldSword } }],
});
const migratedSeven = parseGameState(versionSevenSave);
assert.ok(migratedSeven && migratedSeven.saveVersion === CURRENT_SAVE_VERSION, 'a version 7 save migrates');
assert.equal(migratedSeven.crafters.weaponsmithing?.level, 4, 'the Blacksmithing level goes to the Weaponsmithing crafter');
assert.equal(migratedSeven.crafters.armoursmithing?.level, 4, 'the Blacksmithing level goes to the Armoursmithing crafter');
const migratedEntry = migratedSeven.backpack[0]?.content;
assert.ok(migratedEntry?.kind === 'item' && migratedEntry.item.baseStats.physicalDamage === 7 && migratedEntry.item.baseStats.strength === undefined, 'a weapon strength becomes physical damage');

// Materials do not stack: every unit takes its own place, and bulky materials take 2 cells.
const stackedOre = addMaterials([], [{ materialId: 'copper-ore', quantity: 3 }, { materialId: 'pine-wood', quantity: 2 }], backpackRowCount(0));
assert.equal(stackedOre.entries.length, 5, 'every material unit is its own entry');
assert.equal(usedCellCount(stackedOre.entries), 3 * 1 + 2 * 2, 'pine wood fills 2 cells');
const crowded = addMaterials([], [{ materialId: 'pine-wood', quantity: 50 }], backpackRowCount(0));
assert.equal(crowded.entries.length, 12, 'the base backpack holds 12 bulky units (each is 1 by 2)');
assert.equal(crowded.overflow[0]?.quantity, 38, 'units that find no room are returned');

// Casting rules: a spell needs mana, a heal needs a wounded ally and a status does not stack.
{
  const priestBase = createHero('priest', 1, createRandom(5));
  const priest = ['priest.minor-heal', 'priest.divine-shield'].reduce((hero, spellId) => learnSpell(hero, findSpell(spellId) as SpellDefinition), priestBase);
  const ratCellar = requireById(DUNGEONS, 'rat-cellar');
  const monsters = createEncounter(ratCellar, 1, createRandom(8).fork('monsters'));
  const report = simulateBattle([heroToBattleUnit(priest), ...monsters], createRandom(8).fork('battle'));
  const firstHealIndex = report.events.findIndex((event) => event.spellId === 'priest.minor-heal');
  const firstHitOnHeroIndex = report.events.findIndex((event) => event.kind === 'attack' && event.targetId === priest.id);
  assert.ok(firstHealIndex < 0 || firstHealIndex > firstHitOnHeroIndex, 'a heal is cast only after the hero is wounded');
  assert.equal(report.events.filter((event) => event.spellId === 'priest.divine-shield' && event.timeSeconds < 8).length, 1, 'a guard does not stack while it lasts');
  const withoutMana = { ...heroToBattleUnit(priest), resource: 0, maxResource: 0 };
  const dryReport = simulateBattle([withoutMana, ...monsters], createRandom(8).fork('battle'));
  assert.ok(dryReport.events.every((event) => event.spellId === undefined), 'a hero with no resource casts nothing');
  assert.ok(requireById(SPELLS, 'mage.inferno').isUltimate && spellsOfClass('mage').filter((spell) => !spell.isUltimate).length === 16, 'a class has 16 spells and 4 ultimates');
}

// Class resources: mana, stamina and hatred start from their rules, rage starts empty and builds from hits.
{
  const startingFractionByClass = { warrior: 1, archer: 1, mage: 1, priest: 1, thief: 0.5, barbarian: 0, fighter: 0 } as const;
  for (const [classId, startFraction] of Object.entries(startingFractionByClass)) {
    const unit = heroToBattleUnit(createHero(classId as ClassId, 1, createRandom(3)));
    assert.equal(unit.resourceId, requireById(CLASSES, classId).resourceId, `${classId} uses the resource of its class`);
    assert.ok(unit.maxResource > 0, `${classId} has a resource pool`);
    assert.equal(unit.resource, unit.maxResource * startFraction, `${classId} starts with the right share of its resource`);
  }
  const barbarian = heroToBattleUnit(createHero('barbarian', 1, createRandom(3)));
  const rageMonsters = createEncounter(requireById(DUNGEONS, 'rat-cellar'), 1, createRandom(8).fork('monsters'));
  const rageReport = simulateBattle([barbarian, ...rageMonsters], createRandom(8).fork('battle'));
  const firstBarbarianEvent = rageReport.events.find((event) => event.actorId === barbarian.id);
  assert.ok((firstBarbarianEvent?.actorResourceAfter ?? 0) > 0, 'a hit builds rage');
  const firstHitOnBarbarian = rageReport.events.find((event) => event.targetId === barbarian.id && event.kind === 'attack');
  assert.ok((firstHitOnBarbarian?.targetResourceAfter ?? 0) > 0, 'a hit taken builds rage');
  const spender = learnSpell(createHero('barbarian', 1, createRandom(3)), spellsOfClass('barbarian')[0] as SpellDefinition);
  const spendReport = simulateBattle([heroToBattleUnit(spender), ...rageMonsters], createRandom(8).fork('battle'));
  const firstCast = spendReport.events.find((event) => event.spellId !== undefined);
  assert.ok(firstCast === undefined || (firstCast.resourceSpent ?? 0) > 0, 'a cast reports what it cost');
}

// Set recipes: a dungeon material makes an armour piece with a fixed bonus. Basic recipes need only their main material.
{
  const basicRecipe = findRecipe('helm-heavy', 1);
  const fangRecipe = findRecipe('helm-heavy', 1, 'sharp-fang');
  assert.deepEqual(basicRecipe?.ingredients.map((ingredient) => ingredient.materialId), ['copper-ore'], 'a basic recipe needs only its main material');
  assert.deepEqual(fangRecipe?.ingredients.map((ingredient) => ingredient.materialId), ['copper-ore', 'sharp-fang'], 'a set recipe adds the set material');
  assert.ok((fangRecipe?.requiredCraftLevel ?? 0) >= requireById(MATERIALS, 'sharp-fang').setCraftLevelOffset!, 'a set recipe opens after its dungeon');
  const everySetRecipeIsOneLevelHigher = listRecipes(1).filter((recipe) => recipe.setMaterialId !== null).every((recipe) => recipe.requiredCraftLevel >= (findRecipe(recipe.baseId, 1)?.requiredCraftLevel ?? Infinity) + 1);
  assert.ok(everySetRecipeIsOneLevelHigher, 'a set recipe needs a crafter level at least 1 above the basic recipe');
  assert.equal(findRecipe('sword', 1, 'sharp-fang'), undefined, 'only armour pieces have set recipes');
  const makeHelm = (setMaterialId: string | null): Item => generateCraftedItem({ itemId: 'helm', baseId: 'helm-heavy', tier: 1, setMaterialId, maximumItemLevel: 1, upgradeLevel: 0, craftingCostCopper: 1 }, createRandom(4));
  const warrior = createHero('warrior', 1, createRandom(3));
  const skillWith = (helm: Item): number => computeHeroSheet({ ...warrior, equipment: { helm } }).skill;
  assert.equal(makeHelm('sharp-fang').materialId, 'sharp-fang', 'a set piece keeps its set material');
  assert.equal(skillWith(makeHelm('sharp-fang')) - skillWith(makeHelm(null)), requireById(MATERIALS, 'sharp-fang').setBonus!.value, 'a set material gives its fixed bonus');
}

// A version 14 report has no hero level or experience after the fight. The hero's current values stand in for them.
{
  const heroResult = { heroId: 'hero-1', damageDealt: 5, damageTaken: 1, healingDone: 0, monstersDefeated: 1, experienceGained: 7, reachedLevel: null };
  const versionFourteenSave = JSON.stringify({ saveVersion: 14, company: [{ id: 'hero-1', classId: 'warrior', level: 3, experience: 12, equipment: {} }], backpack: [], jobs: [], reports: [{ runNumber: 1, dungeonId: 'rat-cellar', firstClear: false, result: { won: true, heroes: [heroResult] } }] });
  const migratedReport = parseGameState(versionFourteenSave)?.reports[0]?.result.heroes[0];
  assert.ok(migratedReport?.levelAfter === 3 && migratedReport.experienceAfter === 12, 'a version 14 report gets the hero level and experience after the fight');
}

// A version 11 save has heroes with no spell fields. They get empty spell slots.
{
  const versionElevenSave = JSON.stringify({ saveVersion: 11, company: [{ id: 'hero-1', classId: 'warrior', level: 1, equipment: {} }], backpack: [], jobs: [] });
  const migratedEleven = parseGameState(versionElevenSave);
  const migratedHero = migratedEleven?.company[0];
  assert.ok(migratedHero && migratedHero.learnedSpellIds.length === 0 && migratedHero.equippedSpellIds.length === 3 && migratedHero.equippedUltimateId === null, 'a version 11 hero gets empty spell slots');
}

// Upgrade levels: rare, rarer with each step, and likelier when the crafter is far above the recipe level.
{
  assert.ok(upgradeStepChance(1, 30) > upgradeStepChance(1, 0), 'a higher crafter level makes +1 likelier');
  assert.ok(upgradeReachChance(5, 30) < upgradeReachChance(4, 30) && upgradeReachChance(2, 30) < upgradeReachChance(1, 30), 'a higher upgrade level is always rarer to reach');
  assert.ok(upgradeReachChance(1, 0) >= 0.05, 'a +1 has at least a 5% chance at the recipe level');
  assert.ok(upgradeReachChance(4, 9) >= 0.05, 'a crafter 9 levels above the recipe reaches +4 at least 5% of the time');
  const rollCount = 4000;
  const countAtLeast = (levelsAboveRecipe: number, level: number): number => {
    const random = createRandom(11);
    return Array.from({ length: rollCount }, () => rollUpgradeLevel(levelsAboveRecipe, random)).filter((upgradeLevel) => upgradeLevel >= level).length;
  };
  assert.ok(countAtLeast(0, 1) < rollCount * 0.1, 'most crafts at the recipe level have no upgrade');
  assert.ok(countAtLeast(60, 1) > countAtLeast(0, 1), 'a far higher crafter gets more upgrades');
  assert.ok(countAtLeast(60, 3) < countAtLeast(60, 1), '+3 is rarer than +1');
  assert.ok(countAtLeast(100, 8) === 0, 'no upgrade passes +7');
  const upgraded = generateCraftedItem({ itemId: 'up', baseId: 'sword', tier: 1, setMaterialId: null, maximumItemLevel: 1, upgradeLevel: 5, craftingCostCopper: 10 }, createRandom(3));
  const plain = generateCraftedItem({ itemId: 'plain', baseId: 'sword', tier: 1, setMaterialId: null, maximumItemLevel: 1, upgradeLevel: 0, craftingCostCopper: 10 }, createRandom(3));
  assert.ok((upgraded.baseStats.physicalDamage ?? 0) > (plain.baseStats.physicalDamage ?? 0), 'an upgrade level raises base stats');
  assert.equal(upgraded.itemLevel, plain.itemLevel, 'an upgrade level does not change the item level');
}

// The name of an upgraded item always ends with its level, from +1 to +7.
for (let level = 1; level <= 7; level++) {
  const upgradedItem = generateCraftedItem({ itemId: `named-${level}`, baseId: 'sword', tier: 1, setMaterialId: null, maximumItemLevel: 5, upgradeLevel: level, craftingCostCopper: 10 }, createRandom(level + 3));
  assert.ok(itemDisplayName(upgradedItem).endsWith(` +${level}`), `the name of a +${level} item ends with +${level}`);
}

// A version 10 save has items with no upgrade level. They get level 0.
{
  const versionTenSave = JSON.stringify({
    saveVersion: 10,
    company: [],
    backpack: [{ column: 0, row: 0, content: { kind: 'item', item: { ...generateSwordForMigration(), upgradeLevel: undefined } } }],
  });
  const migratedTen = parseGameState(versionTenSave);
  const entry = migratedTen?.backpack[0]?.content;
  assert.ok(entry?.kind === 'item' && entry.item.upgradeLevel === 0, 'a version 10 item gets upgrade level 0');
}

// Each backpack purchase costs more than the last one, and adds one row of cells.
{
  const firstCost = backpackExpansionCostCopper(0) ?? 0;
  assert.ok(firstCost > 0 && (backpackExpansionCostCopper(1) ?? 0) > firstCost * 1.2, 'the price grows by a fixed factor');
  assert.ok((backpackExpansionCostCopper(8) ?? 0) > (backpackExpansionCostCopper(4) ?? 0) * 3, 'the growth is exponential');
  assert.equal(backpackExpansionCostCopper(1000), null, 'the upgrades end');
  assert.equal(backpackRowCount(1) - backpackRowCount(0), 1, 'a purchase adds one row');
}

// Moving an entry inside the backpack.
{
  const store = createStore(8);
  store.execute((state) => ({ ...state, backpack: addMaterials([], [{ materialId: 'copper-ore', quantity: 2 }, { materialId: 'pine-wood', quantity: 1 }], backpackRowCount(0)).entries }));
  const before = store.getState().backpack;
  assert.equal(rejectionKey(store, moveBackpackEntryCommand({ column: 0, row: 0 }, { column: 5, row: 4 })), null, 'move an entry to an empty spot');
  assert.ok(store.getState().backpack.some((entry) => entry.column === 5 && entry.row === 4), 'the entry is at its new place');
  assert.equal(store.getState().backpack.length, before.length, 'a move loses nothing');
  assert.equal(rejectionKey(store, moveBackpackEntryCommand({ column: 5, row: 4 }, { column: 1, row: 0 })), 'reject.cannotPlaceThere', 'a taken spot is refused');
  const bulky = store.getState().backpack.find((entry) => entry.content.kind === 'material' && entry.content.materialId === 'pine-wood');
  assert.ok(bulky);
  assert.equal(rejectionKey(store, moveBackpackEntryCommand({ column: bulky.column, row: bulky.row }, { column: 0, row: backpackRowCount(0) - 1 })), 'reject.cannotPlaceThere', 'a 1 by 2 entry cannot hang over the last row');
  assert.equal(rejectionKey(store, moveBackpackEntryCommand({ column: 4, row: 4 }, { column: 3, row: 3 })), 'reject.cannotPlaceThere', 'an empty spot has nothing to move');
}

// Bank features stay hidden until bought. Sorting packs the backpack and loses nothing.
{
  const store = createStore(11);
  store.execute((state) => ({ ...state, copper: 0 }));
  assert.equal(rejectionKey(store, sortBackpackCommand()), 'reject.featureLocked', 'sorting needs the Bank upgrade');
  assert.equal(rejectionKey(store, buyBankUnlockCommand('backpackSorting')), 'reject.notEnoughMoney', 'the upgrade costs money');
  store.execute((state) => ({ ...state, copper: 10_000 }));
  assert.equal(rejectionKey(store, buyBankUnlockCommand('backpackSorting')), null, 'the upgrade can be bought');
  assert.equal(rejectionKey(store, buyBankUnlockCommand('backpackSorting')), 'reject.alreadyUnlocked', 'the upgrade is bought once');
  const entriesBefore = store.getState().backpack;
  assert.equal(rejectionKey(store, sortBackpackCommand()), null, 'a bought sort works');
  const sortedOnce = store.getState().backpack;
  assert.equal(sortedOnce.length, entriesBefore.length, 'sorting loses no entry');
  assert.equal(usedCellCount(sortedOnce), usedCellCount(entriesBefore), 'sorting keeps every cell');
  store.execute(sortBackpackCommand());
  assert.deepEqual(store.getState().backpack, sortedOnce, 'sorting twice gives the same backpack');
  const migratedBank = parseGameState(JSON.stringify({ saveVersion: 16, company: [], backpack: [] }));
  assert.deepEqual(migratedBank?.bankUnlockIds, [], 'a version 16 save owns no Bank feature');
}

// A version 12 save has positions made for a wider grid. The migration packs them again and loses nothing.
{
  const wideSave = JSON.stringify({
    saveVersion: 12,
    company: [],
    backpack: [
      { column: 9, row: 7, content: { kind: 'material', materialId: 'copper-ore', quantity: 1 } },
      { column: 8, row: 0, content: { kind: 'material', materialId: 'pine-wood', quantity: 1 } },
    ],
  });
  const migratedWide = parseGameState(wideSave);
  assert.ok(migratedWide && migratedWide.saveVersion === CURRENT_SAVE_VERSION, 'a version 12 save migrates');
  assert.equal(migratedWide.backpack.length, 2, 'no entry is lost');
  assert.ok(migratedWide.backpack.every((entry) => entry.column < 6), 'every entry fits the narrow grid');
}

// A finished craft with no room in the backpack waits at the crafter. It blocks that crafter until the player collects it.
{
  const store = createStore(9);
  const recipe = findRecipe('sword', 1);
  assert.ok(recipe);
  const fillWithQuartz = (): void => {
    store.execute((state) => ({ ...state, backpack: addMaterials(state.backpack, [{ materialId: 'quartz', quantity: 100 }], backpackRowCount(0)).entries }));
  };
  store.execute((state) => ({ ...state, copper: 10_000, backpack: addMaterials([], recipe.ingredients, backpackRowCount(0)).entries }));
  assert.equal(rejectionKey(store, craftItemCommand('sword', 1, null, clock.nowMs)), null);
  fillWithQuartz();
  clock.nowMs += ONE_HOUR_MS;
  assert.equal(rejectionKey(store, collectFinishedJobsCommand(clock.nowMs)), null, 'the clock tries to hand the item over');
  const waitingJob = store.getState().jobs[0];
  assert.ok(waitingJob?.kind === 'craft' && waitingJob.isWaitingForCollection, 'the item waits at the crafter');
  assert.equal(rejectionKey(store, collectFinishedJobsCommand(clock.nowMs)), 'reject.nothingDue', 'the clock does not try again for a waiting item');
  assert.equal(rejectionKey(store, craftItemCommand('sword', 1, null, clock.nowMs)), 'reject.crafterBusy', 'a waiting item blocks the crafter');
  assert.equal(rejectionKey(store, collectWaitingCraftCommand(waitingJob.professionId)), 'reject.backpackFullForItem', 'collecting needs room');
  // The item may be tall, so the freed cells must make whole rows.
  store.execute((state) => ({ ...state, backpack: state.backpack.slice(0, -20) }));
  assert.equal(rejectionKey(store, collectWaitingCraftCommand(waitingJob.professionId)), null, 'the player collects the item after making room');
  assert.equal(store.getState().jobs.length, 0, 'the crafter is free again');
  assert.ok(store.getState().backpack.some((entry) => entry.content.kind === 'item'), 'the item is in the backpack');
  assert.equal(rejectionKey(store, collectWaitingCraftCommand(waitingJob.professionId)), 'reject.nothingToCollect');
}

// Drops with no room wait at the dungeon. They block that dungeon until the player collects them.
{
  const store = createStore(10);
  store.execute((state) => ({ ...state, backpack: addMaterials([], [{ materialId: 'quartz', quantity: 100 }], backpackRowCount(0)).entries, pendingLoot: { 'rat-cellar': [{ materialId: 'copper-ore', quantity: 3 }] } }));
  assert.equal(rejectionKey(store, startDungeonRunCommand('rat-cellar', ['nobody'], clock.nowMs)), 'reject.dungeonHasPendingLoot', 'a dungeon with waiting loot stays closed');
  assert.equal(rejectionKey(store, collectDungeonLootCommand('rat-cellar')), 'reject.backpackFullForLoot', 'collecting needs room');
  store.execute((state) => ({ ...state, backpack: state.backpack.slice(0, -2) }));
  assert.equal(rejectionKey(store, collectDungeonLootCommand('rat-cellar')), null, 'a partial collect works');
  assert.equal(store.getState().pendingLoot['rat-cellar']?.[0]?.quantity, 1, 'what did not fit keeps waiting');
  store.execute((state) => ({ ...state, backpack: state.backpack.slice(0, -2) }));
  assert.equal(rejectionKey(store, collectDungeonLootCommand('rat-cellar')), null);
  assert.equal(store.getState().pendingLoot['rat-cellar'], undefined, 'the dungeon opens when all loot is collected');
  assert.equal(rejectionKey(store, collectDungeonLootCommand('rat-cellar')), 'reject.nothingToCollect');
}

// A version 13 save has no waiting crafts and no waiting loot. Its reports lose the old lost-drops list.
{
  const migratedThirteen = parseGameState(JSON.stringify({
    saveVersion: 13,
    company: [],
    backpack: [],
    jobs: [{ id: 1, kind: 'craft', professionId: 'weaponsmithing', startedAtMs: 0, finishesAtMs: 1, crafterExperience: 1, item: {} }],
    reports: [{ runNumber: 1, result: { won: true, materials: [], materialsLost: [{ materialId: 'copper-ore', quantity: 2 }] } }],
  }));
  assert.ok(migratedThirteen && migratedThirteen.saveVersion === CURRENT_SAVE_VERSION, 'a version 13 save migrates');
  assert.deepEqual(migratedThirteen.pendingLoot, {}, 'no loot waits');
  const migratedJob = migratedThirteen.jobs[0];
  assert.ok(migratedJob?.kind === 'craft' && !migratedJob.isWaitingForCollection, 'an old craft is not marked as waiting');
  assert.ok(!('materialsLost' in (migratedThirteen.reports[0]?.result ?? {})), 'the old lost-drops list is gone');
}

// A version 15 save may hold a Morning Star. It becomes a Flanged Mace in the same place.
{
  const migratedMorningStar = parseGameState(JSON.stringify({
    saveVersion: 15,
    company: [],
    backpack: [{ column: 0, row: 0, content: { kind: 'item', item: { ...generateSwordForMigration(), baseId: 'morning-star' } } }],
  }));
  const keptContent = migratedMorningStar?.backpack[0]?.content;
  assert.ok(keptContent?.kind === 'item' && keptContent.item.baseId === 'flanged-mace', 'a Morning Star becomes a Flanged Mace');
}

// A warrior has its own weapons. The priest keeps the maces.
{
  const warriorWeapons = BASE_ITEMS.filter((base) => base.slot === 'mainHand' && requireById(CLASSES, 'warrior').weaponTypes.includes(base.gearType)).map((base) => base.id);
  assert.deepEqual(warriorWeapons.sort(), ['axe', 'battle-axe', 'broadsword', 'longsword', 'sword'], 'the warrior has five own weapons');
  assert.ok(!requireById(CLASSES, 'warrior').weaponTypes.includes('mace'), 'the warrior does not share maces with the priest');
}

// The Bank sells backpack rows and merchant sale slots.
{
  const store = createStore(7);
  assert.equal(rejectionKey(store, buyStorageUpgradeCommand('backpack')), 'reject.notEnoughMoney', 'a storage upgrade costs money');
  store.execute((state) => ({ ...state, copper: 1_000_000 }));
  assert.equal(rejectionKey(store, buyStorageUpgradeCommand('backpack')), null);
  assert.equal(store.getState().backpackExpansions, 1);
  assert.equal(rejectionKey(store, buyStorageUpgradeCommand('merchantSlot')), null);
  assert.equal(describeStorage(store.getState()).merchantSaleSlots, 4, 'the Bank adds a merchant sale slot');
  for (let bought = 0; bought < 100; bought++) store.execute(buyStorageUpgradeCommand('backpack'));
  assert.equal(rejectionKey(store, buyStorageUpgradeCommand('backpack')), 'reject.upgradeSoldOut', 'the upgrades end');
}

// The Mill makes one basic material every 10 minutes by the clock. A full Mill stops. A collect starts it again.
{
  const store = createStore(11);
  const intervalMs = MILL_PRODUCTION_INTERVAL_SECONDS * 1000;
  const startMs = clock.nowMs;
  assert.equal(rejectionKey(store, produceMillMaterialsCommand(startMs)), null, 'the first clock check starts the Mill');
  assert.equal(rejectionKey(store, produceMillMaterialsCommand(startMs + intervalMs - 1)), 'reject.nothingDue', 'nothing is made before the interval ends');
  assert.equal(rejectionKey(store, produceMillMaterialsCommand(startMs + 2 * intervalMs)), null, 'the Mill makes a material for each interval, also while the page was closed');
  assert.equal(store.getState().mill.storedMaterials.reduce((total, stack) => total + stack.quantity, 0), 2);
  assert.ok(store.getState().mill.storedMaterials.every((stack) => MILL_PRODUCED_MATERIAL_IDS.includes(stack.materialId)), 'the Mill makes only basic materials');
  assert.equal(rejectionKey(store, produceMillMaterialsCommand(startMs + 100 * intervalMs)), null);
  assert.equal(store.getState().mill.storedMaterials.reduce((total, stack) => total + stack.quantity, 0), MILL_STORAGE_CAPACITY, 'the Mill stops at its capacity');
  assert.equal(store.getState().mill.productionClockStartedAtMs, null, 'a full Mill stops its clock');
  assert.equal(rejectionKey(store, produceMillMaterialsCommand(startMs + 200 * intervalMs)), 'reject.nothingDue', 'a full Mill makes nothing');
  store.execute((state) => ({ ...state, backpack: addMaterials([], [{ materialId: 'quartz', quantity: 100 }], backpackRowCount(0)).entries }));
  assert.equal(rejectionKey(store, collectMillMaterialsCommand()), 'reject.backpackFullForLoot', 'collecting needs room');
  store.execute((state) => ({ ...state, backpack: [] }));
  assert.equal(rejectionKey(store, collectMillMaterialsCommand()), null);
  assert.equal(store.getState().mill.storedMaterials.length, 0, 'the Mill is empty after a collect');
  assert.equal(store.getState().backpack.length, MILL_STORAGE_CAPACITY, 'the materials are in the backpack');
  assert.equal(rejectionKey(store, collectMillMaterialsCommand()), 'reject.nothingToCollect');
  assert.equal(rejectionKey(store, produceMillMaterialsCommand(startMs + 300 * intervalMs)), null, 'the Mill starts again after a collect');
  assert.equal(rejectionKey(store, produceMillMaterialsCommand(startMs + 301 * intervalMs)), null);
  const migratedMill = parseGameState(JSON.stringify({ saveVersion: 17, company: [], backpack: [] }));
  assert.deepEqual(migratedMill?.mill.storedMaterials, [], 'a version 17 save gets an empty Mill');
}

// A version 8 save has stacked materials. The migration splits them and keeps every unit.
const versionEightSave = JSON.stringify({
  saveVersion: 8,
  company: [],
  backpack: [
    { column: 0, row: 0, content: { kind: 'material', materialId: 'pine-wood', quantity: 99 } },
    { column: 1, row: 0, content: { kind: 'material', materialId: 'copper-ore', quantity: 40 } },
  ],
});
const migratedEight = parseGameState(versionEightSave);
assert.ok(migratedEight && migratedEight.saveVersion === CURRENT_SAVE_VERSION, 'a version 8 save migrates');
assert.equal(migratedEight.backpack.length, 139, 'no material unit is lost');
assert.ok(migratedEight.backpackExpansions > 0, 'the backpack grows to hold the old stacks');
assert.equal(usedCellCount(migratedEight.backpack), 99 * 2 + 40, 'the cells add up');

// A version 9 report holds money from drops. The migration removes it.
const versionNineSave = JSON.stringify({ saveVersion: 9, company: [], backpack: [], reports: [{ runNumber: 1, result: { won: true, copperGained: 40, materials: [] } }] });
const migratedNine = parseGameState(versionNineSave);
assert.ok(migratedNine && migratedNine.saveVersion === CURRENT_SAVE_VERSION, 'a version 9 save migrates');
assert.ok(!('copperGained' in (migratedNine.reports[0]?.result ?? {})), 'the migration removes money from old reports');

const firstSummary = playSession(12345);
const secondSummary = playSession(12345);
assert.equal(firstSummary, secondSummary, 'the same seed must give the same session');
console.log('Smoke play OK');
