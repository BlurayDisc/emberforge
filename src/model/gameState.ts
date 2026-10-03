import type { Hero } from './hero';
import type { MaterialStack } from './material';

export type RunEndReason = 'stopped' | 'party-defeated' | 'party-weakened' | 'backpack-full';

export interface DungeonRun {
  dungeonId: string;
  runNumber: number;
  encounterNumber: number;
  status: 'active' | 'ended';
  endReason: RunEndReason | null;
  encountersWon: number;
  copperGained: number;
  materialsGained: MaterialStack[];
}

export interface GameState {
  saveVersion: number;
  seed: number;
  townId: string;
  copper: number;
  company: Hero[];
  partyHeroIds: string[];
  heroesHired: number;
  backpackMaterials: MaterialStack[];
  runsStarted: number;
  dungeonRun: DungeonRun | null;
}
