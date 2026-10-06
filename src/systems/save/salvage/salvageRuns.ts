import { DUNGEONS } from '../../../content/dungeons';
import type { DungeonRun, EncounterResult, HeroEncounterResult, RunReport } from '../../../model/gameState';
import { readEach, readList, readNumber, readRecord, readText, readWholeNumber, type SalvageTally } from './lenientReaders';
import { salvageMaterialStack } from './salvageBackpack';
import { salvageItem } from './salvageItem';

const MAXIMUM_NUMBER = Number.MAX_SAFE_INTEGER;

// A run whose dungeon is gone, or whose heroes are all gone, is dropped. The heroes that are left go free.
export function salvageRun(value: unknown, heroIds: ReadonlySet<string>): DungeonRun | null {
  const record = readRecord(value);
  const dungeon = DUNGEONS.find((candidate) => candidate.id === record?.dungeonId);
  const runNumber = readWholeNumber(record?.runNumber, 0, MAXIMUM_NUMBER, -1);
  const runHeroIds = readList(record?.heroIds).filter((id): id is string => typeof id === 'string' && heroIds.has(id));
  return dungeon && runNumber >= 0 && runHeroIds.length > 0 ? { runNumber, dungeonId: dungeon.id, heroIds: runHeroIds } : null;
}

function salvageHeroResult(value: unknown): HeroEncounterResult | null {
  const record = readRecord(value);
  const heroId = readText(record?.heroId);
  if (!record || !heroId) return null;
  const count = (name: string): number => readNumber(record[name], 0, MAXIMUM_NUMBER, 0);
  return {
    heroId,
    damageDealt: count('damageDealt'),
    damageTaken: count('damageTaken'),
    healingDone: count('healingDone'),
    monstersDefeated: count('monstersDefeated'),
    experienceGained: count('experienceGained'),
    reachedLevel: record.reachedLevel === null ? null : readWholeNumber(record.reachedLevel, 1, MAXIMUM_NUMBER, 1),
    levelAfter: readWholeNumber(record.levelAfter, 1, MAXIMUM_NUMBER, 1),
    experienceAfter: count('experienceAfter'),
    healthBefore: readNumber(record.healthBefore, 0, MAXIMUM_NUMBER, 1),
    healthLost: count('healthLost'),
    maxHealth: readNumber(record.maxHealth, 1, MAXIMUM_NUMBER, 1),
  };
}

function salvageResult(value: unknown, tally: SalvageTally): EncounterResult | null {
  const record = readRecord(value);
  if (!record) return null;
  return {
    won: record.won === true,
    durationSeconds: readNumber(record.durationSeconds, 0, MAXIMUM_NUMBER, 0),
    monsterIds: readList(record.monsterIds).filter((id): id is string => typeof id === 'string'),
    materials: readEach(record.materials, salvageMaterialStack, tally),
    materialsWaiting: readEach(record.materialsWaiting, salvageMaterialStack, tally),
    items: readEach(record.items, (entry) => salvageItem(entry, tally), tally),
    itemsWaiting: readEach(record.itemsWaiting, (entry) => salvageItem(entry, tally), tally),
    heroes: readEach(record.heroes, salvageHeroResult, tally),
  };
}

// A report that cannot be read is only the notice of a fight that is already over, so it is dropped.
export function salvageReport(value: unknown, tally: SalvageTally): RunReport | null {
  const record = readRecord(value);
  const dungeon = DUNGEONS.find((candidate) => candidate.id === record?.dungeonId);
  const result = salvageResult(record?.result, tally);
  const runNumber = readWholeNumber(record?.runNumber, 0, MAXIMUM_NUMBER, -1);
  return record && dungeon && result && runNumber >= 0 ? { runNumber, dungeonId: dungeon.id, result, firstClear: record.firstClear === true } : null;
}
