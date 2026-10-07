import { CLASSES } from '../content/classes';
import { requireById } from '../content/lookup';
import type { ClassId } from '../model/hero';
import type { HeroSheet } from '../model/heroSheet';
import type { ResourceId } from '../model/resource';
import { classResourceName } from './displayNames';
import { element } from './dom';
import { formatStatValue, statName } from './itemStatTable';

// A shorter attack time is better, so a drop in it counts as a gain.
const LOWER_IS_BETTER_STATS: readonly string[] = ['attackSeconds'];

export function classResourceId(classId: ClassId): ResourceId {
  return requireById(CLASSES, classId).resourceId;
}

// The damage of a hero is physical or magical by the attack kind of its class, so a Mage never reads "Physical damage".
export function heroStatLabel(stat: keyof HeroSheet, classId: ClassId): string {
  if (stat === 'resource') return classResourceName(classId);
  if (stat === 'damage') return statName(requireById(CLASSES, classId).attackKind === 'magic' ? 'magicalDamage' : 'physicalDamage');
  return statName(stat);
}

function createItemBonusText(stat: string, bonus: number): HTMLElement | null {
  if (bonus === 0) return null;
  const isGain = LOWER_IS_BETTER_STATS.includes(stat) ? bonus < 0 : bonus > 0;
  const sign = bonus > 0 ? '+' : '-';
  return element('span', `item-bonus ${isGain ? 'item-bonus-gain' : 'item-bonus-loss'}`, `${sign}${formatStatValue(stat, Math.abs(bonus))}`);
}

// Like Warcraft III: the base value from the class and level, then the part that the equipped items add in green.
export function createStatValueWithItemBonus(stat: string, total: number, itemBonus: number): HTMLElement {
  const bonusText = createItemBonusText(stat, itemBonus);
  const baseValue = Math.round((total - itemBonus) * 100) / 100;
  return element('span', 'stat-value', formatStatValue(stat, baseValue), ...(bonusText ? [bonusText] : []));
}
