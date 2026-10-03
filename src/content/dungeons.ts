export interface DungeonDefinition {
  id: string;
  name: string;
  townId: string;
  level: number;
  monsterIds: readonly string[];
  rareMonsterId: string | null;
  bossMonsterId: string | null;
}

export const DUNGEONS: readonly DungeonDefinition[] = [
  {
    id: 'rat-cellar',
    name: 'Rat Cellar',
    townId: 'hollowbrook',
    level: 1,
    monsterIds: ['cave-rat'],
    rareMonsterId: 'rat-king',
    bossMonsterId: null,
  },
  {
    id: 'wolf-trail',
    name: 'Wolf Trail',
    townId: 'hollowbrook',
    level: 3,
    monsterIds: ['wolf', 'cave-rat'],
    rareMonsterId: 'alpha-wolf',
    bossMonsterId: null,
  },
  {
    id: 'goblin-camp',
    name: 'Goblin Camp',
    townId: 'hollowbrook',
    level: 6,
    monsterIds: ['goblin', 'wolf'],
    rareMonsterId: 'goblin-captain',
    bossMonsterId: null,
  },
  {
    id: 'old-wood-hollow',
    name: 'Old Wood Hollow',
    townId: 'hollowbrook',
    level: 8,
    monsterIds: ['wolf', 'goblin'],
    rareMonsterId: 'alpha-wolf',
    bossMonsterId: null,
  },
  {
    id: 'goblin-chief-lair',
    name: "Goblin Chief's Lair",
    townId: 'hollowbrook',
    level: 10,
    monsterIds: ['goblin'],
    rareMonsterId: null,
    bossMonsterId: 'goblin-chief',
  },
];
