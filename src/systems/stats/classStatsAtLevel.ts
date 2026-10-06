import { CLASSES } from '../../content/classes';
import { requireById } from '../../content/lookup';
import type { ClassId } from '../../model/hero';
import type { StatBlock } from '../../model/statBlock';

export const STAT_NAMES: readonly (keyof StatBlock)[] = ['hp', 'strength', 'magic', 'skill', 'speed', 'defence', 'resistance'];

export function classStatsAtLevel(classId: ClassId, level: number): StatBlock {
  const { baseStats, growthPerLevel } = requireById(CLASSES, classId);
  const stats = {} as StatBlock;
  for (const stat of STAT_NAMES) stats[stat] = Math.round(baseStats[stat] + growthPerLevel[stat] * (level - 1));
  return stats;
}
