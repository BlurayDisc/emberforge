import { MAXIMUM_PARTY_SIZE } from '../../content/balance/economy';
import {
  describeHero,
  equipItemCommand,
  listBackpackItemsForHero,
  togglePartyMemberCommand,
  unequipItemCommand,
  type BackpackItemOption,
} from '../../game';
import type { Hero } from '../../model/hero';
import type { EquipmentSlot } from '../../model/item';
import { STAT_LABELS } from '../itemText';
import { actionButton, element, percentBar } from '../dom';
import { EQUIPMENT_SLOT_ORDER, SLOT_LABELS, formatStatBonuses, totalItemBonuses } from '../itemText';
import type { PanelContext, PanelRenderer } from './panelContext';

type HeroTab = 'stats' | 'items';

let selectedHeroId: string | null = null;
let activeTab: HeroTab = 'stats';

function renderHeroListEntry(context: PanelContext, hero: Hero, isInParty: boolean): HTMLElement {
  const view = describeHero(hero);
  const entry = element(
    'div',
    `card${hero.id === selectedHeroId ? ' selected' : ''}${isInParty ? ' in-party' : ''}`,
    element('div', 'card-title', hero.name),
    element('div', 'card-text', `${view.className} Lv ${hero.level}${isInParty ? ' (party)' : ''}`),
    percentBar(hero.healthFraction, 'bar-health'),
  );
  entry.style.cursor = 'pointer';
  entry.addEventListener('click', () => {
    selectedHeroId = hero.id;
    context.requestRender();
  });
  return entry;
}

function renderStatsTab(hero: Hero): HTMLElement {
  const view = describeHero(hero);
  const statRows = (Object.keys(STAT_LABELS) as Array<keyof typeof STAT_LABELS>).map((stat) =>
    element('div', 'card-row', element('span', 'stat-name', STAT_LABELS[stat]), element('span', '', String(view.stats[stat]))),
  );
  return element(
    'div',
    'hero-detail',
    element('div', 'card-text', `HP ${view.currentHp} / ${view.stats.hp}`),
    percentBar(hero.healthFraction, 'bar-health'),
    element('div', 'card-text', `XP ${hero.experience} / ${view.experienceToNextLevel}`),
    percentBar(hero.experience / view.experienceToNextLevel, 'bar-experience'),
    element('div', 'stat-grid', ...statRows),
  );
}

function renderSlotRow(context: PanelContext, hero: Hero, slot: EquipmentSlot): HTMLElement {
  const item = hero.equipment[slot];
  const label = element('span', 'gear-slot', SLOT_LABELS[slot]);
  if (!item) return element('div', 'gear-line', label, element('span', 'gear-empty', 'empty'), element('span', ''));
  const unequip = actionButton(
    'Unequip',
    () => {
      const result = context.store.execute(unequipItemCommand(hero.id, slot));
      if (!result.accepted) context.notify(result.rejectionReason ?? 'Could not unequip.');
    },
    { className: 'action-button small-button' },
  );
  return element(
    'div',
    'gear-line',
    label,
    element('span', '', element('span', `quality-${item.quality}`, item.name), element('div', 'card-text small', formatStatBonuses(totalItemBonuses(item)))),
    unequip,
  );
}

function renderBackpackOption(context: PanelContext, hero: Hero, option: BackpackItemOption): HTMLElement {
  const { item, problem } = option;
  const equip = actionButton(
    'Equip',
    () => {
      const result = context.store.execute(equipItemCommand(hero.id, item.id));
      context.notify(result.accepted ? `${hero.name} equips ${item.name}.` : (result.rejectionReason ?? 'Could not equip.'));
    },
    { disabled: problem !== null, className: 'action-button small-button' },
  );
  return element(
    'div',
    'gear-line',
    element('span', 'gear-slot', SLOT_LABELS[item.slot === 'ring' ? 'ringOne' : item.slot]),
    element(
      'span',
      '',
      element('span', `quality-${item.quality}`, item.name),
      element('div', 'card-text small', `${formatStatBonuses(totalItemBonuses(item))}${problem ? ` | ${problem}` : ''}`),
    ),
    equip,
  );
}

function renderItemsTab(context: PanelContext, hero: Hero): HTMLElement {
  const options = listBackpackItemsForHero(context.store.getState(), hero.id);
  return element(
    'div',
    'hero-detail',
    element('div', 'section-title', 'Equipped'),
    element('div', 'gear-grid', ...EQUIPMENT_SLOT_ORDER.map((slot) => renderSlotRow(context, hero, slot))),
    element('div', 'section-title', 'In your backpack'),
    ...(options.length > 0
      ? options.map((option) => renderBackpackOption(context, hero, option))
      : [element('p', 'hint', 'No items in the backpack. Craft some at the Workshop.')]),
  );
}

function renderHeroDetail(context: PanelContext, hero: Hero, isInParty: boolean): HTMLElement {
  const view = describeHero(hero);
  const toggleParty = actionButton(isInParty ? 'Leave party' : 'Join party', () => {
    const result = context.store.execute(togglePartyMemberCommand(hero.id));
    if (!result.accepted) context.notify(result.rejectionReason ?? 'The party did not change.');
  });
  const tabButton = (tab: HeroTab, label: string): HTMLElement => {
    const button = actionButton(label, () => {
      activeTab = tab;
      context.requestRender();
    });
    button.classList.toggle('active', activeTab === tab);
    return button;
  };
  return element(
    'div',
    'hero-detail',
    element('div', 'card-row', element('div', 'card-title', `${hero.name}, ${view.className} Lv ${hero.level}`), toggleParty),
    element('div', 'tab-row', tabButton('stats', 'Stats'), tabButton('items', 'Items')),
    activeTab === 'stats' ? renderStatsTab(hero) : renderItemsTab(context, hero),
  );
}

export const renderHeroesPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const body = element('div', 'panel-body');
  if (state.company.length === 0) {
    body.append(element('p', 'hint welcome', 'You have no heroes yet. Enter the Tavern in town to hire your first hero.'));
    return body;
  }
  const selectedHero = state.company.find((hero) => hero.id === selectedHeroId) ?? state.company[0];
  if (!selectedHero) return body;
  selectedHeroId = selectedHero.id;

  body.append(element('p', 'hint', `Party: ${state.partyHeroIds.length} / ${MAXIMUM_PARTY_SIZE}. Only party heroes fight.`));
  body.append(
    element(
      'div',
      'hero-layout',
      element('div', 'hero-list', ...state.company.map((hero) => renderHeroListEntry(context, hero, state.partyHeroIds.includes(hero.id)))),
      renderHeroDetail(context, selectedHero, state.partyHeroIds.includes(selectedHero.id)),
    ),
  );
  return body;
};
