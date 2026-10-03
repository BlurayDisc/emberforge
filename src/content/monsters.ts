import monstersData from '../../data/monsters.json';
import type { MonsterRank } from '../model/battle';

export interface DropEntry {
  materialId: string;
  chance: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface MonsterDefinition {
  id: string;
  name: string;
  rank: MonsterRank;
  spriteKey: string;
  hpFactor: number;
  attackFactor: number;
  defenceFactor: number;
  speed: number;
  drops: readonly DropEntry[];
}

export const MONSTERS = monstersData as unknown as readonly MonsterDefinition[];
