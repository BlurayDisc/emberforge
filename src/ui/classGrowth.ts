import { ATTRIBUTE_NAMES } from '../content/attributes';
import { ATTACK_SPEED_BONUS_PER_AGILITY, HP_PER_STRENGTH, RESISTANCE_PER_INTELLIGENCE } from '../content/balance/heroStats';
import { CLASSES } from '../content/classes';
import { requireById } from '../content/lookup';
import type { ClassId } from '../model/hero';
import { element, percentBar } from './dom';
import { t } from './i18n';
import { statName } from './itemStatTable';

// The attributes are one group and the main stats are another. Each group has its own Bank purchase.
// Every main stat here follows an attribute, so its growth per level is the attribute gain times its constant. Defence has no growth.
type GrowthStat = 'strength' | 'agility' | 'intelligence' | 'hp' | 'resistance' | 'attackSpeed';
const ATTRIBUTE_STATS: readonly GrowthStat[] = ATTRIBUTE_NAMES;
const MAIN_STATS: readonly GrowthStat[] = ['hp', 'resistance', 'attackSpeed'];
const PERCENT_POINTS_PER_FRACTION = 100;

export interface GrowthNumberVisibility {
  attributes: boolean;
  mainStats: boolean;
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function growthOf(classId: ClassId, stat: GrowthStat): number {
  const { attributes } = requireById(CLASSES, classId);
  if (stat === 'hp') return roundToOneDecimal(attributes.strength.gainPerLevel * HP_PER_STRENGTH);
  if (stat === 'resistance') return roundToOneDecimal(attributes.intelligence.gainPerLevel * RESISTANCE_PER_INTELLIGENCE);
  if (stat === 'attackSpeed') return roundToOneDecimal(attributes.agility.gainPerLevel * ATTACK_SPEED_BONUS_PER_AGILITY * PERCENT_POINTS_PER_FRACTION);
  return attributes[stat].gainPerLevel;
}

// Each stat has its own scale (Health grows by tens, the others by ones), so a bar compares a class with the best class for that stat.
function bestGrowthOf(stat: GrowthStat): number {
  return Math.max(...CLASSES.map((definition) => growthOf(definition.id, stat)));
}

// For an attribute row in the hero details: the gain sits next to the current value, like "19 +1.9/lvl".
export function createGrowthGain(classId: ClassId, stat: GrowthStat): HTMLElement {
  return element('span', 'growth-gain', `+${growthOf(classId, stat)}${t('heroes.perLevelShort')}`);
}

function createGrowthGroup(classId: ClassId, stats: readonly GrowthStat[], showNumbers: boolean): HTMLElement {
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
