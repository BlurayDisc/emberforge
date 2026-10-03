import {
  MAXIMUM_BOSS_ADDS,
  MAXIMUM_MONSTERS_PER_ENCOUNTER,
  RARE_MONSTER_CHANCE,
} from '../../content/balance/dungeonRun';
import type { DungeonDefinition } from '../../content/dungeons';
import type { Random } from '../../kernel/random';
import type { BattleUnit } from '../../model/battle';
import { createMonsterUnit } from './monsterUnit';

function pickMonsterIds(dungeon: DungeonDefinition, partySize: number, random: Random): string[] {
  if (dungeon.bossMonsterId !== null) {
    const addCount = random.nextInt(0, Math.min(MAXIMUM_BOSS_ADDS, partySize - 1));
    const adds = Array.from({ length: addCount }, () => random.pick(dungeon.monsterIds));
    return [dungeon.bossMonsterId, ...adds];
  }
  const monsterCount = random.nextInt(1, Math.min(MAXIMUM_MONSTERS_PER_ENCOUNTER, Math.max(1, partySize)));
  const monsterIds = Array.from({ length: monsterCount }, () => random.pick(dungeon.monsterIds));
  if (dungeon.rareMonsterId !== null && random.chance(RARE_MONSTER_CHANCE)) {
    monsterIds[0] = dungeon.rareMonsterId;
  }
  return monsterIds;
}

export function createEncounter(dungeon: DungeonDefinition, partySize: number, random: Random): BattleUnit[] {
  return pickMonsterIds(dungeon, partySize, random).map((monsterId, index) =>
    createMonsterUnit(monsterId, dungeon.level, `monster-${index}-${monsterId}`),
  );
}
