import monstersData from '../../data/monsters.json';
import type { MonsterRank, TargetPriority } from '../model/battle';

export interface DropEntry {
  materialId: string;
  chance: number;
  minQuantity: number;
  maxQuantity: number;
}

// A monster can drop a ready item. The quality is fixed here: the item rolls its affixes from it.
export interface ItemDropEntry {
  baseId: string;
  quality: 'common' | 'uncommon' | 'magic' | 'rare';
  itemLevel: number;
  chance: number;
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
  targetPriority?: TargetPriority;
  // The share of the Defence of a hero that the monster ignores (0.4 ignores 40%). Resistance is not cut.
  armourPenetration?: number;
  // Spells that the monster casts in battle. They cost no resource and only wait for their cooldown.
  spellIds?: readonly string[];
  drops: readonly DropEntry[];
  itemDrops?: readonly ItemDropEntry[];
}

export const MONSTERS = monstersData as unknown as readonly MonsterDefinition[];
