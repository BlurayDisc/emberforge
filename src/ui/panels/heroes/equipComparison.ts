import { compareEquip, equipItemCommand, type SlotCandidate } from '../../../game';
import type { Hero } from '../../../model/hero';
import type { EquipmentSlot, Item } from '../../../model/item';
import type { HeroSheet } from '../../../model/heroSheet';
import { actionButton, element } from '../../dom';
import { classResourceName, heroDisplayName, itemDisplayName } from '../../displayNames';
import { describeRejection, t } from '../../i18n';
import { formatStatValue, statName } from '../../itemStatTable';
import { createItemPortrait } from '../../itemPortrait';
import { createItemCard } from '../../itemText';
import type { PanelContext } from '../panelContext';

const COMPARED_STATS: readonly (keyof HeroSheet)[] = ['health', 'resource', 'physicalDamage', 'magicalDamage', 'armour', 'resistance', 'speed', 'criticalChance', 'criticalDamage', 'lifeSteal', 'strength', 'skill', 'magic'];

function deltaCell(stat: string, before: number, after: number): HTMLElement {
  const difference = Math.round((after - before) * 10) / 10;
  const text = difference > 0 ? `+${formatStatValue(stat, difference)}` : formatStatValue(stat, difference);
  return element('span', `delta ${difference > 0 ? 'delta-up' : difference < 0 ? 'delta-down' : 'delta-same'}`, difference === 0 ? '=' : text);
}

function compareRow(stat: string, label: string, before: number, after: number): HTMLElement {
  return element('div', 'compare-row', element('span', 'stat-name', label), element('span', '', formatStatValue(stat, before)), element('span', '', '>'), element('span', '', formatStatValue(stat, after)), deltaCell(stat, before, after));
}

// A requested slot of undefined lets the equipment system pick the slot. The comparison and the equip command then agree on it.
export function renderEquipComparison(context: PanelContext, hero: Hero, requestedSlot: EquipmentSlot | undefined, item: Item, problem: SlotCandidate['problem'], area: HTMLElement, onEquipped: () => void): void {
  const comparison = compareEquip(context.store.getState(), hero.id, item, requestedSlot);
  const equipped = comparison ? hero.equipment[comparison.slot] : undefined;
  const rows = comparison
    ? [
        ...COMPARED_STATS.map((stat) => compareRow(stat, stat === 'resource' ? classResourceName(hero.classId) : statName(stat), comparison.before[stat], comparison.after[stat])),
        compareRow('power', t('equip.power'), comparison.powerBefore, comparison.powerAfter),
      ]
    : [];
  const equipButton = actionButton(t('equip.confirm'), () => {
    const result = context.store.execute(equipItemCommand(hero.id, item.id, comparison?.slot));
    context.notify(result.accepted ? t('heroes.equips', { hero: heroDisplayName(hero.name), item: itemDisplayName(item) }) : describeRejection(result.rejection));
    if (result.accepted) onEquipped();
  }, { disabled: problem !== null, className: 'action-button primary equip-confirm' });
  area.replaceChildren(
    element(
      'div',
      'compare-cards',
      element('div', 'compare-card', element('div', 'section-title', t('equip.current')), ...(equipped ? [createItemPortrait(equipped), createItemCard(equipped)] : [element('p', 'hint', t('equip.nothing'))])),
      element('div', 'compare-card', element('div', 'section-title', t('equip.candidate')), createItemPortrait(item), createItemCard(item)),
    ),
    element('div', 'compare-table', ...rows),
    problem ? element('p', 'danger-text', t(problem.key, problem.params)) : element('span', ''),
    equipButton,
  );
}
