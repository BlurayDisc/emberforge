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
import { MATERIALS } from '../src/content/materials';
import { addMaterials } from '../src/systems/inventory';
import { healthFractionAt, heroAfterFight, isDowned } from '../src/systems/recovery';
import { computeHeroStats } from '../src/systems/stats';

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
    backpack: addMaterials(state.backpack, MATERIALS.map((material) => ({ materialId: material.id, quantity: 30 }))).entries,
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
    assert.equal(rejectionKey(store, craftItemCommand(baseId, 1, false, clock.nowMs)), null, `craft ${baseId} to level up ${professionId}`);
    finishJobs(store);
  }
  assert.ok((store.getState().crafters[professionId]?.level ?? 1) >= targetLevel, `${professionId} reaches level ${targetLevel}`);
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

  const strengthBefore = computeHeroStats(warrior).strength;
  assert.equal(rejectionKey(store, craftItemCommand('sword', 1, false, clock.nowMs)), 'reject.craftLevelTooLow', 'a sword is locked at level 1');
  levelUpCrafter(store, 'dagger', 'blacksmithing', 3);
  const itemCountBeforeSword = store.getState().backpack.filter((entry) => entry.content.kind === 'item').length;
  assert.equal(rejectionKey(store, craftItemCommand('sword', 1, false, clock.nowMs)), null, 'craft a sword');
  assert.equal(rejectionKey(store, craftItemCommand('dagger', 1, false, clock.nowMs)), 'reject.crafterBusy', 'a crafter makes one item at a time');
  assert.equal(store.getState().backpack.filter((entry) => entry.content.kind === 'item').length, itemCountBeforeSword, 'the item waits for the end of the craft');
  finishJobs(store);
  const sword = store.getState().backpack.flatMap((entry) => (entry.content.kind === 'item' ? [entry.content.item] : [])).find((item) => item.baseId === 'sword');
  assert.ok(sword, 'the crafted sword is in the backpack');
  assert.equal(rejectionKey(store, equipItemCommand(warrior.id, sword.id)), null, 'the warrior equips the sword');
  const equippedWarrior = store.getState().company[0];
  assert.ok(equippedWarrior && computeHeroStats(equippedWarrior).strength > strengthBefore, 'the sword raises strength');

  levelUpCrafter(store, 'quiver', 'fletching', 4);
  assert.equal(rejectionKey(store, craftItemCommand('bow', 1, false, clock.nowMs)), null, 'craft a bow');
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

  assert.equal(rejectionKey(store, craftItemCommand('axe', 1, false, clock.nowMs)), 'reject.craftLevelTooLow', 'a high recipe is locked at crafter level 1');
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
  const woundedHero = heroAfterFight(fighter, 0, clock.nowMs);
  assert.ok(isDowned(woundedHero, clock.nowMs), 'a hero at 0 health is down');
  assert.ok(!isDowned(woundedHero, clock.nowMs + ONE_HOUR_MS), 'a downed hero returns after the wait');
  assert.ok(healthFractionAt(woundedHero, (woundedHero.downedUntilMs ?? 0) + 1000) > 0, 'a revived hero has some health');
  assert.ok(finalState.company[0] && finalState.company[0].statistics.battlesWon + finalState.company[0].statistics.battlesLost > 0, 'the fighter records the battle');
  const crafter = finalState.crafters.blacksmithing;
  assert.ok(crafter && (crafter.level > 1 || crafter.experience > 0), 'crafting gives the crafter experience');
  const encounters = finalState.reports.length;

  const hero = finalState.company[0];
  return JSON.stringify([finalState.copper, encounters, hero?.level, hero?.experience, hero?.statistics]);
}

// A save from an older version must load, not reset. This is a minimal version 6 save.
const oldSave = JSON.stringify({ ...createStore(1).getState(), saveVersion: 6, jobs: undefined, jobsStarted: undefined });
const migrated = parseGameState(oldSave);
assert.ok(migrated && migrated.saveVersion === CURRENT_SAVE_VERSION && Array.isArray(migrated.jobs), 'a version 6 save migrates');
assert.equal(parseGameState(JSON.stringify({ saveVersion: CURRENT_SAVE_VERSION + 1, company: [], backpack: [] })), null, 'a newer save is not guessed');

const firstSummary = playSession(12345);
const secondSummary = playSession(12345);
assert.equal(firstSummary, secondSummary, 'the same seed must give the same session');
console.log('Smoke play OK');
