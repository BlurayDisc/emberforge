import assert from 'node:assert/strict';
import {
  craftItemCommand,
  createGameStore,
  equipItemCommand,
  completeRunCommand,
  hireHeroCommand,
  sellBackpackEntryCommand,
  startDungeonRunCommand,
  type GameStore,
} from '../src/game';
import { MATERIALS } from '../src/content/materials';
import { addMaterials } from '../src/systems/inventory';
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

function levelUpCrafter(store: GameStore, baseId: string, professionId: string, targetLevel: number): void {
  for (let attempt = 0; attempt < 80 && (store.getState().crafters[professionId]?.level ?? 1) < targetLevel; attempt++) {
    assert.equal(rejectionKey(store, craftItemCommand(baseId, 1, false)), null, `craft ${baseId} to level up ${professionId}`);
  }
  assert.ok((store.getState().crafters[professionId]?.level ?? 1) >= targetLevel, `${professionId} reaches level ${targetLevel}`);
}

function playSession(seed: number): string {
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
  assert.equal(rejectionKey(store, craftItemCommand('sword', 1, false)), 'reject.craftLevelTooLow', 'a sword is locked at level 1');
  levelUpCrafter(store, 'dagger', 'blacksmithing', 3);
  assert.equal(rejectionKey(store, craftItemCommand('sword', 1, false)), null, 'craft a sword');
  const sword = store.getState().backpack.flatMap((entry) => (entry.content.kind === 'item' ? [entry.content.item] : [])).find((item) => item.baseId === 'sword');
  assert.ok(sword, 'the crafted sword is in the backpack');
  assert.equal(rejectionKey(store, equipItemCommand(warrior.id, sword.id)), null, 'the warrior equips the sword');
  const equippedWarrior = store.getState().company[0];
  assert.ok(equippedWarrior && computeHeroStats(equippedWarrior).strength > strengthBefore, 'the sword raises strength');

  levelUpCrafter(store, 'quiver', 'fletching', 4);
  assert.equal(rejectionKey(store, craftItemCommand('bow', 1, false)), null, 'craft a bow');
  const copperBeforeSale = store.getState().copper;
  const itemEntry = store.getState().backpack.find((entry) => entry.content.kind === 'item');
  assert.ok(itemEntry);
  assert.equal(rejectionKey(store, sellBackpackEntryCommand({ column: itemEntry.column, row: itemEntry.row })), null);
  assert.ok(store.getState().copper > copperBeforeSale, 'selling pays money');

  assert.equal(rejectionKey(store, craftItemCommand('axe', 1, false)), 'reject.craftLevelTooLow', 'a high recipe is locked at crafter level 1');
  assert.equal(rejectionKey(store, startDungeonRunCommand('wolf-trail', [archer.id])), 'reject.dungeonLocked', 'a dungeon is locked until the one before is cleared');
  assert.equal(rejectionKey(store, startDungeonRunCommand('rat-cellar', [warrior.id])), null, 'start the first run');
  assert.equal(rejectionKey(store, startDungeonRunCommand('rat-cellar', [mage.id])), 'reject.dungeonBusy', 'one run for each dungeon');
  assert.equal(rejectionKey(store, startDungeonRunCommand('goblin-chief-lair', [mage.id, archer.id, warrior.id])), 'reject.dungeonLocked');
  assert.equal(rejectionKey(store, equipItemCommand(warrior.id, sword.id)), 'reject.stopRunBeforeGearChange', 'no gear change in a run');

  const copperBeforeRuns = store.getState().copper;
  assert.equal(rejectionKey(store, completeRunCommand(store.getState().dungeonRuns[0]?.runNumber ?? 0)), null, 'complete the run');
  let finalState = store.getState();
  assert.equal(finalState.dungeonRuns.length, 0, 'the run ends after one fight');
  assert.equal(finalState.reports.length, 1, 'a report waits for the player');
  assert.ok(!finalState.reports[0]?.result.won || (finalState.reports[0]?.result.materials.length ?? 0) > 0, 'a won fight drops crafting material');
  if (finalState.reports[0]?.result.won) {
    assert.ok(finalState.clearedDungeonIds.includes('rat-cellar'), 'a win clears the dungeon');
    assert.ok(finalState.copper > copperBeforeRuns, 'a win pays money');
    assert.equal(rejectionKey(store, startDungeonRunCommand('wolf-trail', [archer.id])), null, 'the next dungeon opens');
    assert.equal(rejectionKey(store, completeRunCommand(store.getState().dungeonRuns[0]?.runNumber ?? 0)), null);
    finalState = store.getState();
  }
  assert.ok(finalState.company.every((hero) => hero.healthFraction === 1), 'heroes rest after a run');
  assert.ok(finalState.company[0] && finalState.company[0].statistics.battlesWon + finalState.company[0].statistics.battlesLost > 0, 'the fighter records the battle');
  const crafter = finalState.crafters.blacksmithing;
  assert.ok(crafter && (crafter.level > 1 || crafter.experience > 0), 'crafting gives the crafter experience');
  const encounters = finalState.reports.length;

  const hero = finalState.company[0];
  return JSON.stringify([finalState.copper, encounters, hero?.level, hero?.experience, hero?.statistics]);
}

const firstSummary = playSession(12345);
const secondSummary = playSession(12345);
assert.equal(firstSummary, secondSummary, 'the same seed must give the same session');
console.log('Smoke play OK');
