import { BASE_ITEMS } from '../content/baseItems';
import { requireById } from '../content/lookup';
import type { GearType, Item, StatBonuses } from '../model/item';
import { element } from './dom';
import { t } from './i18n';

const WEAPON_TABLE_STATS: readonly string[] = ['physicalDamage', 'magicalDamage', 'speed'];
const DEFENCE_TABLE_STATS: readonly string[] = ['hp', 'defence', 'resistance'];
const WEAPON_GEAR_TYPES: readonly GearType[] = ['sword', 'axe', 'greataxe', 'mace', 'maul', 'dagger', 'knuckles', 'bow', 'staff', 'wand', 'quiver', 'tome'];

export function statName(stat: string): string {
  return t(`statname.${stat}`);
}

function tableStatsFor(gearType: GearType): readonly string[] {
  return WEAPON_GEAR_TYPES.includes(gearType) ? WEAPON_TABLE_STATS : DEFENCE_TABLE_STATS;
}

// A stat the item does not give shows 0, dimmed, so every item of a kind has the same rows and the same look.
function tableRow(stat: string, value: string | undefined): HTMLElement {
  return element('div', `stat-table-row${value === undefined ? ' empty' : ''}`, element('span', 'stat-name', statName(stat)), element('span', 'stat-value', value ?? '0'));
}

// Every item shows the same table for its kind. Weapons: damage and speed. Everything else: health and defences.
// Stats outside the table (Str, Agi, Int and the like) are listed below it.
function createTableWithExtras(gearType: GearType, valueOf: (stat: string) => string | undefined, extraLines: HTMLElement[]): HTMLElement {
  const tableStats = tableStatsFor(gearType);
  return element(
    'div',
    'item-stats',
    element('div', 'stat-table', ...tableStats.map((stat) => tableRow(stat, valueOf(stat)))),
    ...extraLines,
  );
}

function extraBaseStatLines(stats: Record<string, string>, gearType: GearType): HTMLElement[] {
  const tableStats = tableStatsFor(gearType);
  return Object.entries(stats)
    .filter(([stat]) => !tableStats.includes(stat))
    .map(([stat, value]) => element('div', 'extra-stat', `+${value} ${statName(stat)}`));
}

export function createItemStatTable(item: Item): HTMLElement {
  const baseValues: Record<string, string> = {};
  for (const [stat, value] of Object.entries(item.baseStats as StatBonuses)) baseValues[stat] = String(value);
  const affixLines = item.affixes.map((affix) =>
    element('div', `affix-line affix-${affix.kind}`, `${t(`affix.${affix.affixId}`)}: +${affix.value} ${statName(affix.stat)}`),
  );
  return createTableWithExtras(item.gearType, (stat) => baseValues[stat], [...extraBaseStatLines(baseValues, item.gearType), ...affixLines]);
}

function formatRange([low, high]: [number, number]): string {
  return low === high ? String(low) : `${low}-${high}`;
}

export function createRecipeStatTable(baseId: string, ranges: Record<string, [number, number]>): HTMLElement {
  const { gearType } = requireById(BASE_ITEMS, baseId);
  const rangeText: Record<string, string> = {};
  for (const [stat, range] of Object.entries(ranges)) rangeText[stat] = formatRange(range);
  return createTableWithExtras(gearType, (stat) => rangeText[stat], extraBaseStatLines(rangeText, gearType));
}
