import { CLASSES } from '../content/classes';
import { requireById } from '../content/lookup';
import type { ClassId } from '../model/hero';
import type { StatBlock } from '../model/statBlock';
import { element, percentBar } from './dom';
import { t } from './i18n';
import { statName } from './itemStatTable';

// The attributes are one group and the main stats are another. Each group has its own Bank purchase.
const ATTRIBUTE_STATS: readonly (keyof StatBlock)[] = ['strength', 'skill', 'magic'];
const MAIN_STATS: readonly (keyof StatBlock)[] = ['hp', 'defence', 'resistance', 'speed'];

export interface GrowthNumberVisibility {
  attributes: boolean;
  mainStats: boolean;
}

function growthOf(classId: ClassId, stat: keyof StatBlock): number {
  return requireById(CLASSES, classId).growthPerLevel[stat];
}

// Each stat has its own scale (Health grows by tens, the others by ones), so a bar compares a class with the best class for that stat.
function bestGrowthOf(stat: keyof StatBlock): number {
  return Math.max(...CLASSES.map((definition) => definition.growthPerLevel[stat]));
}

// For an attribute row in the hero details: the gain sits next to the current value, like "19 +1.9/lvl".
export function createGrowthGain(classId: ClassId, stat: keyof StatBlock): HTMLElement {
  return element('span', 'growth-gain', `+${growthOf(classId, stat)}${t('heroes.perLevelShort')}`);
}

function createGrowthGroup(classId: ClassId, stats: readonly (keyof StatBlock)[], showNumbers: boolean): HTMLElement {
  return element(
    'div',
    'growth-group',
    ...stats.map((stat) =>
      element(
        'div',
        'growth-bar-row',
        element('span', 'stat-name', statName(stat)),
        percentBar(growthOf(classId, stat) / bestGrowthOf(stat), `bar-${stat}`),
        element('span', 'growth-gain', showNumbers ? `+${growthOf(classId, stat)}` : ''),
      ),
    ),
  );
}

// For a list row where space is tight. The attribute bars always show, and their numbers wait for the Bank purchase. The main stat group waits for its own Bank purchase.
export function createGrowthBars(classId: ClassId, visibility: GrowthNumberVisibility): HTMLElement {
  return element(
    'div',
    'growth-bars',
    createGrowthGroup(classId, ATTRIBUTE_STATS, visibility.attributes),
    ...(visibility.mainStats ? [createGrowthGroup(classId, MAIN_STATS, true)] : []),
  );
}
