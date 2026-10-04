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
}

export const DUNGEONS = dungeonsData as unknown as readonly DungeonDefinition[];
