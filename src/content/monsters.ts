import monstersData from '../../data/monsters.json';
import type { MonsterRank, TargetPriority } from '../model/battle';

export interface DropEntry {
  materialId: string;
  chance: number;
  minQuantity: number;
  maxQuantity: number;
  // When set, the quantity is the maximum with this chance and the minimum otherwise. When missing, it is a flat roll from minimum to maximum.
  maxQuantityChance?: number;
}

// A monster can drop a ready item. The quality is fixed here: the item rolls its affixes from it.
export interface ItemDropEntry {
  baseId: string;
  quality: 'common' | 'uncommon' | 'magic' | 'rare';
  itemLevel: number;
  chance: number;
}

// A boss has explicit numbers instead of a stat factor. The validator keeps them on one common factor of the normal level curve.
export interface FlatMonsterStats {
  hp: number;
  damage: number;
  armour: number;
  resistance: number;
  attackSeconds: number;
}

export interface MonsterDefinition {
  id: string;
  name: string;
  rank: MonsterRank;
  spriteKey: string;
  // Every monster follows the level curve in data/balance/monster-scaling.json. This one factor lifts HP, damage, armour and resistance together (default 1).
  statFactor?: number;
  // Set on a boss only. The level of the dungeon does not change these numbers.
  flatStats?: FlatMonsterStats;
  // Seconds for one basic attack (a boss sets it in flatStats). The default is in data/balance/monster-scaling.json.
  attackSeconds?: number;
  targetPriority?: TargetPriority;
  // The share of the flat Defence of a hero that the monster ignores (0.4 ignores 40%). Resistance is not cut.
  armourPenetration?: number;
  // Spells that the monster casts in battle. They cost no resource and only wait for their cooldown.
  spellIds?: readonly string[];
  drops: readonly DropEntry[];
  itemDrops?: readonly ItemDropEntry[];
}

export const MONSTERS = monstersData as unknown as readonly MonsterDefinition[];
