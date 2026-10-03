import { MAXIMUM_PARTY_SIZE } from '../../content/balance/economy';
import { describeHero, togglePartyMemberCommand, unequipItemCommand } from '../../game';
import type { Hero } from '../../model/hero';
import type { EquipmentSlot } from '../../model/item';
import { actionButton, element, percentBar } from '../dom';
import { EQUIPMENT_SLOT_ORDER, SLOT_LABELS, formatStatBonuses } from '../itemText';
import type { PanelContext, PanelRenderer } from './panelContext';

function renderGearLine(context: PanelContext, hero: Hero, slot: EquipmentSlot): HTMLElement | null {
  const item = hero.equipment[slot];
  if (!item) return null;
  const unequip = actionButton(
    'Unequip',
    () => {
      const result = context.store.execute(unequipItemCommand(hero.id, slot));
      if (!result.accepted) context.notify(result.rejectionReason ?? 'Could not unequip.');
    },
    { className: 'action-button small-button' },
  );
  const bonusTotals = formatStatBonuses({
    ...item.baseStats,
    ...Object.fromEntries(item.affixes.map((affix) => [affix.stat, (item.baseStats[affix.stat] ?? 0) + affix.value])),
  });
  return element(
    'div',
    'gear-line',
    element('span', 'gear-slot', SLOT_LABELS[slot]),
    element('span', `quality-${item.quality}`, item.name),
    element('span', 'card-text small', bonusTotals),
    unequip,
  );
}

function renderHero(context: PanelContext, hero: Hero, isInParty: boolean): HTMLElement {
  const view = describeHero(hero);
  const { stats } = view;
  const statLine = `STR ${stats.strength}  MAG ${stats.magic}  SKL ${stats.skill}  SPD ${stats.speed}  DEF ${stats.defence}  RES ${stats.resistance}`;
  const toggle = actionButton(isInParty ? 'Leave party' : 'Join party', () => {
    const result = context.store.execute(togglePartyMemberCommand(hero.id));
    if (!result.accepted) context.notify(result.rejectionReason ?? 'The party did not change.');
  });
  const gearLines = EQUIPMENT_SLOT_ORDER.map((slot) => renderGearLine(context, hero, slot)).filter(
    (line): line is HTMLElement => line !== null,
  );
  return element(
    'div',
    isInParty ? 'card in-party' : 'card',
    element('div', 'card-title', `${hero.name} — ${view.className} Lv ${hero.level}`),
    element('div', 'card-text', `HP ${view.currentHp} / ${stats.hp}`),
    percentBar(hero.healthFraction, 'bar-health'),
    element('div', 'card-text', `XP ${hero.experience} / ${view.experienceToNextLevel}`),
    percentBar(hero.experience / view.experienceToNextLevel, 'bar-experience'),
    element('div', 'card-text small', statLine),
    ...(gearLines.length > 0 ? gearLines : [element('div', 'card-text small', 'No gear equipped.')]),
    toggle,
  );
}

export const renderHeroesPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const body = element('div', 'panel-body');
  if (state.company.length === 0) {
    body.append(element('p', 'hint', 'You have no heroes. Open Town, then the Tavern, to hire your first hero.'));
    return body;
  }
  body.append(element('p', 'hint', `Party: ${state.partyHeroIds.length} / ${MAXIMUM_PARTY_SIZE}. Only party heroes fight. Equip gear from the Inventory.`));
  body.append(
    element('div', 'card-grid', ...state.company.map((hero) => renderHero(context, hero, state.partyHeroIds.includes(hero.id)))),
  );
  return body;
};
