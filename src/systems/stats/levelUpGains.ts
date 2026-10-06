import { CLASSES } from '../../content/classes';
import { requireById } from '../../content/lookup';
import type { ClassId } from '../../model/hero';
import type { ResourceId } from '../../model/resource';
import type { StatBlock } from '../../model/statBlock';
import { classStatsAtLevel } from './classStatsAtLevel';
import { maximumResourceOf } from './maximumResource';

export interface LevelUpGains {
  stats: StatBlock;
  resourceId: ResourceId;
  resource: number;
}

// Gear is left out on purpose: a level-up report shows what the level gave, not what the gear gives.
export function levelUpGains(classId: ClassId, levelBefore: number, levelAfter: number): LevelUpGains {
  const before = classStatsAtLevel(classId, levelBefore);
  const after = classStatsAtLevel(classId, levelAfter);
  const { resourceId } = requireById(CLASSES, classId);
  return {
    stats: {
      hp: after.hp - before.hp,
      strength: after.strength - before.strength,
      magic: after.magic - before.magic,
      skill: after.skill - before.skill,
      speed: after.speed - before.speed,
      defence: after.defence - before.defence,
      resistance: after.resistance - before.resistance,
    },
    resourceId,
    resource: maximumResourceOf(resourceId, after, levelAfter) - maximumResourceOf(resourceId, before, levelBefore),
  };
}
