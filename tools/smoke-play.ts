import assert from 'node:assert/strict';
import {
  craftItemCommand,
  createGameStore,
  equipItemCommand,
  finishEncounterCommand,
  hireHeroCommand,
  sellBackpackEntryCommand,
  startDungeonRunCommand,
  type GameStore,
} from '../src/game';
import { MATERIALS } from '../src/content/materials';
import { addMaterials } from '../src/systems/inventory';
import { computeHeroStats } from '../src/systems/stats';

const MAXIMUM_ENCOUNTERS_PER_SESSION = 400;

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
  assert.equal(rejectionKey(store, craftItemCommand('sword', 1, false)), null, 'craft a sword');
  const sword = store.getState().backpack.flatMap((entry) => (entry.content.kind === 'item' ? [entry.content.item] : []))[0];
  assert.ok(sword, 'the crafted sword is in the backpack');
  assert.equal(rejectionKey(store, equipItemCommand(warrior.id, sword.id)), null, 'the warrior equips the sword');
  const equippedWarrior = store.getState().company[0];
  assert.ok(equippedWarrior && computeHeroStats(equippedWarrior).strength > strengthBefore, 'the sword raises strength');

  assert.equal(rejectionKey(store, craftItemCommand('bow', 1, false)), null, 'craft a bow');
  const copperBeforeSale = store.getState().copper;
  const itemEntry = store.getState().backpack.find((entry) => entry.content.kind === 'item');
  assert.ok(itemEntry);
  assert.equal(rejectionKey(store, sellBackpackEntryCommand({ column: itemEntry.column, row: itemEntry.row })), null);
  assert.ok(store.getState().copper > copperBeforeSale, 'selling pays money');

  assert.equal(rejectionKey(store, startDungeonRunCommand('rat-cellar', [warrior.id])), null, 'start the first run');
  assert.equal(rejectionKey(store, startDungeonRunCommand('wolf-trail', [archer.id])), null, 'start a second run at the same time');
  assert.equal(store.getState().dungeonRuns.length, 2, 'two runs are active');
  assert.equal(rejectionKey(store, startDungeonRunCommand('rat-cellar', [mage.id])), 'reject.dungeonBusy', 'one run for each dungeon');
  assert.equal(rejectionKey(store, startDungeonRunCommand('goblin-camp', [warrior.id])), 'reject.heroBusy', 'one run for each hero');
  assert.equal(rejectionKey(store, startDungeonRunCommand('goblin-chief-lair', [mage.id, archer.id, warrior.id])), 'reject.tooManyHeroes');
  assert.equal(rejectionKey(store, equipItemCommand(warrior.id, sword.id)), 'reject.stopRunBeforeGearChange', 'no gear change in a run');

  let encounters = 0;
  while (store.getState().dungeonRuns.length > 0 && encounters < MAXIMUM_ENCOUNTERS_PER_SESSION) {
    for (const run of store.getState().dungeonRuns) {
      assert.equal(rejectionKey(store, finishEncounterCommand(run.runNumber)), null);
      encounters += 1;
    }
  }
  const finalState = store.getState();
  assert.equal(finalState.dungeonRuns.length, 0, 'every run ends');
  assert.ok(finalState.lastEndedRun, 'the last ended run is kept for the summary');
  assert.ok(finalState.company.every((hero) => hero.healthFraction === 1), 'heroes heal when their run ends');
  const fighters = finalState.company.filter((hero) => hero.id !== mage.id);
  assert.ok(fighters.every((hero) => hero.statistics.battlesWon + hero.statistics.battlesLost > 0), 'fighters record battles');
  assert.ok(fighters.some((hero) => hero.statistics.damageDealt > 0), 'fighters record damage');

  const hero = finalState.company[0];
  return JSON.stringify([finalState.copper, encounters, hero?.level, hero?.experience, hero?.statistics]);
}

const firstSummary = playSession(12345);
const secondSummary = playSession(12345);
assert.equal(firstSummary, secondSummary, 'the same seed must give the same session');
console.log('Smoke play OK');
