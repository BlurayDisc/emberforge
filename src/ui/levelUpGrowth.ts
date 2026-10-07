import { levelUpGains } from '../game';
import type { ClassId } from '../model/hero';
import { element } from './dom';
import { statName } from './itemStatTable';

const GROWTH_STAT_ORDER = ['hp', 'strength', 'agility', 'intelligence', 'resistance'] as const;

// One chip for each stat that the new levels raised. A stat that did not change has no chip. The resource pools are fixed, so they never grow.
export function createLevelUpGrowth(classId: ClassId, levelBefore: number, levelAfter: number): HTMLElement {
  const gains = levelUpGains(classId, levelBefore, levelAfter);
  const chips = GROWTH_STAT_ORDER
    .map((stat) => ({ name: statName(stat), gain: Math.round(gains.stats[stat]) }))
    .filter((entry) => entry.gain > 0)
    .map((entry) => element('span', 'growth-chip', `${entry.name} +${entry.gain}`));
  return element('div', 'level-up-growth', ...chips);
}
