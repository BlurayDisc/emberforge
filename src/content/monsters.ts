import monstersData from '../../data/monsters.json';
import type { MonsterRank } from '../model/battle';

export interface DropEntry {
  materialId: string;
  chance: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface MonsterFixedStats {
  hp: number;
  attack: number;
  defence: number;
  resistance: number;
}

export interface MonsterDefinition {
  id: string;
  name: string;
  rank: MonsterRank;
  spriteKey: string;
  // A normal or rare monster takes its stats from the level curve in data/balance/monster-scaling.json, times these factors.
  hpFactor?: number;
  attackFactor?: number;
  defenceFactor?: number;
  // A boss has no level curve and no factors. These are its real stats.
  fixedStats?: MonsterFixedStats;
  speed: number;
  // Spells that the monster casts in battle. They cost no resource and only wait for their cooldown.
  spellIds?: readonly string[];
  drops: readonly DropEntry[];
}

export const MONSTERS = monstersData as unknown as readonly MonsterDefinition[];
