import type { BackpackEntry } from './backpack';
import type { BankUnlockId } from './bankUnlock';
import type { Hero } from './hero';
import type { Item } from './item';
import type { MillState } from './mill';
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
  // The hero's level and experience after the fight. The result card draws the experience bar from them.
  levelAfter: number;
  experienceAfter: number;
  // Health points the hero lost in the fight, and the maximum health. The result card draws the health loss bar from them.
  healthLost: number;
  maxHealth: number;
}

export interface EncounterResult {
  won: boolean;
  durationSeconds: number;
  monsterIds: string[];
  materials: MaterialStack[];
  // Drops that found no room. They wait at the dungeon (see GameState.pendingLoot).
  materialsWaiting: MaterialStack[];
  // Items that dropped (a ring from a monster, for example), and the ones that found no room.
  items: Item[];
  itemsWaiting: Item[];
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
  // Bought Bank upgrades of the Mill: more storage, and a shorter production time.
  millCapacityUpgrades: number;
  millSpeedUpgrades: number;
  // Features that the player bought at the Bank. Until then the game hides them.
  bankUnlockIds: BankUnlockId[];
  itemsCrafted: number;
  runsStarted: number;
  dungeonRuns: DungeonRun[];
  reports: RunReport[];
  clearedDungeonIds: string[];
  crafters: Record<string, CrafterProgress>;
  jobs: TimedJob[];
  jobsStarted: number;
  // Drops that did not fit in the backpack, by dungeon id. A dungeon with pending loot cannot start a run.
  pendingLoot: Record<string, MaterialStack[]>;
  // Dropped items that did not fit in the backpack, by dungeon id. They block the dungeon like pending materials do.
  pendingItems: Record<string, Item[]>;
  mill: MillState;
}
