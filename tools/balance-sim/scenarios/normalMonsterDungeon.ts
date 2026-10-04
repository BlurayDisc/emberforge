import type { DungeonDefinition } from '../../../src/content/dungeons';
import { dungeonForLevel } from '../economy';
import { MOB_KILL_TIME_PRESET } from './presets';

// A normal monster only: the rare monster of the dungeon is left out. The monster level follows the rule of the mob kill time preset.
export function dungeonOfNormalMonsters(heroLevel: number): DungeonDefinition {
  const dungeon = dungeonForLevel(heroLevel);
  const monsterLevel = MOB_KILL_TIME_PRESET.monsterLevelRule === 'hero-level' ? heroLevel : dungeon.level;
  return { ...dungeon, level: monsterLevel, rareMonsterId: null };
}
