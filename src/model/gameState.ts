import type { BackpackEntry } from './backpack';
import type { Hero } from './hero';
import type { TimedJob } from './timedJob';
import type { MaterialStack } from './material';

export interface HeroEncounterResult {
  heroId: string;
  damageDealt: number;
  damageTaken: number;
  healingDone: number;
  monstersDefeated: number;
  experienceGained: number;
  reachedLevel: number | null;
}

export interface EncounterResult {
  won: boolean;
  durationSeconds: number;
  monsterIds: string[];
  copperGained: number;
  materials: MaterialStack[];
  materialsLost: MaterialStack[];
  heroes: HeroEncounterResult[];
}

// A run is one fight in one dungeon. It ends when the fight ends and leaves a report.
export interface DungeonRun {
  runNumber: number;
  dungeonId: string;
  heroIds: string[];
}

// The notice of a finished run. It stays in state until the player reads it.
export interface RunReport {
  runNumber: number;
  dungeonId: string;
  result: EncounterResult;
  firstClear: boolean;
}

export interface CrafterProgress {
  level: number;
  experience: number;
}

export interface GameState {
  saveVersion: number;
  seed: number;
  townId: string;
  copper: number;
  company: Hero[];
  heroesHired: number;
  backpack: BackpackEntry[];
  // Bought upgrades at the Bank: more backpack rows, and more sale slots at the merchant.
  backpackExpansions: number;
  merchantExtraSlots: number;
  itemsCrafted: number;
  runsStarted: number;
  dungeonRuns: DungeonRun[];
  reports: RunReport[];
  clearedDungeonIds: string[];
  crafters: Record<string, CrafterProgress>;
  jobs: TimedJob[];
  jobsStarted: number;
}
