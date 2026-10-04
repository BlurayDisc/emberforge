import { BANK_UNLOCK_COSTS_COPPER } from '../../content/balance/economy';
import { CRAFTING_MAXIMUM_LEVEL } from '../../content/balance/crafting';
import { PROFESSION_IDS } from '../../content/baseItems';
import { DUNGEONS } from '../../content/dungeons';
import { TOWNS } from '../../content/towns';
import type { BankUnlockId } from '../../model/bankUnlock';
import type { CrafterProgress, DungeonRun, GameState } from '../../model/gameState';
import type { Hero } from '../../model/hero';
import type { MaterialStack } from '../../model/material';
import { readEach, readList, readNumber, readRecord, readTexts, readWholeNumber, type SalvageTally, type UnknownRecord } from './salvage/lenientReaders';
import { salvageBackpack, salvageMaterialStack } from './salvage/salvageBackpack';
import { salvageHero } from './salvage/salvageHero';
import { salvageJob } from './salvage/salvageJobs';
import { salvageReport, salvageRun } from './salvage/salvageRuns';
import { CURRENT_SAVE_VERSION } from './saveFormat';

const MAXIMUM_NUMBER = Number.MAX_SAFE_INTEGER;

export interface SalvagedGameState {
  state: GameState;
  droppedCount: number;
}

function salvageCompany(value: unknown, tally: SalvageTally): Hero[] {
  const heroes = readList(value).flatMap((entry, position) => {
    const hero = salvageHero(entry, position, tally);
    return hero ? [hero] : [];
  });
  const uniqueHeroes = heroes.filter((hero, position) => heroes.findIndex((other) => other.id === hero.id) === position);
  tally.droppedCount += readList(value).length - uniqueHeroes.length;
  return uniqueHeroes;
}

// A dungeon hosts one run and a hero is in one run. Later runs that break this rule are dropped.
function salvageRuns(value: unknown, company: readonly Hero[], tally: SalvageTally): DungeonRun[] {
  const freeHeroIds = new Set(company.map((hero) => hero.id));
  const usedDungeonIds = new Set<string>();
  return readEach(value, (entry) => {
    const run = salvageRun(entry, freeHeroIds);
    if (!run || usedDungeonIds.has(run.dungeonId)) return null;
    usedDungeonIds.add(run.dungeonId);
    run.heroIds.forEach((heroId) => freeHeroIds.delete(heroId));
    return run;
  }, tally);
}

function salvageCrafters(value: unknown, freshCrafters: GameState['crafters']): Record<string, CrafterProgress> {
  const record = readRecord(value) ?? {};
  return Object.fromEntries(PROFESSION_IDS.map((professionId) => {
    const saved = readRecord(record[professionId]);
    const fresh = freshCrafters[professionId] ?? { level: 1, experience: 0 };
    return [professionId, { level: readWholeNumber(saved?.level, 1, CRAFTING_MAXIMUM_LEVEL, fresh.level), experience: readNumber(saved?.experience, 0, MAXIMUM_NUMBER, fresh.experience) }];
  }));
}

function salvagePendingLoot(value: unknown, tally: SalvageTally): Record<string, MaterialStack[]> {
  const record = readRecord(value) ?? {};
  return Object.fromEntries(DUNGEONS.filter((dungeon) => record[dungeon.id] !== undefined).map((dungeon) => [dungeon.id, readEach(record[dungeon.id], salvageMaterialStack, tally)]));
}

function salvageMill(value: unknown, freshMill: GameState['mill'], tally: SalvageTally): GameState['mill'] {
  const record: UnknownRecord = readRecord(value) ?? {};
  return {
    productionClockStartedAtMs: record.productionClockStartedAtMs === null ? null : readNumber(record.productionClockStartedAtMs, 0, MAXIMUM_NUMBER, 0) || freshMill.productionClockStartedAtMs,
    productionsMade: readWholeNumber(record.productionsMade, 0, MAXIMUM_NUMBER, 0),
    storedMaterials: readEach(record.storedMaterials, salvageMaterialStack, tally),
  };
}

// Reads a save part by part. A part that is wrong is left out, and the rest loads.
// The heroes (class, level, gear, spells) and the dungeon progress are the core. They come first.
// Anything that is missing comes from the fresh game state. Returns null only when the save is not an object at all.
export function salvageGameState(savedValue: unknown, freshState: GameState): SalvagedGameState | null {
  const saved = readRecord(savedValue);
  if (!saved) return null;
  const tally: SalvageTally = { droppedCount: 0 };
  const company = salvageCompany(saved.company, tally);
  const backpackExpansions = readWholeNumber(saved.backpackExpansions, 0, MAXIMUM_NUMBER, 0);
  const jobs = readEach(saved.jobs, (entry) => salvageJob(entry, tally), tally);
  const state: GameState = {
    saveVersion: CURRENT_SAVE_VERSION,
    seed: readWholeNumber(saved.seed, 0, 0xffffffff, freshState.seed),
    townId: TOWNS.find((town) => town.id === saved.townId)?.id ?? freshState.townId,
    copper: readWholeNumber(saved.copper, 0, MAXIMUM_NUMBER, freshState.copper),
    company,
    heroesHired: Math.max(company.length, readWholeNumber(saved.heroesHired, 0, MAXIMUM_NUMBER, 0)),
    backpack: salvageBackpack(saved.backpack, backpackExpansions, tally),
    backpackExpansions,
    merchantExtraSlots: readWholeNumber(saved.merchantExtraSlots, 0, MAXIMUM_NUMBER, 0),
    bankUnlockIds: [...new Set(readTexts(saved.bankUnlockIds, (id) => id in BANK_UNLOCK_COSTS_COPPER, tally))] as BankUnlockId[],
    itemsCrafted: readWholeNumber(saved.itemsCrafted, 0, MAXIMUM_NUMBER, 0),
    runsStarted: readWholeNumber(saved.runsStarted, 0, MAXIMUM_NUMBER, 0),
    dungeonRuns: salvageRuns(saved.dungeonRuns, company, tally),
    reports: readEach(saved.reports, (entry) => salvageReport(entry, tally), tally),
    clearedDungeonIds: [...new Set(readTexts(saved.clearedDungeonIds, (id) => DUNGEONS.some((dungeon) => dungeon.id === id), tally))],
    crafters: salvageCrafters(saved.crafters, freshState.crafters),
    jobs,
    jobsStarted: Math.max(jobs.reduce((next, job) => Math.max(next, job.id + 1), 0), readWholeNumber(saved.jobsStarted, 0, MAXIMUM_NUMBER, 0)),
    pendingLoot: salvagePendingLoot(saved.pendingLoot, tally),
    mill: salvageMill(saved.mill, freshState.mill, tally),
  };
  return { state, droppedCount: tally.droppedCount };
}
