import dungeonsData from '../../data/dungeons.json';
export interface DungeonDefinition {
  id: string;
  name: string;
  townId: string;
  level: number;
  monsterIds: readonly string[];
  rareMonsterId: string | null;
  bossMonsterId: string | null;
  // A boss needs a party. At least one hero must reach minimumHeroLevel, so a weaker partner can join.
  minimumPartySize: number;
  maxPartySize: number;
  // A hero below this level cannot enter. The recommended range ends at recommendedMaxLevel.
  minimumHeroLevel: number;
  recommendedMaxLevel: number;
  unlockAfter: string | null;
  // Drops of the dungeon itself, on top of the monster drops. Each entry rolls once for each won fight.
  bonusDrops: readonly DungeonBonusDrop[];
}

// One of the materials, picked with the same chance for each, in this quantity.
export interface DungeonBonusDrop {
  materialIds: readonly string[];
  chance: number;
  quantity: number;
}

export const DUNGEONS = dungeonsData as unknown as readonly DungeonDefinition[];

