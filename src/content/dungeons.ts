import dungeonsData from '../../data/dungeons.json';
export interface DungeonDefinition {
  id: string;
  name: string;
  townId: string;
  level: number;
  monsterIds: readonly string[];
  rareMonsterId: string | null;
  bossMonsterId: string | null;
}

export const DUNGEONS = dungeonsData as unknown as readonly DungeonDefinition[];
