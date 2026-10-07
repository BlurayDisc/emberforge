import type { ClassId } from '../../model/hero';
import type { StatBlock } from '../../model/statBlock';
import { classStatsAtLevel } from './classStatsAtLevel';

export interface LevelUpGains {
  stats: StatBlock;
}

// Gear is left out on purpose: a level-up report shows what the level gave, not what the gear gives.
export function levelUpGains(classId: ClassId, levelBefore: number, levelAfter: number): LevelUpGains {
  const before = classStatsAtLevel(classId, levelBefore);
  const after = classStatsAtLevel(classId, levelAfter);
  return {
    stats: {
      hp: after.hp - before.hp,
      strength: after.strength - before.strength,
      agility: after.agility - before.agility,
      intelligence: after.intelligence - before.intelligence,
      defence: after.defence - before.defence,
      resistance: after.resistance - before.resistance,
    },
  };
}
