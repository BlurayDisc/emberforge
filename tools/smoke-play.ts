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
  describeSpellEvent,
  equipSpellCommand,
  learnSpellCommand,
  listSpellOffers,
  planNextEncounter,
  unequipSpellCommand,
  buyBankUnlockCommand,
  buyStorageUpgradeCommand,
  describeMill,
  millSettingsOf,
  sortBackpackCommand,
  describeStorage,
  dungeonActivityOf,
  isBackpackFull,
  workshopActivityOf,
  hireHeroCommand,
  listTavernOffers,
  repeatDungeonRunCommand,
  runAwayCommand,
  findBackpackMoveAnchor,
  moveBackpackEntryCommand,
  sellBackpackEntryCommand,
  describeHero,
  startDungeonRunCommand,
  type GameStore,
} from '../src/game';
import { CURRENT_SAVE_VERSION, loadGameState, parseGameState } from '../src/systems/save';
import { levelUpGains } from '../src/systems/stats';
import { createNewGameState } from '../src/game/newGame';
import { LEVEL_CAP } from '../src/content/balance/progression';
import { monsterStatsAtLevel } from '../src/content/balance/monsterScaling';
import { applyExperience } from '../src/systems/progression';
import type { GameState } from '../src/model/gameState';
import { createRandom } from '../src/kernel/random';
import type { Item } from '../src/model/item';
import { generateCraftedItem } from '../src/systems/items';
import { rollMonsterLoot } from '../src/systems/loot';
import { QUALITY_WEIGHTS, SELL_ADDED_VALUE_COPPER_PER_INGREDIENT, SELL_QUALITY_FACTOR } from '../src/content/balance/items';
import { requireById } from '../src/content/lookup';
import { MATERIALS } from '../src/content/materials';
import { MONSTERS } from '../src/content/monsters';
import { applyCraftingExperience, craftingExperienceForCraft, findRecipe, listRecipes, rollUpgradeLevel, upgradeReachChance, upgradeStepChance } from '../src/systems/crafting';
import { addMaterials, backpackExpansionCostCopper, backpackRowCount, findItem, usedCellCount } from '../src/systems/inventory';
import { healthFractionAt, heroAfterFight, isDowned } from '../src/systems/recovery';
import { computeHeroSheet, heroToBattleUnit } from '../src/systems/stats';
import { AFFIXES } from '../src/content/affixes';
import { BASE_ITEMS } from '../src/content/baseItems';
import { CLASSES } from '../src/content/classes';
import { MILL_BASE_STORAGE_CAPACITY, MILL_PRODUCED_MATERIAL_IDS, MILL_PRODUCTION_INTERVAL_SECONDS_BY_SPEED_UPGRADE, MILL_STORAGE_CAPACITY_UPGRADE_COSTS_COPPER } from '../src/content/balance/mill';
import type { ClassId, Hero } from '../src/model/hero';
import type { EquipmentSlot } from '../src/model/item';
import { DUNGEONS } from '../src/content/dungeons';
import { MONSTER_SPELLS } from '../src/content/monsterSpells';
import { SPELLS, findSpell, spellsOfClass } from '../src/content/spells';
import type { BattleSpell, SpellDefinition } from '../src/model/spell';
import { simulateRealtimeBattle } from '../src/systems/battle';
import { checkBootsMovementSpeed, checkManaRegenFromIntelligence, checkMonsterAttackTimes, checkRealtimeBattleWiring } from './smoke-realtime-steps';
import type { BattleEvent, BattleUnit } from '../src/model/battle';
import { itemDisplayName } from '../src/ui/displayNames';
import { createEncounter, createMonsterUnit } from '../src/systems/dungeons';
import { createHero } from '../src/systems/heroes';
import { classIdsThatCanUse, equipItem, findEquipProblem } from '../src/systems/equipment';
import { equipSpell, findLearnProblem, learnCostCopper, learnSpell } from '../src/systems/spells';
import { SPELL_LEARN_COST_CURVE, ULTIMATE_LEARN_COST_FACTOR } from '../src/content/balance/spells';

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

// A finished craft waits until the player clicks the crafter, so the helper clicks every crafter that is ready.
function finishJobs(store: GameStore): void {
  clock.nowMs += ONE_HOUR_MS;
  store.execute(collectFinishedJobsCommand(clock.nowMs));
  for (const job of store.getState().jobs) {
    if (job.kind === 'craft' && job.isWaitingForCollection) store.execute(collectWaitingCraftCommand(job.professionId));
  }
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
  return generateCraftedItem({ itemId: 'old-sword', baseId: 'sword', tier: 1, setMaterialId: null, itemLevel: 1, upgradeLevel: 0, craftingCostCopper: 10, ingredientCount: 1 }, createRandom(1));
}

// A save always loads. A good save comes back unchanged. A broken part is dropped, and the heroes, levels, gear and dungeon progress stay.
function checkSaveSalvage(state: GameState): void {
  const freshState = createNewGameState(1);
  const intact = loadGameState(JSON.stringify(state), freshState);
  assert.ok(intact?.isIntact, 'a good save loads without any loss');
  assert.deepEqual(intact.state, state, 'a good save comes back unchanged');

  const tooNew = loadGameState(JSON.stringify({ ...state, saveVersion: CURRENT_SAVE_VERSION + 5 }), freshState);
  assert.ok(tooNew && !tooNew.isIntact, 'a save from a newer game still loads, and its raw text is kept');
  assert.deepEqual(tooNew.state.company, state.company, 'a newer save keeps the heroes');

  const geared = state.company.find((hero: Hero) => Object.keys(hero.equipment).length >= 1);
  assert.ok(geared, 'the test company has a hero with gear');
  const [brokenSlot] = Object.keys(geared.equipment) as EquipmentSlot[];
  assert.ok(brokenSlot);
  const brokenText = JSON.stringify({
    ...state,
    company: [
      ...state.company.map((hero: Hero) => hero.id === geared.id
        ? { ...hero, learnedSpellIds: [...hero.learnedSpellIds, 'no-such-spell'], equipment: { ...hero.equipment, [brokenSlot]: { ...(hero.equipment as Record<string, object>)[brokenSlot], baseId: 'no-such-base' } } }
        : hero),
      { id: 'hero-broken', classId: 'no-such-class', level: 4 },
    ],
    clearedDungeonIds: [...state.clearedDungeonIds, 'no-such-dungeon'],
    backpack: [{ column: 0, row: 0, content: { kind: 'material', materialId: 'no-such-material', quantity: 1 } }, ...state.backpack],
    reports: 'not a list',
  });
  const repaired = loadGameState(brokenText, freshState);
  assert.ok(repaired && !repaired.isIntact, 'a damaged save loads, and its raw text is kept');
  const repairedHero = repaired.state.company.find((hero: Hero) => hero.id === geared.id);
  assert.equal(repaired.state.company.length, state.company.length, 'only the hero with an unknown class is dropped');
  assert.equal(repairedHero?.level, geared.level, 'the hero keeps its level');
  assert.equal(repairedHero?.equipment[brokenSlot], undefined, 'the broken gear is left out');
  assert.equal(Object.keys(repairedHero?.equipment ?? {}).length, Object.keys(geared.equipment).length - 1, 'the other gear stays');
  assert.deepEqual(repairedHero?.learnedSpellIds, geared.learnedSpellIds, 'an unknown spell is left out');
  assert.deepEqual(repaired.state.clearedDungeonIds, state.clearedDungeonIds, 'the dungeon progress stays');
  assert.deepEqual(repaired.state.backpack, state.backpack, 'a broken backpack entry is left out');
  assert.equal(loadGameState('not json', freshState), null, 'text that is not a save does not load');
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
  store.execute((state) => ({ ...state, clearedDungeonIds: [...state.clearedDungeonIds, 'wolf-trail', 'goblin-camp'] }));
  assert.equal(rejectionKey(store, hireHeroCommand('thief')), 'reject.classLocked', 'clearing Wolf Trail does not open the thief');
  assert.equal(rejectionKey(store, hireHeroCommand('priest')), 'reject.classLocked', 'clearing the Goblin Camp does not open the priest');
  store.execute((state) => ({ ...state, clearedDungeonIds: [...state.clearedDungeonIds, 'goblin-chief-lair'] }));
  assert.notEqual(rejectionKey(store, hireHeroCommand('thief')), 'reject.classLocked', 'clearing the first town opens the thief');
  assert.notEqual(rejectionKey(store, hireHeroCommand('priest')), 'reject.classLocked', 'clearing the first town opens the priest');
  store.execute(() => stateBeforeUnlock);
  for (const baseId of ['greataxe', 'maul', 'knuckles', 'cestus']) assert.ok(findRecipe(baseId, 1), `${baseId} has a tier 1 recipe`);

  const damageBefore = computeHeroSheet(warrior).damage;
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
  assert.ok(equippedWarrior && computeHeroSheet(equippedWarrior).damage > damageBefore, 'the sword raises physical damage');

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
  assert.equal(store.getState().backpack.find((entry) => entry.column === itemEntry.column && entry.row === itemEntry.row)?.saleJobId, store.getState().jobs[0]?.id, 'goods on sale stay in their cell, marked with the sale');
  assert.equal(rejectionKey(store, sellBackpackEntryCommand({ column: itemEntry.column, row: itemEntry.row }, clock.nowMs)), 'reject.alreadyOnSale', 'goods are sold once');
  for (let extraSale = 0; extraSale < 2; extraSale++) {
    const nextEntry = store.getState().backpack.find((entry) => entry.saleJobId === undefined);
    assert.ok(nextEntry);
    assert.equal(rejectionKey(store, sellBackpackEntryCommand({ column: nextEntry.column, row: nextEntry.row }, clock.nowMs)), null);
  }
  const lastEntry = store.getState().backpack.find((entry) => entry.saleJobId === undefined);
  assert.ok(lastEntry);
  assert.equal(rejectionKey(store, sellBackpackEntryCommand({ column: lastEntry.column, row: lastEntry.row }, clock.nowMs)), 'reject.merchantBusy', 'the merchant has few sale slots');
  finishJobs(store);
  assert.ok(store.getState().copper > copperBeforeSale, 'selling pays money');
  assert.equal(store.getState().jobs.length, 0, 'finished jobs leave the list');
  assert.ok(store.getState().backpack.every((entry) => entry.saleJobId === undefined), 'sold goods leave the backpack');

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
  const reportedWarrior = finalState.reports[0]?.result.heroes.find((heroResult) => heroResult.heroId === warrior.id);
  const startingWarriorUnit = plannedFight.partyUnits.find((unit) => unit.id === warrior.id);
  assert.ok(reportedWarrior && startingWarriorUnit && reportedWarrior.healthBefore === Math.round(startingWarriorUnit.hp) && reportedWarrior.healthBefore >= reportedWarrior.healthLost, 'the report keeps the health the hero had at the start, so the health bar starts from it');
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
  assert.equal(applyCraftingExperience({ level: 1, experience: 0 }, 1000).level, 3, 'a new crafter gains at most 2 levels from one craft');
  assert.equal(applyCraftingExperience({ level: 2, experience: 0 }, 1000).level > 3, true, 'the cap ends at crafter level 2');
  const encounters = finalState.reports.length;

  // A sale can be cancelled, and the goods never left their cell.
  const goodsEntry = finalState.backpack[0];
  assert.ok(goodsEntry, 'the backpack holds something to sell');
  const entriesBeforeSale = finalState.backpack.length;
  assert.equal(rejectionKey(store, sellBackpackEntryCommand({ column: goodsEntry.column, row: goodsEntry.row }, clock.nowMs)), null);
  const saleJob = store.getState().jobs.find((job) => job.kind === 'sell');
  assert.ok(saleJob, 'the sale is a job');
  assert.equal(rejectionKey(store, cancelSaleCommand(saleJob.id)), null, 'cancel the sale');
  assert.equal(store.getState().jobs.length, 0, 'a cancelled sale leaves no job');
  assert.equal(store.getState().backpack.length, entriesBeforeSale, 'the goods return to the backpack');
  assert.ok(store.getState().backpack.every((entry) => entry.saleJobId === undefined), 'a cancelled sale clears the sale mark');

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

  checkSaveSalvage(store.getState());

  const hero = finalState.company[0];
  return JSON.stringify([finalState.copper, encounters, hero?.level, hero?.experience, hero?.statistics]);
}

// The Goblin Chief casts its own spells. They cost no resource and wait for their cooldown.
{
  const goblinChief = createMonsterUnit('goblin-chief', 10, 'boss-spell-check');
  assert.deepEqual(goblinChief.spells.map((spell) => spell.id), ['goblin-chief.cowing-roar', 'goblin-chief.war-cry', 'goblin-chief.crushing-cleaver'], 'the boss has its three spells');
  const challenger = { ...createHero('warrior', 1, createRandom(3)), level: 10 };
  const bossFight = simulateRealtimeBattle([heroToBattleUnit(challenger), goblinChief], createRandom(3).fork('battle'));
  assert.ok(bossFight.events.some((event) => event.spellId?.startsWith('goblin-chief.') && event.resourceSpent === undefined), 'the boss casts a spell in the fight, and the log shows no resource cost');
}

// The Goblin Chief attacks the hero with the most Defence first, with basic attacks and with spells.
{
  const tankUnit = { ...heroToBattleUnit({ ...createHero('warrior', 1, createRandom(3)), level: 10 }), maxHp: 100_000, hp: 100_000 };
  const squishyUnit = { ...heroToBattleUnit({ ...createHero('mage', 2, createRandom(3)), level: 10 }), maxHp: 100_000, hp: 100_000 };
  assert.ok(tankUnit.defence > squishyUnit.defence, 'the warrior has more Defence than the mage');
  const boss = createMonsterUnit('goblin-chief', 10, 'boss-target-check');
  const report = simulateRealtimeBattle([tankUnit, squishyUnit, boss], createRandom(3).fork('battle'));
  const bossHits = report.events.filter((event) => event.actorId === boss.id && event.kind === 'attack');
  assert.ok(bossHits.length > 4, 'the boss attacks several times');
  assert.ok(bossHits.every((event) => event.targetId === tankUnit.id), 'the boss never attacks the hero with less Defence while the frontline stands');
}

// Frost Shard hits and slows. A slowed boss acts less often, so it hits the Mage fewer times.
{
  const frostShard = findSpell('mage.frost-shard');
  assert.ok(frostShard?.effect.kind === 'damage' && frostShard.effect.inflicts?.status === 'slow', 'Frost Shard slows the enemy it hits');
  const mageWithoutSpell = { ...createHero('mage', 1, createRandom(4)), level: 10 };
  const mageWithFrostShard = equipSpell(learnSpell(mageWithoutSpell, frostShard), frostShard, 0);
  const bossHitsOn = (hero: typeof mageWithoutSpell): number => {
    const boss = createMonsterUnit('goblin-chief', 10, 'boss-slow-check');
    const report = simulateRealtimeBattle([{ ...heroToBattleUnit(hero), maxHp: 100_000, hp: 100_000 }, boss], createRandom(4).fork('battle'));
    return report.events.filter((event) => event.actorId === boss.id && event.kind === 'attack').length / report.durationSeconds;
  };
  assert.ok(bossHitsOn(mageWithFrostShard) < bossHitsOn(mageWithoutSpell), 'a slowed boss hits fewer times each second');
}

// A higher rank replaces the lower rank in the same slot. It needs the lower rank first, and a lower rank cannot be learned again.
{
  const powerStrike = findSpell('warrior.power-strike');
  const powerStrikeTwo = findSpell('warrior.power-strike-2');
  assert.ok(powerStrike && powerStrikeTwo, 'Power Strike has a rank 2');
  const level10Warrior = { ...createHero('warrior', 1, createRandom(9)), level: 10 };
  assert.equal(findLearnProblem(level10Warrior, powerStrikeTwo)?.key, 'reject.spellNeedsLowerRank', 'rank 2 needs rank 1');
  const withRankOne = learnSpell(level10Warrior, powerStrike);
  const withRankTwo = learnSpell(withRankOne, powerStrikeTwo);
  assert.deepEqual(withRankTwo.learnedSpellIds, ['warrior.power-strike-2'], 'rank 2 replaces rank 1 in the learned list');
  assert.deepEqual(withRankTwo.equippedSpellIds, ['warrior.power-strike-2', null, null], 'rank 2 takes the slot of rank 1');
  assert.equal(findLearnProblem(withRankTwo, powerStrike)?.key, 'reject.spellAlreadyLearned', 'a lower rank cannot be learned again');
}

// Defence spells: Shield Bash adds Defence to its damage, Fortify raises Defence, Thorns send damage back, Sunder raises damage taken.
{
  const hobgoblinAverageHit = (hero: BattleUnitOfHero, monsterSpells: readonly BattleSpell[] = []): number => {
    // A monster that cannot die keeps the fight at the time limit, so the many hits average out the random damage.
    const monster = { ...createMonsterUnit('hobgoblin', 10, 'defence-check'), spells: monsterSpells, maxHp: 1_000_000_000, hp: 1_000_000_000 };
    const report = simulateRealtimeBattle([{ ...hero, maxHp: 1_000_000, hp: 1_000_000 }, monster], createRandom(11).fork('battle'));
    const hits = report.events.filter((event) => event.actorId === monster.id && event.kind === 'attack');
    return hits.reduce((total, event) => total + event.amount, 0) / hits.length;
  };
  type BattleUnitOfHero = ReturnType<typeof heroToBattleUnit>;
  const bareWarrior = { ...heroToBattleUnit({ ...createHero('warrior', 1, createRandom(10)), level: 10 }), defence: 100 };
  const withSpell = (spellId: string): BattleUnitOfHero => ({ ...bareWarrior, spells: [findSpell(spellId) as SpellDefinition] });

  const shieldBashDamage = (defence: number): number => {
    const monster = createMonsterUnit('hobgoblin', 10, 'bash-check');
    const report = simulateRealtimeBattle([{ ...withSpell('warrior.shield-bash'), defence, maxHp: 1_000_000, hp: 1_000_000 }, monster], createRandom(11).fork('battle'));
    return report.events.find((event) => event.spellId === 'warrior.shield-bash')?.amount ?? 0;
  };
  assert.ok(shieldBashDamage(100) > shieldBashDamage(10) * 1.5, 'Shield Bash hits harder for a hero with more Defence');

  assert.ok(hobgoblinAverageHit(withSpell('warrior.guard-stance')) < hobgoblinAverageHit(bareWarrior), 'Fortify raises Defence, so the hero takes smaller hits');

  const reflectReport = simulateRealtimeBattle([{ ...withSpell('warrior.iron-wall'), maxHp: 1_000_000, hp: 1_000_000 }, createMonsterUnit('hobgoblin', 10, 'thorns-check')], createRandom(11).fork('battle'));
  const reflectEvents = reflectReport.events.filter((event) => event.isReflect);
  assert.ok(reflectEvents.length > 0 && reflectEvents.every((event) => event.actorId === bareWarrior.id && event.amount > 0), 'Iron Wall gives the caster Thorns, and the reflected damage comes from the caster');

  const sunderingMonsterSpell: BattleSpell = { id: 'test.sunder', isUltimate: false, cooldownSeconds: 1000, castSeconds: 0.8, resourceCost: 0, effect: { kind: 'status', status: 'sunder', target: 'enemy', strength: 0.5, durationSeconds: 1000 } };
  assert.ok(hobgoblinAverageHit(bareWarrior, [sunderingMonsterSpell]) > hobgoblinAverageHit(bareWarrior) * 1.3, 'Sunder raises the damage a unit takes');
}

// A damage spell with magicPower adds a magic part to each hit, so a monster with high Resistance takes less from it than a monster with low Resistance.
{
  assert.equal(findSpell('warrior.thunder-slam'), undefined, 'Thunder Slam is reserved for a specialisation, so the game does not load it');
  const thunderSlam: BattleSpell = { id: 'test.hybrid-slam', isUltimate: false, cooldownSeconds: 11, castSeconds: 0.8, resourceCost: 0, effect: { kind: 'damage', damageKind: 'physical', target: 'allEnemies', hits: 1, power: 1.4, magicPower: 0.9 } };
  const slamDamage = (resistance: number): number => {
    const unit = { ...heroToBattleUnit({ ...createHero('warrior', 1, createRandom(12)), level: 10 }), spells: [thunderSlam], maxHp: 1_000_000, hp: 1_000_000, maxResource: 1000, resource: 1000 };
    const monster = { ...createMonsterUnit('hobgoblin', 10, 'slam-check'), resistance };
    return simulateRealtimeBattle([unit, monster], createRandom(12).fork('battle')).events.find((event) => event.spellId === thunderSlam.id)?.amount ?? 0;
  };
  assert.ok(slamDamage(0) > slamDamage(200), 'the magic part of Thunder Slam is reduced by Resistance');
}

// Life steal, critical chance and critical damage come from suffixes. They reach the battle unit, the hero sheet and the fight.
{
  const sword = generateSwordForMigration();
  const withBonuses = (affixes: Item['affixes']): Hero => ({ ...createHero('warrior', 1, createRandom(8)), level: 10, equipment: { mainHand: { ...sword, affixes } } });
  const plainUnit = heroToBattleUnit(withBonuses([]));
  const bonusAffixes: Item['affixes'] = [
    { affixId: 'of-the-leech', kind: 'suffix', displayName: 'of the Leech', stat: 'lifeSteal', value: 5 },
    { affixId: 'of-the-viper', kind: 'suffix', displayName: 'of the Viper', stat: 'criticalChance', value: 3 },
    { affixId: 'of-carnage', kind: 'suffix', displayName: 'of Carnage', stat: 'criticalDamage', value: 15 },
  ];
  const bonusHero = withBonuses(bonusAffixes);
  const bonusUnit = heroToBattleUnit(bonusHero);
  assert.equal(plainUnit.lifeSteal, 0, 'gear without life steal gives none');
  assert.ok(Math.abs(bonusUnit.lifeSteal - 0.05) < 1e-9, 'life steal comes from the suffix');
  assert.ok(Math.abs(bonusUnit.critChance - plainUnit.critChance - 0.03) < 1e-9, 'critical chance from gear adds to the base chance');
  assert.ok(Math.abs(bonusUnit.criticalDamageMultiplier - plainUnit.criticalDamageMultiplier - 0.15) < 1e-9, 'critical damage adds to the multiplier');
  const bonusSheet = computeHeroSheet(bonusHero);
  assert.equal(bonusSheet.lifeSteal, 5);
  assert.equal(bonusSheet.criticalDamage, Math.round(bonusUnit.criticalDamageMultiplier * 100));

  const healEventsOf = (unit: typeof bonusUnit): number => {
    const fight = simulateRealtimeBattle([{ ...unit, maxHp: 100_000, hp: 50_000, lifeSteal: unit.lifeSteal }, createMonsterUnit('goblin-chief', 10, 'life-steal-check')], createRandom(8).fork('battle'));
    return fight.events.filter((event) => event.kind === 'heal' && event.actorId === unit.id && event.targetId === unit.id).length;
  };
  assert.equal(healEventsOf(plainUnit), 0, 'a hero without life steal never heals itself');
  assert.ok(healEventsOf({ ...bonusUnit, lifeSteal: 0.5 }) > 0, 'a hero with life steal heals when it hits');

  const rolledValues: Record<string, number[]> = {};
  for (let seed = 1; seed <= 600; seed++) {
    const crafted = generateCraftedItem({ itemId: `roll-${seed}`, baseId: 'sword', tier: 1, setMaterialId: null, itemLevel: 40, upgradeLevel: 0, craftingCostCopper: 10, ingredientCount: 1 }, createRandom(seed));
    for (const affix of crafted.affixes) (rolledValues[affix.affixId] ??= []).push(affix.value);
  }
  for (const affix of AFFIXES.filter((definition) => definition.scalesWithItemLevel === false)) {
    const values = rolledValues[affix.id] ?? [];
    assert.ok(values.length > 0, `${affix.id} is crafted by chance`);
    assert.ok(values.every((value) => value >= affix.minimumValue && value <= affix.maximumValue), `${affix.id} does not grow with the item level`);
  }
  for (const kind of ['prefix', 'suffix'] as const) {
    assert.equal(AFFIXES.filter((definition) => definition.kind === kind).length, 15, `there are 15 affixes of kind ${kind}`);
    for (const affix of AFFIXES.filter((definition) => definition.kind === kind)) assert.ok((rolledValues[affix.id] ?? []).length > 0, `${affix.id} is crafted by chance`);
  }

  const upgradeBonusOf = (baseId: string, itemLevel: number, upgradeLevel: number): number => {
    const craft = (level: number) => generateCraftedItem({ itemId: `upgrade-${baseId}`, baseId, tier: 1, setMaterialId: null, itemLevel, upgradeLevel: level, craftingCostCopper: 10, ingredientCount: 1, quality: 'common' }, createRandom(5));
    const mainStat = BASE_ITEMS.find((base) => base.id === baseId)?.mainStat as keyof Item['baseStats'];
    return (craft(upgradeLevel).baseStats[mainStat] ?? 0) - (craft(0).baseStats[mainStat] ?? 0);
  };
  assert.equal(upgradeBonusOf('sword', 1, 3), 3, 'a low item gains at least 1 main stat for each upgrade level');
  assert.equal(upgradeBonusOf('boots-medium', 1, 2), 2, 'an armour piece gains at least 1 main stat for each upgrade level');
  assert.ok(upgradeBonusOf('sword', 100, 3) >= 3 * 5, 'a high item gains a share of the main stat for each upgrade level');
}

// A wound cuts the healing that a unit receives. The Goblin Chief wounds with Crushing Cleaver.
{
  const cleaver = MONSTER_SPELLS.find((spell) => spell.id === 'goblin-chief.crushing-cleaver');
  assert.ok(cleaver?.effect.kind === 'damage' && cleaver.effect.inflicts?.status === 'wound', 'Crushing Cleaver wounds the hero');
  const minorHeal = findSpell('priest.minor-heal');
  assert.ok(minorHeal);
  const priest = equipSpell(learnSpell({ ...createHero('priest', 1, createRandom(6)), level: 10 }, minorHeal), minorHeal, 0);
  const averageHealAfterBossSpells = (bossSpells: readonly BattleSpell[]): number => {
    const boss = { ...createMonsterUnit('goblin-chief', 10, 'boss-wound-check'), spells: bossSpells };
    const woundedPriest = { ...heroToBattleUnit(priest), maxHp: 100_000, hp: 50_000 };
    const heals = simulateRealtimeBattle([woundedPriest, boss], createRandom(6).fork('battle')).events.filter((event) => event.kind === 'heal' && event.actorId === woundedPriest.id);
    return heals.reduce((total, event) => total + event.amount, 0) / heals.length;
  };
  assert.ok(averageHealAfterBossSpells([cleaver]) < averageHealAfterBossSpells([]), 'a wounded hero is healed less');
}

// Smithing must pay a little: the average sale beats the fee plus what the raw materials would sell for.
for (let tier = 1; tier <= 2; tier++) {
  for (const recipe of listRecipes(tier)) {
    const materialValue = recipe.ingredients.reduce((total, ingredient) => total + requireById(MATERIALS, ingredient.materialId).sellValueCopper * ingredient.quantity, 0);
    const averageQualityFactor = Object.entries(QUALITY_WEIGHTS).reduce((total, [quality, weight]) => total + weight * SELL_QUALITY_FACTOR[quality as keyof typeof SELL_QUALITY_FACTOR], 0) / Object.values(QUALITY_WEIGHTS).reduce((total, weight) => total + weight, 0);
    const ingredientCount = recipe.ingredients.reduce((total, ingredient) => total + ingredient.quantity, 0);
    const averageSale = (materialValue + recipe.feeCopper + SELL_ADDED_VALUE_COPPER_PER_INGREDIENT * ingredientCount) * averageQualityFactor;
    assert.ok(averageSale > materialValue + recipe.feeCopper, `crafting ${recipe.baseId} (tier ${tier}) pays more than it costs`);
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
  const report = simulateRealtimeBattle([heroToBattleUnit(priest), ...monsters], createRandom(8).fork('battle'));
  const firstHealIndex = report.events.findIndex((event) => event.spellId === 'priest.minor-heal');
  const firstHitOnHeroIndex = report.events.findIndex((event) => event.kind === 'attack' && event.targetId === priest.id);
  assert.ok(firstHealIndex < 0 || firstHealIndex > firstHitOnHeroIndex, 'a heal is cast only after the hero is wounded');
  assert.equal(report.events.filter((event) => event.spellId === 'priest.divine-shield' && event.timeSeconds < 8).length, 1, 'a guard does not stack while it lasts');
  const withoutMana = { ...heroToBattleUnit(priest), resource: 0, maxResource: 0 };
  const dryReport = simulateRealtimeBattle([withoutMana, ...monsters], createRandom(8).fork('battle'));
  assert.ok(dryReport.events.every((event) => event.spellId === undefined), 'a hero with no resource casts nothing');
  for (const heroClass of CLASSES) {
    const classSpells = spellsOfClass(heroClass.id);
    assert.equal(classSpells.filter((spell) => !spell.isUltimate).length, 17, `${heroClass.id} has 17 spells and ranks in its base tree`);
    assert.equal(classSpells.filter((spell) => spell.isUltimate).length, 1, `${heroClass.id} has one Ultimate in its base tree`);
  }
}

// New battle rules: spread hits, Evade, a mana shield, Burn, Hex and Empower.
{
  const casterWith = (classId: ClassId, spellIds: string[]): BattleUnit => ({
    ...heroToBattleUnit({ ...createHero(classId, 10, createRandom(3)), level: 10 }),
    maxHp: 100_000,
    hp: 100_000,
    spells: spellIds.map((spellId) => requireById(SPELLS, spellId)),
  });
  const wolves = (count: number): BattleUnit[] => Array.from({ length: count }, (_, index) => ({ ...createMonsterUnit('wolf', 10, `wolf-${index}`), maxHp: 100_000, hp: 100_000, attack: 0.001 }));
  const fight = (units: BattleUnit[], seed = 4) => simulateRealtimeBattle(units, createRandom(seed).fork('battle'));
  const firstCast = (events: readonly BattleEvent[], spellId: string): BattleEvent[] => {
    const first = events.find((event) => event.spellId === spellId);
    return first ? events.filter((event) => event.spellId === spellId && event.timeSeconds === first.timeSeconds && event.kind === 'attack') : [];
  };

  const volleyAtTwo = firstCast(fight([casterWith('archer', ['archer.volley']), ...wolves(2)]).events, 'archer.volley');
  assert.equal(volleyAtTwo.length, 5, 'a volley shoots 5 arrows');
  assert.deepEqual(volleyAtTwo.map((event) => event.targetId), ['wolf-0', 'wolf-1', 'wolf-0', 'wolf-1', 'wolf-0'], 'the arrows go to the enemies in turn');
  assert.ok(firstCast(fight([casterWith('archer', ['archer.volley']), ...wolves(1)]).events, 'archer.volley').every((event) => event.targetId === 'wolf-0'), 'with one enemy every arrow hits it');

  const dodger = casterWith('archer', ['archer.evasive-shot']);
  const dodgeFight = fight([dodger, { ...createMonsterUnit('wolf', 10, 'biter'), attack: 5, maxHp: 100_000, hp: 100_000 }]);
  const evasiveCastSeconds = dodgeFight.events.find((event) => event.spellId === 'archer.evasive-shot')?.timeSeconds ?? 0;
  const hitsOnDodger = dodgeFight.events.filter((event) => event.targetId === dodger.id && event.kind === 'attack' && event.timeSeconds >= evasiveCastSeconds);
  assert.ok(hitsOnDodger[0]?.isDodge === true && hitsOnDodger[0].amount === 0, 'Evasive Shot dodges the next hit');
  assert.ok(hitsOnDodger[1]?.isDodge !== true, 'it dodges only one hit at rank 1');

  const mage = casterWith('mage', ['mana-shield', 'fire-bolt'].map((name) => `mage.${name}`));
  const shieldFight = fight([mage, { ...createMonsterUnit('wolf', 10, 'shield-biter'), attack: 3, maxHp: 100_000, hp: 100_000 }]);
  const shieldCast = shieldFight.events.find((event) => event.spellId === 'mage.mana-shield');
  assert.equal(shieldCast?.resourceSpent, Math.round(mage.maxResource * 0.25), 'a mana shield costs a quarter of the maximum mana');
  const absorbedHits = shieldFight.events.filter((event) => event.targetId === mage.id && (event.absorbed ?? 0) > 0);
  assert.ok(absorbedHits.length > 0 && absorbedHits.filter((event) => event.targetShieldAfter !== 0).every((event) => event.absorbed === event.amount), 'a hit that the shield can take does not touch the health');
  assert.ok(shieldFight.events.filter((event) => event.spellId === 'mage.mana-shield').length >= 2, 'the shield is cast again after it ends');

  const burnFight = fight([casterWith('mage', ['mage.fireball']), ...wolves(1)]);
  const burnTicks = burnFight.events.filter((event) => event.isDamageOverTime);
  const burnCastSeconds = burnFight.events.find((event) => event.spellId === 'mage.fireball')?.timeSeconds ?? 0;
  assert.equal(burnTicks.filter((event) => event.timeSeconds <= burnCastSeconds + 4).length, 4, 'a burn of 4 s hurts 4 times');
  assert.ok(burnTicks.every((event) => event.spellId === undefined && event.amount > 0), 'a burn tick is plain damage with no spell look');

  const averageHit = (events: readonly BattleEvent[], actorId: string): number => {
    const hits = events.filter((event) => event.actorId === actorId && event.kind === 'attack' && !event.isCritical && event.spellId === undefined && !event.isDodge);
    return hits.reduce((total, event) => total + event.amount, 0) / hits.length;
  };
  const plainArcher = casterWith('archer', []);
  const focusedArcher = casterWith('archer', ['archer.hunters-focus']);
  assert.ok(averageHit(fight([focusedArcher, ...wolves(1)]).events.filter((event) => event.timeSeconds < 9), focusedArcher.id) > averageHit(fight([plainArcher, ...wolves(1)]).events.filter((event) => event.timeSeconds < 9), plainArcher.id), 'Empower raises the attack of an Archer');
  const boltsWithin = (spellIds: string[]): number => {
    const caster = { ...casterWith('mage', spellIds), damageVarianceFraction: 0, critChance: 0 };
    const hits = fight([caster, ...wolves(1)]).events.filter((event) => event.actorId === caster.id && event.spellId === 'mage.fire-bolt' && !event.isCritical && event.timeSeconds < 9);
    return hits.reduce((total, event) => total + event.amount, 0) / hits.length;
  };
  assert.ok(boltsWithin(['mage.arcane-unravel', 'mage.fire-bolt']) > boltsWithin(['mage.fire-bolt']) * 1.05, 'Hex raises the magic damage that the enemy takes');
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
  const rageReport = simulateRealtimeBattle([barbarian, ...rageMonsters], createRandom(8).fork('battle'));
  const firstBarbarianEvent = rageReport.events.find((event) => event.actorId === barbarian.id);
  assert.ok((firstBarbarianEvent?.actorResourceAfter ?? 0) > 0, 'a hit builds rage');
  const firstHitOnBarbarian = rageReport.events.find((event) => event.targetId === barbarian.id && event.kind === 'attack');
  assert.ok((firstHitOnBarbarian?.targetResourceAfter ?? 0) > 0, 'a hit taken builds rage');
  const spender = learnSpell(createHero('barbarian', 1, createRandom(3)), spellsOfClass('barbarian')[0] as SpellDefinition);
  const spendReport = simulateRealtimeBattle([heroToBattleUnit(spender), ...rageMonsters], createRandom(8).fork('battle'));
  const firstCast = spendReport.events.find((event) => event.spellId !== undefined);
  assert.ok(firstCast === undefined || (firstCast.resourceSpent ?? 0) > 0, 'a cast reports what it cost');
}

// Set recipes: a dungeon material makes an armour piece with a fixed bonus. Basic recipes need only their main material.
{
  const basicRecipe = findRecipe('helm-heavy', 1);
  const fangRecipe = findRecipe('gloves-heavy', 1, 'sharp-fang');
  assert.deepEqual(basicRecipe?.ingredients.map((ingredient) => ingredient.materialId), ['copper-ore'], 'a basic recipe needs only its main material');
  assert.deepEqual(fangRecipe?.ingredients.map((ingredient) => ingredient.materialId), ['copper-ore', 'sharp-fang'], 'a set recipe adds the set material');
  const setRecipes = listRecipes(1).filter((recipe) => recipe.setMaterialId !== null);
  assert.ok(setRecipes.every((recipe) => recipe.requiredCraftLevel === findRecipe(recipe.baseId, 1)?.requiredCraftLevel), 'every set recipe opens at the level of its basic recipe, even before the player owns the set material');
  assert.ok(setRecipes.every((recipe) => recipe.itemLevel === findRecipe(recipe.baseId, 1)?.itemLevel), 'every set recipe has the item level of its basic recipe');
  assert.ok(findRecipe('helm-heavy', 1, 'sharp-fang') && findRecipe('boots-heavy', 1, 'sharp-fang'), 'every armour piece has set recipes, whatever its craft level');
  assert.equal(findRecipe('belt', 1, 'sharp-fang'), undefined, 'a belt has no set recipe');
  assert.equal(findRecipe('ring', 1, 'sharp-fang'), undefined, 'a ring has no set recipe');
  assert.equal(findRecipe('sword', 1, 'toadskin'), undefined, 'a weapon of craft level 1 has no set recipe');
  const bodyArmourVariants = listRecipes(1).filter((recipe) => recipe.baseId === 'armour-heavy');
  assert.equal(bodyArmourVariants.length, 1 + MATERIALS.filter((material) => material.tier === 1 && material.setBonus !== undefined).length, 'body armour has a basic recipe and one set recipe for each set material');
  assert.ok(bodyArmourVariants.every((recipe) => recipe.requiredCraftLevel === 8), 'all body armour variants need crafter level 8');
  const setSlots = new Set(listRecipes(1).filter((recipe) => recipe.setMaterialId !== null).map((recipe) => BASE_ITEMS.find((base) => base.id === recipe.baseId)?.slot));
  for (const slot of ['mainHand', 'offHand', 'gloves', 'boots', 'legs', 'armour']) assert.ok(setSlots.has(slot as Item['slot']), `a set recipe exists for the ${slot} slot`);
  assert.ok(findRecipe('axe', 1, 'sharp-fang'), 'a weapon can be made from a set material');
  assert.ok(findRecipe('shield', 1, 'bone-shard'), 'an off-hand item can be made from a set material');
  assert.equal(findRecipe('ring', 1, 'sharp-fang'), undefined, 'jewellery and belts have no set recipe');
  const rolledSetItems = Array.from({ length: 400 }, (_, seed) => generateCraftedItem({ itemId: `set-${seed}`, baseId: 'sword', tier: 1, setMaterialId: 'sharp-fang', itemLevel: 3, upgradeLevel: seed % 8, craftingCostCopper: 10, ingredientCount: 2 }, createRandom(seed)));
  assert.ok(rolledSetItems.some((item) => item.quality === 'magic' && item.affixes.length > 0), 'a set item can roll magic quality with affixes');
  assert.ok(rolledSetItems.some((item) => item.quality === 'rare' && item.rareNameParts !== null), 'a set item can roll rare quality with a rare name');
  assert.ok(rolledSetItems.every((item) => item.materialId === 'sharp-fang'), 'every set item keeps its set material');
  assert.ok(rolledSetItems.filter((item) => item.upgradeLevel > 0).length > 0, 'a set item can carry an upgrade level');
  const averageSaleOfQuality = (quality: Item['quality']): number => {
    const sales = rolledSetItems.filter((item) => item.quality === quality && item.upgradeLevel === 0).map((item) => item.sellValueCopper);
    return sales.reduce((total, sale) => total + sale, 0) / sales.length;
  };
  assert.ok(averageSaleOfQuality('magic') > averageSaleOfQuality('common') && averageSaleOfQuality('rare') > averageSaleOfQuality('magic'), 'a better quality sells for more');
  assert.ok(averageSaleOfQuality('rare') < averageSaleOfQuality('common') * 3.5, 'a rare set item sells for more than a common one, but not for several times more');
  const makeHelm = (setMaterialId: string | null): Item => generateCraftedItem({ itemId: 'helm', baseId: 'helm-heavy', tier: 1, setMaterialId, itemLevel: 1, upgradeLevel: 0, craftingCostCopper: 1, ingredientCount: 1 }, createRandom(4));
  const warrior = createHero('warrior', 1, createRandom(3));
  const agilityWith = (helm: Item): number => computeHeroSheet({ ...warrior, equipment: { helm } }).agility;
  assert.equal(makeHelm('sharp-fang').materialId, 'sharp-fang', 'a set piece keeps its set material');
  assert.equal(agilityWith(makeHelm('sharp-fang')) - agilityWith(makeHelm(null)), requireById(MATERIALS, 'sharp-fang').setBonus!.value, 'a set material gives its fixed bonus');
}

// Every spell up to level 10 shows a look and plays sounds in a real fight. The planner sees each cast once, in order.
{
  const seenRoles = new Set<string>();
  const spellsSeen = new Set<string>();
  const inflictingSpellsSeen = new Set<string>();
  for (const classId of ['warrior', 'archer', 'mage', 'priest', 'thief', 'barbarian', 'fighter'] as const) {
    const learnable = spellsOfClass(classId).filter((spell) => spell.unlockLevel <= 10 && !spell.isUltimate);
    const caster = learnable.reduce((hero, spell, index) => equipSpell(learnSpell(hero, spell), spell, index), { ...createHero(classId, 10, createRandom(3)), level: 10 });
    for (const dungeonId of ['rat-cellar', 'goblin-chief-lair']) {
      for (let seed = 1; seed <= 6; seed++) {
        const party = [heroToBattleUnit(caster), ...(dungeonId === 'goblin-chief-lair' ? [heroToBattleUnit({ ...createHero('priest', 5, createRandom(4)), id: 'partner' })] : [])];
        const monsters = createEncounter(requireById(DUNGEONS, dungeonId), party.length, createRandom(seed).fork('monsters'));
        const report = simulateRealtimeBattle([...party, ...monsters], createRandom(seed).fork('battle'));
        const unitsById = new Map([...party, ...monsters].map((unit) => [unit.id, unit]));
        let castsStarted = 0;
        report.events.forEach((event, index) => {
          const presentation = describeSpellEvent(report.events, index, unitsById);
          if (!presentation || !unitsById.get(event.actorId)?.id.startsWith('hero')) return;
          const spell = findSpell(presentation.spellId);
          if (!spell || spell.unlockLevel > 10 || presentation.visual === undefined) return;
          seenRoles.add(presentation.role);
          spellsSeen.add(spell.id);
          assert.ok(presentation.sounds, `${spell.id} has sounds`);
          if (presentation.startsCast) castsStarted += 1;
          if (presentation.role === 'buff' || presentation.role === 'debuff') assert.ok((presentation.statusDurationSeconds ?? 0) > 0, `${spell.id} status has a duration`);
          if (spell.effect.kind === 'damage' && spell.effect.inflicts) {
            assert.ok((presentation.statusDurationSeconds ?? 0) > 0, `${spell.id} shows its inflicted status for its duration`);
            inflictingSpellsSeen.add(spell.id);
          }
        });
        assert.ok(castsStarted <= report.events.length, 'casts are counted once');
      }
    }
  }
  // No hero spell of the base tree below level 11 only debuffs: heroes debuff through a damage spell that inflicts a status.
  for (const role of ['damage', 'heal', 'buff']) assert.ok(seenRoles.has(role), `a fight shows a ${role} spell look`);
  assert.ok(inflictingSpellsSeen.size >= 3, `fights show several inflicted debuffs (${inflictingSpellsSeen.size})`);
  assert.ok(spellsSeen.size >= 12, `fights cast many different spells with a look (${spellsSeen.size})`);
}

// The level cap is 10. A hero at the cap gets no more levels and no stored experience, and the hero view has no next level.
{
  const nearCap = { ...createHero('warrior', 9, createRandom(3)), level: 9, experience: 0 };
  const atCap = applyExperience(nearCap, 1_000_000);
  assert.equal(atCap.level, LEVEL_CAP, 'a hero stops at the level cap');
  assert.equal(atCap.experience, 0, 'a hero at the cap stores no experience');
  assert.equal(LEVEL_CAP, 10, 'the first town caps heroes at level 10');
  assert.equal(describeHero({ ...createNewGameState(1), company: [atCap] }, atCap, clock.nowMs).experienceToNextLevel, 0, 'a hero at the cap has no next level');
}

// The boss dungeon needs two heroes. Only one of them must reach the dungeon level.
{
  const memory: { saved: string | null } = { saved: null };
  const bossStore = createGameStore({ read: () => memory.saved, write: (text) => { memory.saved = text; }, clear: () => { memory.saved = null; } });
  const strongHero = { ...createHero('warrior', 10, createRandom(3)), id: 'strong-hero', level: 10 };
  const partnerHero = { ...createHero('priest', 4, createRandom(4)), id: 'partner-hero', level: 4 };
  bossStore.execute((state) => ({ ...state, company: [strongHero, partnerHero], clearedDungeonIds: DUNGEONS.filter((dungeon) => dungeon.bossMonsterId === null).map((dungeon) => dungeon.id) }));
  assert.equal(rejectionKey(bossStore, startDungeonRunCommand('goblin-chief-lair', [strongHero.id], clock.nowMs)), 'reject.tooFewHeroes', 'the boss needs 2 heroes');
  assert.equal(rejectionKey(bossStore, startDungeonRunCommand('goblin-chief-lair', [partnerHero.id, 'other'], clock.nowMs)), 'reject.heroMissing', 'both heroes must exist');
  const weakPair = { ...partnerHero, id: 'weak-hero', level: 5 };
  bossStore.execute((state) => ({ ...state, company: [...state.company, weakPair] }));
  assert.equal(rejectionKey(bossStore, startDungeonRunCommand('goblin-chief-lair', [partnerHero.id, weakPair.id], clock.nowMs)), 'reject.heroLevelTooLow', 'one hero must reach the dungeon level');
  assert.equal(rejectionKey(bossStore, startDungeonRunCommand('goblin-chief-lair', [strongHero.id, partnerHero.id], clock.nowMs)), null, 'a level 10 hero and a level 4 partner can fight the boss');
  assert.equal(bossStore.getState().dungeonRuns[0]?.heroIds.length, 2, 'the run holds both heroes');
}

// Crafters: Leatherworking makes medium armour and the Belt, Tailoring makes light armour and the Tome.
{
  const professionOf = (baseId: string) => BASE_ITEMS.find((base) => base.id === baseId)?.profession;
  for (const baseId of ['helm-medium', 'gloves-medium', 'boots-medium', 'legs-medium', 'armour-medium', 'belt']) assert.equal(professionOf(baseId), 'leatherworking', `${baseId} is made by the Leatherworker`);
  for (const baseId of ['helm-light', 'armour-light']) assert.equal(professionOf(baseId), 'tailoring', `${baseId} is made by the Tailor`);
  for (const baseId of ['wand', 'runed-wand', 'scepter', 'staff', 'arcane-staff', 'tome']) assert.equal(professionOf(baseId), 'enchanting', `${baseId} is made by the Enchanter`);
  assert.ok(createNewGameState(1).crafters.leatherworking, 'a new game has a Leatherworking crafter');
}

// Legs: every armour weight has a legs recipe, a hero of a fitting class wears it, and no two pieces of one set share a crafter level.
{
  for (const weight of ['heavy', 'medium', 'light']) {
    const pieceLevels = ['boots', 'gloves', 'helm', 'legs', 'armour'].map((slot) => `${slot}-${weight}`);
    for (const setMaterialId of [null, ...MATERIALS.filter((material) => material.tier === 1 && material.setBonus !== undefined).map((material) => material.id)]) {
      const levels = pieceLevels.flatMap((baseId) => findRecipe(baseId, 1, setMaterialId)?.requiredCraftLevel ?? []);
      if (setMaterialId === null) assert.equal(new Set(levels).size, levels.length, `the ${weight} plain pieces open at different crafter levels`);
      assert.ok(levels.every((level, index) => index === 0 || (level as number) >= (levels[index - 1] as number)), 'a set opens in the order boots, gloves, helm, legs, armour');
      assert.ok(levels.every((level) => (level as number) <= 10), `a level 10 crafter can make every ${weight} piece made from ${setMaterialId ?? 'the main material'}`);
    }
  }
  const wearerByWeight = { heavy: 'warrior', medium: 'archer', light: 'mage' } as const;
  for (const [weight, classId] of Object.entries(wearerByWeight)) {
    const legsRecipe = findRecipe(`legs-${weight}`, 1);
    assert.ok(legsRecipe, `a tier 1 recipe makes ${weight} legs`);
    const legs = generateCraftedItem({ itemId: `legs-${weight}`, baseId: `legs-${weight}`, tier: 1, setMaterialId: null, itemLevel: legsRecipe.itemLevel, upgradeLevel: 0, craftingCostCopper: 1, ingredientCount: 1 }, createRandom(4));
    assert.equal(legs.slot, 'legs', 'legs items use the legs slot');
    const wearer = { ...createHero(classId, legsRecipe.itemLevel, createRandom(3)), level: legsRecipe.itemLevel };
    assert.equal(findEquipProblem(wearer, legs), null, `a level ${legsRecipe.itemLevel} ${classId} can wear ${weight} legs`);
    const equipped = equipItem(wearer, legs).hero;
    assert.equal(equipped.equipment.legs?.id, legs.id, 'legs go into the legs slot');
    assert.ok(computeHeroSheet(equipped).armour + computeHeroSheet(equipped).resistance > computeHeroSheet(wearer).armour + computeHeroSheet(wearer).resistance, 'legs add armour or magic resist');
    const otherClassId = classId === 'warrior' ? 'mage' : 'warrior';
    assert.notEqual(findEquipProblem(createHero(otherClassId, 100, createRandom(3)), legs), null, `a ${otherClassId} cannot wear ${weight} legs`);
  }
}

// A version 14 report has no hero level or experience after the fight. The hero's current values stand in for them.
{
  const heroResult = { heroId: 'hero-1', damageDealt: 5, damageTaken: 1, healingDone: 0, monstersDefeated: 1, experienceGained: 7, reachedLevel: null };
  const versionFourteenSave = JSON.stringify({ saveVersion: 14, company: [{ id: 'hero-1', classId: 'warrior', level: 3, experience: 12, equipment: {} }], backpack: [], jobs: [], reports: [{ runNumber: 1, dungeonId: 'rat-cellar', firstClear: false, result: { won: true, heroes: [heroResult] } }] });
  const migratedReport = parseGameState(versionFourteenSave)?.reports[0]?.result.heroes[0];
  assert.ok(migratedReport?.levelAfter === 3 && migratedReport.experienceAfter === 12, 'a version 14 report gets the hero level and experience after the fight');
}

// A version 20 report has no health loss. It shows no loss.
{
  const heroResult = { heroId: 'hero-1', damageDealt: 5, damageTaken: 1, healingDone: 0, monstersDefeated: 1, experienceGained: 7, reachedLevel: null, levelAfter: 3, experienceAfter: 12 };
  const versionTwentySave = JSON.stringify({ saveVersion: 20, company: [{ id: 'hero-1', classId: 'warrior', level: 3, experience: 12, equipment: {} }], backpack: [], jobs: [], reports: [{ runNumber: 1, dungeonId: 'rat-cellar', firstClear: false, result: { won: true, heroes: [heroResult] } }] });
  const migratedReport = parseGameState(versionTwentySave)?.reports[0]?.result.heroes[0];
  assert.ok(migratedReport?.healthLost === 0 && migratedReport.maxHealth === 1, 'a version 20 report gets no health loss');
}

// A version 22 report has no starting health. The bar starts from full health, as it did before.
{
  const heroResult = { heroId: 'hero-1', damageDealt: 5, damageTaken: 1, healingDone: 0, monstersDefeated: 1, experienceGained: 7, reachedLevel: null, levelAfter: 3, experienceAfter: 12, healthLost: 4, maxHealth: 20 };
  const versionTwentyTwoSave = JSON.stringify({ saveVersion: 22, company: [{ id: 'hero-1', classId: 'warrior', level: 3, experience: 12, equipment: {} }], backpack: [], jobs: [], reports: [{ runNumber: 1, dungeonId: 'rat-cellar', firstClear: false, result: { won: true, heroes: [heroResult] } }] });
  const migratedReport = parseGameState(versionTwentyTwoSave)?.reports[0]?.result.heroes[0];
  assert.ok(migratedReport?.healthBefore === 20, 'a version 22 report starts its health bar from full health');
}

// A version 23 report has no starting level. It shows no level-up growth, and a new level-up gives its growth from the class numbers.
{
  const heroResult = { heroId: 'hero-1', damageDealt: 5, damageTaken: 1, healingDone: 0, monstersDefeated: 1, experienceGained: 7, reachedLevel: 3, levelAfter: 3, experienceAfter: 12, healthBefore: 20, healthLost: 4, maxHealth: 20 };
  const versionTwentyThreeSave = JSON.stringify({ saveVersion: 23, company: [{ id: 'hero-1', classId: 'warrior', level: 3, experience: 12, equipment: {} }], backpack: [], jobs: [], reports: [{ runNumber: 1, dungeonId: 'rat-cellar', firstClear: false, result: { won: true, heroes: [heroResult] } }] });
  assert.ok(parseGameState(versionTwentyThreeSave)?.reports[0]?.result.heroes[0]?.levelBefore === 3, 'a version 23 report has no level-up growth');
  const gains = levelUpGains('warrior', 2, 3);
  assert.ok(gains.stats.hp > 0 && gains.stats.strength >= 0, 'a level-up gives health');
  assert.deepEqual(levelUpGains('warrior', 3, 3).stats, { hp: 0, strength: 0, agility: 0, intelligence: 0, defence: 0, resistance: 0 }, 'no level-up gives no growth');
}

// A level 1 monster always drops each of its basic materials, 1 most of the time and 2 less often. It never drops none.
{
  const basicMaterialsOf: Record<string, string[]> = { 'cave-rat': ['rawhide', 'copper-ore'], 'straw-scarecrow': ['linen', 'pine-wood'] };
  for (const [monsterId, materialIds] of Object.entries(basicMaterialsOf)) {
    const quantitiesOf = (materialId: string): number[] => Array.from({ length: 200 }, (_, seed) => rollMonsterLoot(monsterId, createRandom(seed)).materials.filter((stack) => stack.materialId === materialId).reduce((sum, stack) => sum + stack.quantity, 0));
    for (const materialId of materialIds) {
      const quantities = quantitiesOf(materialId);
      assert.ok(quantities.every((quantity) => quantity === 1 || quantity === 2), `${monsterId} always drops 1 or 2 ${materialId}`);
      assert.ok(quantities.filter((quantity) => quantity === 2).length < quantities.length / 2, `${monsterId} drops 2 ${materialId} less often than 1`);
    }
  }
}

// Crafter experience follows the main material count: the same recipe level with twice the material pays twice the experience.
{
  const sword = findRecipe('sword', 1);
  const axe = findRecipe('axe', 1);
  assert.ok(sword && axe, 'the sword and the axe have a tier 1 recipe');
  const perMaterialOf = (recipe: NonNullable<typeof sword>): number => craftingExperienceForCraft(recipe, recipe.requiredCraftLevel) / recipe.ingredients[0]!.quantity;
  assert.ok(Math.abs(perMaterialOf(sword) - perMaterialOf({ ...sword, ingredients: [{ ...sword.ingredients[0]!, quantity: sword.ingredients[0]!.quantity * 2 }] })) < 1, 'crafter experience for each main material does not depend on the material count');
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
  assert.ok(countAtLeast(0, 1) < rollCount * 0.2, 'most crafts at the recipe level have no upgrade');
  assert.ok(countAtLeast(60, 1) > countAtLeast(0, 1), 'a far higher crafter gets more upgrades');
  assert.ok(countAtLeast(60, 3) < countAtLeast(60, 1), '+3 is rarer than +1');
  assert.ok(countAtLeast(100, 8) === 0, 'no upgrade passes +7');
  const upgraded = generateCraftedItem({ itemId: 'up', baseId: 'sword', tier: 1, setMaterialId: null, itemLevel: 1, upgradeLevel: 5, craftingCostCopper: 10, ingredientCount: 1 }, createRandom(3));
  const plain = generateCraftedItem({ itemId: 'plain', baseId: 'sword', tier: 1, setMaterialId: null, itemLevel: 1, upgradeLevel: 0, craftingCostCopper: 10, ingredientCount: 1 }, createRandom(3));
  assert.ok((upgraded.baseStats.physicalDamage ?? 0) > (plain.baseStats.physicalDamage ?? 0), 'an upgrade level raises base stats');
  assert.equal(upgraded.itemLevel, plain.itemLevel, 'an upgrade level does not change the item level');
}

// The name of an upgraded item always ends with its level, from +1 to +7.
for (let level = 1; level <= 7; level++) {
  const upgradedItem = generateCraftedItem({ itemId: `named-${level}`, baseId: 'sword', tier: 1, setMaterialId: null, itemLevel: 5, upgradeLevel: level, craftingCostCopper: 10, ingredientCount: 1 }, createRandom(level + 3));
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
  const lastRow = backpackRowCount(0) - 1;
  assert.deepEqual(findBackpackMoveAnchor(store.getState(), { column: bulky.column, row: bulky.row }, { column: 0, row: lastRow }), { column: 0, row: lastRow - 1 }, 'a tap on the bottom cell of a 1 by 2 entry moves its corner up');
  assert.equal(findBackpackMoveAnchor(store.getState(), { column: bulky.column, row: bulky.row }, { column: 5, row: 4 }), null, 'a tap on a taken cell has no anchor');
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
  assert.equal(rejectionKey(store, buyBankUnlockCommand('quickDispatch')), null, 'quick dispatch can be bought');
  assert.equal(rejectionKey(store, buyBankUnlockCommand('mainStatGrowth')), null, 'main stat growth can be bought');
  assert.equal(rejectionKey(store, buyBankUnlockCommand('attributeGrowth')), null, 'attribute growth can be bought');
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
  assert.equal(rejectionKey(store, collectFinishedJobsCommand(clock.nowMs)), null, 'the clock finishes the craft');
  const waitingJob = store.getState().jobs[0];
  assert.ok(waitingJob?.kind === 'craft' && waitingJob.isWaitingForCollection, 'the item waits at the crafter until the player clicks it');
  assert.equal(store.getState().crafters[waitingJob.professionId]?.experience, 0, 'the crafter gets its experience only when the player collects');
  assert.equal(rejectionKey(store, collectFinishedJobsCommand(clock.nowMs)), 'reject.nothingDue', 'the clock does not try again for a waiting item');
  assert.equal(rejectionKey(store, craftItemCommand('sword', 1, null, clock.nowMs)), 'reject.crafterBusy', 'a waiting item blocks the crafter');
  assert.equal(rejectionKey(store, collectWaitingCraftCommand(waitingJob.professionId)), 'reject.backpackFullForItem', 'collecting needs room');
  // The item may be tall, so the freed cells must make whole rows.
  store.execute((state) => ({ ...state, backpack: state.backpack.slice(0, -20) }));
  assert.equal(rejectionKey(store, collectWaitingCraftCommand(waitingJob.professionId)), null, 'the player collects the item after making room');
  assert.ok((store.getState().crafters[waitingJob.professionId]?.level ?? 1) > 1 || (store.getState().crafters[waitingJob.professionId]?.experience ?? 0) > 0, 'collecting pays the crafter experience');
  assert.equal(store.getState().jobs.length, 0, 'the crafter is free again');
  assert.ok(store.getState().backpack.some((entry) => entry.content.kind === 'item'), 'the item is in the backpack');
  assert.equal(rejectionKey(store, collectWaitingCraftCommand(waitingJob.professionId)), 'reject.nothingToCollect');
}

// Menu badges: one warning level for the backpack, and counts for fights and crafts. The warning ends when the player makes room.
{
  const store = createStore(31);
  const singleCellEntries = (count: number) => Array.from({ length: count }, (_, index) => ({ column: index % 6, row: Math.floor(index / 6), content: { kind: 'material' as const, materialId: 'copper-ore', quantity: 1 } }));
  assert.equal(isBackpackFull(store.getState()), false, 'an empty backpack has no warning');
  store.execute((state) => ({ ...state, backpackExpansions: 0, backpack: singleCellEntries(27) }));
  assert.equal(isBackpackFull(store.getState()), true, 'a nearly full backpack shows the warning');
  store.execute((state) => ({ ...state, backpack: state.backpack.slice(0, 10) }));
  assert.equal(isBackpackFull(store.getState()), false, 'making room ends the warning');
  store.execute((state) => ({ ...state, backpack: singleCellEntries(30), pendingLoot: { 'rat-cellar': [{ materialId: 'copper-ore', quantity: 5 }] } }));
  assert.equal(isBackpackFull(store.getState()), true, 'loot that does not fit shows the warning');
  store.execute((state) => ({ ...state, backpack: state.backpack.slice(0, 10) }));
  assert.equal(isBackpackFull(store.getState()), false, 'loot that fits again ends the warning without a trip to the dungeon');
  assert.deepEqual(dungeonActivityOf(store.getState()), { inProgress: 0, ready: 0 }, 'no fight and no report at the start');
  assert.deepEqual(workshopActivityOf(store.getState()), { inProgress: 0, ready: 0 }, 'no craft at the start');
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

// Item drops: the Old Wood Hollow spider drops a Common ring and the Goblin Chief an Uncommon ring. A dropped item that finds no room waits at the dungeon.
{
  const rollsOf = (monsterId: string) => Array.from({ length: 400 }, (_, seed) => rollMonsterLoot(monsterId, createRandom(seed)).items).flat();
  const spiderDrops = rollsOf('bark-spider');
  assert.ok(spiderDrops.length > 0 && spiderDrops.every((drop) => drop.baseId === 'ring' && drop.quality === 'common' && drop.itemLevel === 7), 'the level 9 dungeon drops Common rings of level 7');
  const bossDrops = rollsOf('goblin-chief');
  assert.ok(bossDrops.length > spiderDrops.length / 2 && bossDrops.every((drop) => drop.baseId === 'ring' && drop.quality === 'uncommon'), 'the boss drops Uncommon rings, more often than the spider drops Common ones');
  assert.equal(rollsOf('cave-rat').length, 0, 'a monster with no item drops gives none');

  const wanderer = createStore(11);
  const droppedRing = generateCraftedItem({ itemId: 'drop-1-0-0', baseId: 'ring', tier: 1, setMaterialId: null, itemLevel: 7, upgradeLevel: 0, craftingCostCopper: 20, ingredientCount: 1, quality: 'uncommon' }, createRandom(5));
  assert.equal(droppedRing.quality, 'uncommon', 'a dropped item keeps the quality the monster fixes');
  assert.equal(droppedRing.affixes.length, 1, 'an Uncommon item has exactly 1 affix');
  wanderer.execute((state) => ({ ...state, backpack: addMaterials([], [{ materialId: 'quartz', quantity: 100 }], backpackRowCount(0)).entries, pendingItems: { 'rat-cellar': [droppedRing] } }));
  assert.equal(rejectionKey(wanderer, startDungeonRunCommand('rat-cellar', ['nobody'], clock.nowMs)), 'reject.dungeonHasPendingLoot', 'a dungeon with a waiting item stays closed');
  assert.equal(rejectionKey(wanderer, collectDungeonLootCommand('rat-cellar')), 'reject.backpackFullForLoot', 'collecting an item needs room');
  wanderer.execute((state) => ({ ...state, backpack: state.backpack.slice(0, -2) }));
  assert.equal(rejectionKey(wanderer, collectDungeonLootCommand('rat-cellar')), null, 'a waiting item is collected when there is room');
  assert.ok(findItem(wanderer.getState().backpack, droppedRing.id), 'the dropped ring is in the backpack');
  assert.equal(wanderer.getState().pendingItems['rat-cellar'], undefined, 'no item waits any more');

  const lair = DUNGEONS.find((dungeon) => dungeon.id === 'goblin-chief-lair');
  assert.equal(lair?.unlockAfter, 'goblin-camp', 'the boss dungeon opens after the Goblin Camp');
  assert.equal(lair?.minimumHeroLevel, 8, 'a level 8 hero can try the boss dungeon');

  const itemsByQuality = (['common', 'uncommon', 'magic', 'rare'] as const).map((quality) => Array.from({ length: 200 }, (_, seed) => generateCraftedItem({ itemId: `q-${quality}-${seed}`, baseId: 'sword', tier: 1, setMaterialId: null, itemLevel: 1, upgradeLevel: 0, craftingCostCopper: 10, ingredientCount: 2, quality }, createRandom(seed))));
  const [commonItems, uncommonItems, magicItems, rareItems] = itemsByQuality;
  assert.ok(commonItems?.every((item) => item.affixes.length === 0), 'a Common item has no affix');
  assert.ok(uncommonItems?.every((item) => item.affixes.length === 1), 'an Uncommon item has 1 affix');
  assert.ok(magicItems?.every((item) => item.affixes.length === 2), 'a Magic item has 2 affixes');
  assert.ok(rareItems?.every((item) => item.affixes.length >= 3 && item.affixes.length <= 4), 'a Rare item has 3 or 4 affixes');
  const averageSale = (items: typeof commonItems): number => (items ?? []).reduce((total, item) => total + item.sellValueCopper, 0) / (items?.length ?? 1);
  assert.ok(averageSale(commonItems) < averageSale(uncommonItems) && averageSale(uncommonItems) < averageSale(magicItems) && averageSale(magicItems) < averageSale(rareItems), 'a better quality sells for more');
}

// A won fight in the level 9 dungeon can drop a Common ring. The ring goes to the backpack and the report lists it.
{
  let ringsFound = 0;
  for (let seed = 1; seed <= 120 && ringsFound === 0; seed++) {
    const store = createStore(seed);
    giveStarterMaterials(store);
    // A level 60 hero beats the level 9 spiders without gear, so the fight is won and loot drops.
    const strongWarrior = { ...createHero('warrior', 60, createRandom(seed)), level: 60 };
    store.execute((state) => ({ ...state, company: [strongWarrior], clearedDungeonIds: ['rat-cellar', 'scarecrow-field', 'wolf-trail', 'sunken-mill', 'goblin-camp'] }));
    assert.equal(rejectionKey(store, startDungeonRunCommand('old-wood-hollow', [strongWarrior.id], clock.nowMs)), null, 'start the level 9 dungeon');
    assert.equal(rejectionKey(store, completeRunCommand(store.getState().dungeonRuns[0]?.runNumber ?? 0, clock.nowMs)), null, 'complete the level 9 run');
    const droppedItems = store.getState().reports[0]?.result.items ?? [];
    for (const item of droppedItems) {
      ringsFound++;
      assert.ok(item.baseId === 'ring' && item.quality === 'common' && item.itemLevel === 7, 'the spider drops a Common ring of level 7');
      assert.ok(findItem(store.getState().backpack, item.id), 'the dropped ring goes to the backpack');
    }
  }
  assert.ok(ringsFound > 0, 'a ring drops in the level 9 dungeon within 120 runs');
}

// Spell prices follow the anchors of the price curve, rise with the level, and go on past the last anchor.
{
  const costAtLevel = (unlockLevel: number, isUltimate = false): number => learnCostCopper({ ...(findSpell('warrior.power-strike') as SpellDefinition), unlockLevel, isUltimate });
  const anchors = SPELL_LEARN_COST_CURVE;
  for (const anchor of anchors) assert.equal(costAtLevel(anchor.x), anchor.y, `the price at level ${anchor.x} is its anchor`);
  const prices = [2, 4, 6, 8, 10, 20, 50, 100].map((level) => costAtLevel(level));
  assert.ok(prices.every((price, index) => index === 0 || price > (prices[index - 1] as number)), 'a spell of a higher level costs more');
  assert.ok(costAtLevel(100) > costAtLevel(10) * 5, 'the curve goes on past the last anchor');
  assert.ok(Math.abs(costAtLevel(20, true) - costAtLevel(20) * ULTIMATE_LEARN_COST_FACTOR) <= ULTIMATE_LEARN_COST_FACTOR, 'an Ultimate costs the Ultimate factor times a normal spell, give or take rounding');
}

// A version 19 save has no dropped items. Its reports list none, and no item waits.
{
  const migratedNineteen = parseGameState(JSON.stringify({ ...createStore(12).getState(), saveVersion: 19, pendingItems: undefined, reports: [{ runNumber: 1, dungeonId: 'rat-cellar', firstClear: false, result: { won: true, durationSeconds: 5, monsterIds: [], materials: [], materialsWaiting: [], heroes: [] } }] }));
  assert.ok(migratedNineteen && migratedNineteen.saveVersion === CURRENT_SAVE_VERSION, 'a version 19 save migrates');
  assert.deepEqual(migratedNineteen.pendingItems, {}, 'no item waits after the migration');
  assert.deepEqual(migratedNineteen.reports[0]?.result.items, [], 'an old report lists no dropped items');
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

// An item has one fixed level, taken from its recipe. A hero of the right class can equip it at that level, and not below.
{
  for (const recipe of listRecipes(1)) {
    const base = requireById(BASE_ITEMS, recipe.baseId);
    const item = generateCraftedItem({ itemId: 'item-1', baseId: base.id, tier: 1, setMaterialId: recipe.setMaterialId, itemLevel: recipe.itemLevel, upgradeLevel: 0, craftingCostCopper: 10, ingredientCount: 1 }, createRandom(5));
    assert.equal(item.itemLevel, Math.min(recipe.requiredCraftLevel, 10), `${base.id} has the level of its recipe`);
    for (const classId of classIdsThatCanUse(base)) {
      const heroAtItemLevel = { ...createHero(classId, 1, createRandom(3)), level: item.itemLevel };
      assert.equal(findEquipProblem(heroAtItemLevel, item), null, `a level ${item.itemLevel} ${classId} can equip ${base.id}`);
      if (item.itemLevel > 1) assert.notEqual(findEquipProblem({ ...heroAtItemLevel, level: item.itemLevel - 1 }, item), null, `a ${classId} below level ${item.itemLevel} cannot equip ${base.id}`);
    }
  }
  for (const heroClass of CLASSES) {
    const levelOneBases = BASE_ITEMS.filter((base) => classIdsThatCanUse(base).includes(heroClass.id) && findRecipe(base.id, 1)?.itemLevel === 1);
    assert.ok(levelOneBases.some((base) => base.slot === 'mainHand'), `${heroClass.id} has a level 1 weapon`);
    assert.ok(levelOneBases.some((base) => base.slot === 'armour' || base.slot === 'boots'), `${heroClass.id} has level 1 armour`);
  }
}

// Repeat sends the same heroes into the same dungeon, and the report counts as read.
{
  const store = createStore(31);
  const nowMs = 5_000_000;
  assert.equal(rejectionKey(store, hireHeroCommand('warrior')), null);
  const hero = store.getState().company[0]!;
  const healHero = (): void => { store.execute((state) => ({ ...state, company: state.company.map((member) => ({ ...member, healthFraction: 1, healthAsOfMs: nowMs, downedUntilMs: null })) })); };
  assert.equal(rejectionKey(store, startDungeonRunCommand('rat-cellar', [hero.id], nowMs)), null);
  assert.equal(rejectionKey(store, completeRunCommand(store.getState().dungeonRuns[0]!.runNumber, nowMs)), null);
  const firstReport = store.getState().reports[0]!;
  healHero();
  assert.equal(rejectionKey(store, repeatDungeonRunCommand(firstReport.runNumber, nowMs)), null, 'repeat starts the dungeon again');
  assert.equal(store.getState().reports.length, 0, 'repeat marks the report as read');
  assert.deepEqual(store.getState().dungeonRuns.map((run) => [run.dungeonId, ...run.heroIds]), [['rat-cellar', hero.id]], 'the same hero goes into the same dungeon');
  assert.equal(rejectionKey(store, repeatDungeonRunCommand(firstReport.runNumber, nowMs)), 'reject.reportMissing', 'a closed report cannot repeat');

  assert.equal(rejectionKey(store, completeRunCommand(store.getState().dungeonRuns[0]!.runNumber, nowMs)), null);
  const secondReport = store.getState().reports[0]!;
  store.execute((state) => ({ ...state, pendingLoot: { ...state.pendingLoot, 'rat-cellar': [{ materialId: 'rawhide', quantity: 1 }] } }));
  healHero();
  assert.equal(rejectionKey(store, repeatDungeonRunCommand(secondReport.runNumber, nowMs)), 'reject.dungeonHasPendingLoot', 'loot that waits blocks the repeat');
  assert.equal(store.getState().reports.length, 1, 'a rejected repeat keeps the report');
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

// The Mill holds 1 material at first. A full Mill stops its clock. A collect starts it again.
// The Bank sells more storage and a shorter production time.
{
  const store = createStore(11);
  const baseIntervalMs = millSettingsOf(store.getState()).productionIntervalSeconds * 1000;
  const startMs = clock.nowMs;
  const storedCount = () => store.getState().mill.storedMaterials.reduce((total, stack) => total + stack.quantity, 0);
  assert.equal(describeMill(store.getState()).capacity, MILL_BASE_STORAGE_CAPACITY, 'a new Mill holds the base capacity');
  assert.equal(rejectionKey(store, produceMillMaterialsCommand(startMs)), null, 'the first clock check starts the Mill');
  assert.equal(rejectionKey(store, produceMillMaterialsCommand(startMs + baseIntervalMs - 1)), 'reject.nothingDue', 'nothing is made before the interval ends');
  assert.equal(rejectionKey(store, produceMillMaterialsCommand(startMs + 5 * baseIntervalMs)), null, 'the Mill makes a material, also while the page was closed');
  assert.equal(storedCount(), MILL_BASE_STORAGE_CAPACITY, 'the Mill stops at its capacity');
  assert.ok(store.getState().mill.storedMaterials.every((stack) => MILL_PRODUCED_MATERIAL_IDS.includes(stack.materialId)), 'the Mill makes only basic materials');
  assert.equal(store.getState().mill.productionClockStartedAtMs, null, 'a full Mill stops its clock');
  assert.equal(rejectionKey(store, produceMillMaterialsCommand(startMs + 200 * baseIntervalMs)), 'reject.nothingDue', 'a full Mill makes nothing');
  store.execute((state) => ({ ...state, backpack: addMaterials([], [{ materialId: 'quartz', quantity: 100 }], backpackRowCount(0)).entries }));
  assert.equal(rejectionKey(store, collectMillMaterialsCommand()), 'reject.backpackFullForLoot', 'collecting needs room');
  store.execute((state) => ({ ...state, backpack: [] }));
  assert.equal(rejectionKey(store, collectMillMaterialsCommand()), null);
  assert.equal(storedCount(), 0, 'the Mill is empty after a collect');
  assert.equal(store.getState().backpack.length, MILL_BASE_STORAGE_CAPACITY, 'the material is in the backpack');
  assert.equal(rejectionKey(store, collectMillMaterialsCommand()), 'reject.nothingToCollect');
  assert.equal(rejectionKey(store, produceMillMaterialsCommand(startMs + 300 * baseIntervalMs)), null, 'the Mill starts again after a collect');

  assert.equal(rejectionKey(store, buyStorageUpgradeCommand('millCapacity')), 'reject.notEnoughMoney', 'a Mill upgrade costs money');
  store.execute((state) => ({ ...state, copper: 10_000_000 }));
  const copperBeforeUpgrade = store.getState().copper;
  assert.equal(rejectionKey(store, buyStorageUpgradeCommand('millCapacity')), null);
  assert.equal(copperBeforeUpgrade - store.getState().copper, MILL_STORAGE_CAPACITY_UPGRADE_COSTS_COPPER[0], 'the upgrade costs the table price');
  assert.equal(describeMill(store.getState()).capacity, MILL_BASE_STORAGE_CAPACITY + 1, 'a capacity upgrade adds one place');
  assert.equal(rejectionKey(store, produceMillMaterialsCommand(startMs + 300 * baseIntervalMs + 2 * baseIntervalMs)), null, 'a bigger Mill makes material again');
  assert.equal(storedCount(), MILL_BASE_STORAGE_CAPACITY + 1, 'the Mill fills its new place');
  for (let bought = 0; bought < 100; bought++) store.execute(buyStorageUpgradeCommand('millCapacity'));
  assert.equal(rejectionKey(store, buyStorageUpgradeCommand('millCapacity')), 'reject.upgradeSoldOut', 'the Mill storage upgrades end');
  assert.equal(describeMill(store.getState()).capacity, MILL_BASE_STORAGE_CAPACITY + MILL_STORAGE_CAPACITY_UPGRADE_COSTS_COPPER.length);

  assert.equal(rejectionKey(store, buyStorageUpgradeCommand('millSpeed')), null);
  assert.equal(millSettingsOf(store.getState()).productionIntervalSeconds, MILL_PRODUCTION_INTERVAL_SECONDS_BY_SPEED_UPGRADE[1], 'a speed upgrade shortens the interval');
  for (let bought = 0; bought < 100; bought++) store.execute(buyStorageUpgradeCommand('millSpeed'));
  assert.equal(rejectionKey(store, buyStorageUpgradeCommand('millSpeed')), 'reject.upgradeSoldOut', 'the Mill speed upgrades end');
  assert.equal(millSettingsOf(store.getState()).productionIntervalSeconds, MILL_PRODUCTION_INTERVAL_SECONDS_BY_SPEED_UPGRADE.at(-1), 'the last speed upgrade gives the shortest interval');

  const migratedMill = parseGameState(JSON.stringify({ saveVersion: 17, company: [], backpack: [] }));
  assert.deepEqual(migratedMill?.mill.storedMaterials, [], 'a version 17 save gets an empty Mill');
  assert.equal(migratedMill?.millCapacityUpgrades, 0, 'a saved game owns no Mill upgrade');
  assert.equal(migratedMill?.millSpeedUpgrades, 0);
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

// The flat combat model: a hit minus armour never does less than 1, a spell hit can crit, attack time follows Agility, and the pools are fixed.
{
  const warriorAtLevel = (level: number): Hero => ({ ...createHero('warrior', 1, createRandom(3)), level });
  assert.equal(computeHeroSheet(warriorAtLevel(1)).health, 593, 'a level 1 Warrior has the baseline HP (213 + 26 Strength x 14.6)');
  assert.equal(computeHeroSheet(warriorAtLevel(5)).health, 724, 'a level 5 Warrior has the baseline HP');
  assert.equal(computeHeroSheet(warriorAtLevel(10)).armour, 5, 'no level gives Defence');
  assert.ok(!('skill' in computeHeroSheet(warriorAtLevel(1))), 'the Skill stat is gone');
  assert.equal(heroToBattleUnit(warriorAtLevel(1)).maxResource, heroToBattleUnit(warriorAtLevel(10)).maxResource, 'a resource pool does not grow with the level');
  assert.ok(SPELLS.every((spell) => spell.castSeconds >= 0), 'every spell has a cast time (0 is instant)');

  const monsterAt = (monsterId: string, level: number): BattleUnit => createMonsterUnit(monsterId, level, 'curve-check');
  const caveRatStatFactor = requireById(MONSTERS, 'cave-rat').statFactor ?? 1;
  const lastAnchorHp = monsterStatsAtLevel(10).hp;
  const lastSegmentHpPerLevel = lastAnchorHp - monsterStatsAtLevel(9).hp;
  assert.deepEqual([monsterAt('cave-rat', 1).maxHp, monsterAt('cave-rat', 1).attack, monsterAt('cave-rat', 10).maxHp, monsterAt('cave-rat', 10).attack], [Math.round(monsterStatsAtLevel(1).hp * caveRatStatFactor), Math.round(monsterStatsAtLevel(1).damage * caveRatStatFactor), Math.round(lastAnchorHp * caveRatStatFactor), Math.round(monsterStatsAtLevel(10).damage * caveRatStatFactor)], 'a normal monster follows the level anchors');
  assert.equal(monsterAt('cave-rat', 15).maxHp, Math.round((lastAnchorHp + 5 * lastSegmentHpPerLevel) * caveRatStatFactor), 'the last segment of the monster curve goes on above the last anchor');
  assert.equal(monsterAt('alpha-wolf', 5).maxHp, Math.round(monsterStatsAtLevel(5).hp * (requireById(MONSTERS, 'alpha-wolf').statFactor ?? 1)), 'a rare monster lifts its stats by its stat factor');
  const bossFlatStats = requireById(MONSTERS, 'goblin-chief').flatStats;
  assert.ok(bossFlatStats && requireById(MONSTERS, 'goblin-chief').statFactor === undefined, 'the boss has flat stats and no stat factor');
  const bossUnit = monsterAt('goblin-chief', 10);
  assert.deepEqual([bossUnit.maxHp, bossUnit.attack, bossUnit.defence, bossUnit.resistance, bossUnit.baseAttackSeconds], [bossFlatStats?.hp, bossFlatStats?.damage, bossFlatStats?.armour, bossFlatStats?.resistance, bossFlatStats?.attackSeconds], 'the boss unit takes its flat numbers');
  assert.equal(monsterAt('goblin-chief', 3).maxHp, bossUnit.maxHp, 'the level of the dungeon does not change the flat boss numbers');

  const warriorUnit = heroToBattleUnit(warriorAtLevel(1));
  const armouredHero = { ...warriorUnit, defence: 100_000, maxHp: 1_000_000, hp: 1_000_000 };
  const weakMonster = { ...createMonsterUnit('cave-rat', 1, 'floor-check'), attack: 1 };
  const floorFight = simulateRealtimeBattle([armouredHero, weakMonster], createRandom(5).fork('battle'));
  const hitsOnArmouredHero = floorFight.events.filter((event) => event.targetId === armouredHero.id && event.kind === 'attack' && !event.isCritical);
  assert.ok(hitsOnArmouredHero.length > 5 && hitsOnArmouredHero.every((event) => event.amount === 1), 'a hit that armour cancels still does 1 damage');

  const steadyUnit: BattleUnit = { ...warriorUnit, damageVarianceFraction: 0, critChance: 0.5, maxHp: 1_000_000, hp: 1_000_000, maxResource: 1000, resource: 1000 };
  const rapidSpell: BattleSpell = { id: 'test.rapid-strike', isUltimate: false, cooldownSeconds: 0.1, castSeconds: 0, resourceCost: 0, effect: { kind: 'damage', damageKind: 'physical', target: 'enemy', hits: 1, power: 1 } };
  const target = { ...createMonsterUnit('cave-rat', 1, 'crit-check'), defence: 0, attack: 0, maxHp: 1_000_000, hp: 1_000_000 };
  const spellHits = simulateRealtimeBattle([{ ...steadyUnit, spells: [rapidSpell] }, target], createRandom(7).fork('battle')).events.filter((event) => event.spellId === rapidSpell.id).slice(0, 60);
  const criticalSpellHit = spellHits.find((event) => event.isCritical);
  const plainSpellHit = spellHits.find((event) => !event.isCritical);
  assert.ok(criticalSpellHit && plainSpellHit, 'a spell hit can crit, and rolls on its own');
  assert.equal(criticalSpellHit.amount, plainSpellHit.amount * 2, 'a critical hit does 200% of the damage');

  const baseAttackSeconds = warriorUnit.baseAttackSeconds;
  const sheetAttackSeconds = computeHeroSheet(warriorAtLevel(1)).attackSeconds;
  assert.equal(sheetAttackSeconds, Math.round(baseAttackSeconds / (1 + 18 * 0.003) * 100) / 100, 'attack time is the base time divided by 1 + Agility x 0.3%');
  const agileSheet = computeHeroSheet({ ...warriorAtLevel(1), level: 10 });
  assert.ok(agileSheet.attackSeconds < sheetAttackSeconds, 'more Agility shortens the attack time');
  const attacksWithin = (unit: BattleUnit): number => simulateRealtimeBattle([{ ...unit, spells: [], maxHp: 1_000_000, hp: 1_000_000 }, { ...target, hp: 1_000_000 }], createRandom(9).fork('battle')).events.filter((event) => event.actorId === unit.id && event.timeSeconds <= 30).length;
  assert.ok(attacksWithin({ ...steadyUnit, attackSpeedBonus: 0.5 }) > attacksWithin({ ...steadyUnit, attackSpeedBonus: 0 }), 'a faster unit attacks more often');
  const crawlingFight = simulateRealtimeBattle([{ ...steadyUnit, attackSpeedBonus: -5 }, { ...weakMonster, maxHp: 30, hp: 30 }], createRandom(9).fork('battle'));
  assert.equal(crawlingFight.winner, 'party', 'a pool below zero is held at the minimum factor, so the unit still attacks');
}

// A version 24 save has Skill, Magic and Speed on items and old-scale numbers. The migration renames the stats and recomputes flat values.
{
  const oldItem = { ...generateSwordForMigration(), baseStats: { physicalDamage: 2, skill: 1, speed: 1 }, affixes: [
    { affixId: 'of-precision', kind: 'suffix', displayName: 'of Precision', stat: 'skill', value: 2 },
    { affixId: 'of-the-bear', kind: 'suffix', displayName: 'of the Bear', stat: 'hp', value: 6 },
    { affixId: 'of-haste', kind: 'suffix', displayName: 'of Haste', stat: 'speed', value: 2 },
    { affixId: 'arcane', kind: 'prefix', displayName: 'Arcane', stat: 'magic', value: 3 },
  ] };
  const versionTwentyFourSave = JSON.stringify({ ...createStore(1).getState(), saveVersion: 24, backpack: [{ column: 0, row: 0, content: { kind: 'item', item: oldItem } }] });
  const migratedTwentyFour = parseGameState(versionTwentyFourSave);
  const migratedContent = migratedTwentyFour?.backpack[0]?.content;
  assert.ok(migratedTwentyFour && migratedTwentyFour.saveVersion === CURRENT_SAVE_VERSION && migratedContent?.kind === 'item', 'a version 24 save migrates');
  const migratedItem = migratedContent.item;
  assert.deepEqual(migratedItem.affixes.map((affix) => [affix.stat, affix.value]), [['agility', 2], ['hp', 60], ['attackSpeed', 2], ['intelligence', 3]], 'affixes get the new stat names and the new HP scale');
  assert.ok(!('skill' in migratedItem.baseStats) && !('speed' in migratedItem.baseStats) && (migratedItem.baseStats.physicalDamage ?? 0) >= 7, 'base stats get the new names and the flat damage scale');
}

// A version 25 save has items with the old item level plus upgrade level stats, and the crafter of the old Woodworking profession.
{
  const oldUpgradedSword = { ...generateSwordForMigration(), itemLevel: 3, upgradeLevel: 2, baseStats: { physicalDamage: 14.5, agility: 1 } };
  const oldRing = { ...generateSwordForMigration(), id: 'old-ring', baseId: 'ring', slot: 'ring', gearType: 'accessory', itemLevel: 7, upgradeLevel: 0, baseStats: { agility: 2, hp: 20 } };
  const state = createStore(1).getState();
  const versionTwentyFiveSave = JSON.stringify({
    ...state,
    saveVersion: 25,
    crafters: { ...state.crafters, woodworking: { level: 4, experience: 10 } },
    backpack: [{ column: 0, row: 0, content: { kind: 'item', item: oldUpgradedSword } }, { column: 1, row: 0, content: { kind: 'item', item: oldRing } }],
  });
  const migratedTwentyFive = parseGameState(versionTwentyFiveSave);
  assert.ok(migratedTwentyFive && migratedTwentyFive.saveVersion === CURRENT_SAVE_VERSION, 'a version 25 save migrates');
  const [swordEntry, ringEntry] = migratedTwentyFive?.backpack.map((entry) => entry.content) ?? [];
  assert.ok(swordEntry?.kind === 'item' && ringEntry?.kind === 'item', 'the items stay in the backpack');
  if (swordEntry?.kind === 'item' && ringEntry?.kind === 'item') {
    const sword = BASE_ITEMS.find((base) => base.id === 'sword')!;
    assert.equal(swordEntry.item.baseStats.physicalDamage, Math.round((sword.baseStats.physicalDamage ?? 0) + (sword.growthPerItemLevel?.physicalDamage ?? 0) * 2) + 2, 'an upgrade level adds a flat +1 to the main stat, and the base comes from the current base item');
    assert.ok(!('agility' in swordEntry.item.baseStats), 'the sword no longer gives Agility');
    assert.deepEqual(ringEntry.item.baseStats, { criticalChance: 2 }, 'a ring gets its new base stats');
  }
  assert.equal(migratedTwentyFive?.crafters.enchanting?.level, 4, 'the Woodworking crafter level moves to Enchanting');
  assert.ok(!('woodworking' in (migratedTwentyFive?.crafters ?? {})), 'no Woodworking crafter stays');
}

checkRealtimeBattleWiring();
checkBootsMovementSpeed();
checkManaRegenFromIntelligence();
checkMonsterAttackTimes();

const firstSummary = playSession(12345);
const secondSummary = playSession(12345);
assert.equal(firstSummary, secondSummary, 'the same seed must give the same session');
console.log('Smoke play OK');
