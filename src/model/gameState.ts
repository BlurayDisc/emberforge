import type { BackpackEntry } from './backpack';
import type { Hero } from './hero';
import type { MaterialStack } from './material';

export type RunEndReason = 'stopped' | 'party-defeated' | 'party-weakened' | 'backpack-full';

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
  heroes: HeroEncounterResult[];
}

export interface DungeonRun {
  dungeonId: string;
  heroIds: string[];
  runNumber: number;
  encounterNumber: number;
  status: 'active' | 'ended';
  endReason: RunEndReason | null;
  encountersWon: number;
  copperGained: number;
  materialsGained: MaterialStack[];
  lastEncounter: EncounterResult | null;
}

export interface GameState {
  saveVersion: number;
  seed: number;
  townId: string;
  copper: number;
  company: Hero[];
  heroesHired: number;
  backpack: BackpackEntry[];
  itemsCrafted: number;
  runsStarted: number;
  dungeonRun: DungeonRun | null;
}
