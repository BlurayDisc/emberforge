import assert from 'node:assert/strict';
import {
  craftItemCommand,
  createGameStore,
  equipItemCommand,
  collectFinishedJobsCommand,
  completeRunCommand,
  hireHeroCommand,
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
import { findRecipe, listRecipes } from '../src/systems/crafting';
import { addMaterials } from '../src/systems/inventory';
import { healthFractionAt, heroAfterFight, isDowned } from '../src/systems/recovery';
import { computeHeroSheet } from '../src/systems/stats';

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

function giveStarterMaterials(store: GameStore): void {
  store.execute((state) => ({
    ...state,
    copper: 100000,
    backpack: addMaterials(state.backpack, MATERIALS.map((material) => ({ materialId: material.id, quantity: 200 }))).entries,
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
    assert.equal(rejectionKey(store, craftItemCommand(baseId, 1, clock.nowMs)), null, `craft ${baseId} to level up ${professionId}`);
    finishJobs(store);
    // Practice items would fill the backpack and block the next craft.
    store.execute((state) => ({ ...state, backpack: state.backpack.filter((entry) => entry.content.kind === 'material') }));
  }
  assert.ok((store.getState().crafters[professionId]?.level ?? 1) >= targetLevel, `${professionId} reaches level ${targetLevel}`);
}

function generateSwordForMigration(): Item {
  return generateCraftedItem({ itemId: 'old-sword', baseId: 'sword', tier: 1, maximumItemLevel: 1, craftingCostCopper: 10 }, createRandom(1));
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

  const damageBefore = computeHeroSheet(warrior).physicalDamage;
  assert.equal(rejectionKey(store, craftItemCommand('axe', 1, clock.nowMs)), 'reject.craftLevelTooLow', 'an axe is locked at level 1');
  const copperBeforeSwordCraft = store.getState().copper;
  const itemCountBeforeSword = store.getState().backpack.filter((entry) => entry.content.kind === 'item').length;
  assert.equal(rejectionKey(store, craftItemCommand('sword', 1, clock.nowMs)), null, 'the first weapon recipe of a warrior is open at level 1');
  assert.equal(store.getState().copper, copperBeforeSwordCraft - (findRecipe('sword', 1)?.feeCopper ?? -1), 'the crafter takes the fee');
  assert.equal(rejectionKey(store, craftItemCommand('dagger', 1, clock.nowMs)), 'reject.crafterBusy', 'a crafter makes one item at a time');
  assert.equal(store.getState().backpack.filter((entry) => entry.content.kind === 'item').length, itemCountBeforeSword, 'the item waits for the end of the craft');
  finishJobs(store);
  const sword = store.getState().backpack.flatMap((entry) => (entry.content.kind === 'item' ? [entry.content.item] : [])).find((item) => item.baseId === 'sword');
  assert.ok(sword, 'the crafted sword is in the backpack');
  assert.equal(rejectionKey(store, equipItemCommand(warrior.id, sword.id)), null, 'the warrior equips the sword');
  const equippedWarrior = store.getState().company[0];
  assert.ok(equippedWarrior && computeHeroSheet(equippedWarrior).physicalDamage > damageBefore, 'the sword raises physical damage');

  levelUpCrafter(store, 'bow', 'fletching', 4);
  assert.equal(rejectionKey(store, craftItemCommand('bow', 1, clock.nowMs)), null, 'craft a bow');
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

  assert.equal(rejectionKey(store, craftItemCommand('armour-heavy', 1, clock.nowMs)), 'reject.craftLevelTooLow', 'a high recipe is locked at crafter level 1');
  assert.equal(rejectionKey(store, startDungeonRunCommand('wolf-trail', [archer.id], clock.nowMs)), 'reject.dungeonLocked', 'a dungeon is locked until the one before is cleared');
  assert.equal(rejectionKey(store, startDungeonRunCommand('rat-cellar', [warrior.id], clock.nowMs)), null, 'start the first run');
  assert.equal(rejectionKey(store, startDungeonRunCommand('rat-cellar', [mage.id], clock.nowMs)), 'reject.dungeonBusy', 'one run for each dungeon');
  assert.equal(rejectionKey(store, startDungeonRunCommand('goblin-chief-lair', [mage.id, archer.id, warrior.id], clock.nowMs)), 'reject.dungeonLocked');
  assert.equal(rejectionKey(store, equipItemCommand(warrior.id, sword.id)), 'reject.stopRunBeforeGearChange', 'no gear change in a run');

  const copperBeforeRuns = store.getState().copper;
  assert.equal(rejectionKey(store, completeRunCommand(store.getState().dungeonRuns[0]?.runNumber ?? 0, clock.nowMs)), null, 'complete the run');
  let finalState = store.getState();
  assert.equal(finalState.dungeonRuns.length, 0, 'the run ends after one fight');
  assert.equal(finalState.reports.length, 1, 'a report waits for the player');
  assert.ok(!finalState.reports[0]?.result.won || (finalState.reports[0]?.result.materials.length ?? 0) > 0, 'a won fight drops crafting material');
  if (finalState.reports[0]?.result.won) {
    assert.ok(finalState.clearedDungeonIds.includes('rat-cellar'), 'a win clears the dungeon');
    assert.ok(finalState.copper > copperBeforeRuns, 'a win pays money');
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

const firstSummary = playSession(12345);
const secondSummary = playSession(12345);
assert.equal(firstSummary, secondSummary, 'the same seed must give the same session');
console.log('Smoke play OK');
