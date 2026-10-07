import assert from 'node:assert/strict';
import { createGameStore, planNextEncounter, startDungeonRunCommand } from '../src/game';
import { BASE_ITEMS } from '../src/content/baseItems';
import { MONSTERS } from '../src/content/monsters';
import { createRandom } from '../src/kernel/random';
import { createMonsterUnit } from '../src/systems/dungeons';
import { createHero } from '../src/systems/heroes';
import { generateCraftedItem } from '../src/systems/items';
import { simulateRealtimeBattle } from '../src/systems/battle';
import { computeHeroSheet, heroToBattleUnit } from '../src/systems/stats';

const RUN_START_MS = 1_000_000;
const WARRIOR_ATTACK_SECONDS = 1.65;

function plannedFirstEncounter() {
  const memory = { saved: null as string | null };
  const store = createGameStore({ read: () => memory.saved, write: (text) => { memory.saved = text; }, clear: () => { memory.saved = null; } });
  store.startNewGame();
  const hero = createHero('warrior', 1, createRandom(8));
  store.execute((state) => ({ ...state, seed: 77, company: [hero] }));
  assert.ok(store.execute(startDungeonRunCommand('rat-cellar', [hero.id], RUN_START_MS)).accepted, 'the real-time smoke run starts');
  return planNextEncounter(store.getState(), store.getState().dungeonRuns[0]!.runNumber);
}

// The real-time battle is wired into the game: the plan carries the new report, the replay data and a fight that repeats from its seed.
export function checkRealtimeBattleWiring(): void {
  const plan = plannedFirstEncounter();
  const { report } = plan;
  assert.equal(report.tracks.length, plan.partyUnits.length + plan.monsterUnits.length, 'every unit has a track');
  const expectedSamples = Math.round(report.durationSeconds / report.tickSeconds) + 1;
  assert.ok(report.tracks.every((track) => track.x.length === expectedSamples && track.state.length === expectedSamples), 'every track has one sample for each tick');
  assert.ok(report.actionEvents.some((action) => action.kind === 'attackStart'), 'the report lists the start of attacks');
  assert.equal(JSON.stringify(plannedFirstEncounter().report), JSON.stringify(report), 'the same seed gives the same real-time battle');
}

// Boots give movement speed in place of attack speed. It reaches the battle unit, the hero sheet and the speed of the fight.
export function checkBootsMovementSpeed(): void {
  const boots = generateCraftedItem({ itemId: 'smoke-boots', baseId: 'boots-medium', tier: 1, setMaterialId: null, itemLevel: 1, upgradeLevel: 0, craftingCostCopper: 10, ingredientCount: 1, quality: 'common' }, createRandom(3));
  assert.equal(boots.baseStats.movementSpeed, 5, 'boots give +5 movement speed');
  assert.ok(!('attackSpeed' in boots.baseStats), 'boots no longer give attack speed');
  const barefoot = createHero('warrior', 1, createRandom(8));
  const booted = { ...barefoot, equipment: { boots } };
  assert.equal(heroToBattleUnit(barefoot).movementSpeedBonus, 0, 'a hero without boots has no movement speed bonus');
  assert.ok(Math.abs((heroToBattleUnit(booted).movementSpeedBonus ?? 0) - 0.05) < 1e-9, 'the boots reach the battle unit');
  assert.equal(computeHeroSheet(booted).movementSpeed, 5, 'the hero sheet shows the movement speed');
  const monster = createMonsterUnit('cave-rat', 1, 'smoke-rat');
  const firstAttackSeconds = (movementSpeedBonus: number): number => {
    const report = simulateRealtimeBattle([{ ...heroToBattleUnit(barefoot), movementSpeedBonus }, { ...monster }], createRandom(5).fork('battle'));
    return report.actionEvents.find((action) => action.kind === 'attackStart')?.timeSeconds ?? Infinity;
  };
  assert.ok(firstAttackSeconds(1) < firstAttackSeconds(0), 'a faster unit reaches the first fight sooner');
}

// Every monster of the town, the boss too, attacks once in 1.0 to 2.0 seconds. The Warrior is the reference at 1.65 s.
export function checkMonsterAttackTimes(): void {
  for (const monster of MONSTERS) {
    const attackSeconds = createMonsterUnit(monster.id, 10, 'smoke-attack-time').baseAttackSeconds;
    assert.ok(attackSeconds >= 1 && attackSeconds <= 2, `${monster.id} attacks in 1.0 to 2.0 seconds`);
  }
  assert.equal(createMonsterUnit('goblin-chief', 10, 'smoke-boss').baseAttackSeconds, WARRIOR_ATTACK_SECONDS, 'the boss attacks as fast as the Warrior');
  assert.ok(BASE_ITEMS.filter((base) => base.slot === 'boots').every((base) => base.mainStat === 'defence'), 'the main stat of boots stays Defence');
}
