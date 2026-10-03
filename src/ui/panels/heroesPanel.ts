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
import type { StatBlock } from '../../model/statBlock';
import { actionButton, element, percentBar } from '../dom';
import { className, heroDisplayName, itemDisplayName } from '../displayNames';
import { describeRejection, t } from '../i18n';
import { EQUIPMENT_SLOT_ORDER, formatStatBonuses, slotLabel, statLabel, totalItemBonuses } from '../itemText';
import type { PanelContext, PanelRenderer } from './panelContext';

type HeroTab = 'stats' | 'items';

const STAT_ORDER: readonly (keyof StatBlock)[] = ['strength', 'magic', 'skill', 'speed', 'defence', 'resistance'];

let selectedHeroId: string | null = null;
let activeTab: HeroTab = 'stats';

function renderHeroListEntry(context: PanelContext, hero: Hero, isInParty: boolean): HTMLElement {
  const summary = t('heroes.levelShort', { className: className(hero.classId), level: hero.level });
  const entry = element(
    'div',
    `card${hero.id === selectedHeroId ? ' selected' : ''}${isInParty ? ' in-party' : ''}`,
    element('div', 'card-title', heroDisplayName(hero.name)),
    element('div', 'card-text', `${summary}${isInParty ? ` ${t('heroes.inParty')}` : ''}`),
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
  const statRows = STAT_ORDER.map((stat) =>
    element('div', 'card-row', element('span', 'stat-name', statLabel(stat)), element('span', '', String(view.stats[stat]))),
  );
  return element(
    'div',
    'hero-detail',
    element('div', 'card-text', t('heroes.hp', { current: view.currentHp, max: view.stats.hp })),
    percentBar(hero.healthFraction, 'bar-health'),
    element('div', 'card-text', t('heroes.xp', { current: hero.experience, next: view.experienceToNextLevel })),
    percentBar(hero.experience / view.experienceToNextLevel, 'bar-experience'),
    element('div', 'stat-grid', ...statRows),
  );
}

function renderSlotRow(context: PanelContext, hero: Hero, slot: EquipmentSlot): HTMLElement {
  const item = hero.equipment[slot];
  const label = element('span', 'gear-slot', slotLabel(slot));
  if (!item) return element('div', 'gear-line', label, element('span', 'gear-empty', t('heroes.slotEmpty')), element('span', ''));
  const unequip = actionButton(
    t('heroes.unequip'),
    () => {
      const result = context.store.execute(unequipItemCommand(hero.id, slot));
      if (!result.accepted) context.notify(describeRejection(result.rejection));
    },
    { className: 'action-button small-button' },
  );
  return element(
    'div',
    'gear-line',
    label,
    element('span', '', element('span', `quality-${item.quality}`, itemDisplayName(item)), element('div', 'card-text small', formatStatBonuses(totalItemBonuses(item)))),
    unequip,
  );
}

function renderBackpackOption(context: PanelContext, hero: Hero, option: BackpackItemOption): HTMLElement {
  const { item, problem } = option;
  const equip = actionButton(
    t('heroes.equip'),
    () => {
      const result = context.store.execute(equipItemCommand(hero.id, item.id));
      context.notify(
        result.accepted
          ? t('heroes.equips', { hero: heroDisplayName(hero.name), item: itemDisplayName(item) })
          : describeRejection(result.rejection),
      );
    },
    { disabled: problem !== null, className: 'action-button small-button' },
  );
  const problemText = problem ? ` | ${t(problem.key, problem.params)}` : '';
  return element(
    'div',
    'gear-line',
    element('span', 'gear-slot', slotLabel(item.slot === 'ring' ? 'ringOne' : item.slot)),
    element(
      'span',
      '',
      element('span', `quality-${item.quality}`, itemDisplayName(item)),
      element('div', 'card-text small', `${formatStatBonuses(totalItemBonuses(item))}${problemText}`),
    ),
    equip,
  );
}

function renderItemsTab(context: PanelContext, hero: Hero): HTMLElement {
  const options = listBackpackItemsForHero(context.store.getState(), hero.id);
  return element(
    'div',
    'hero-detail',
    element('div', 'section-title', t('heroes.equipped')),
    element('div', 'gear-grid', ...EQUIPMENT_SLOT_ORDER.map((slot) => renderSlotRow(context, hero, slot))),
    element('div', 'section-title', t('heroes.backpackItems')),
    ...(options.length > 0
      ? options.map((option) => renderBackpackOption(context, hero, option))
      : [element('p', 'hint', t('heroes.noItems'))]),
  );
}

function renderHeroDetail(context: PanelContext, hero: Hero, isInParty: boolean): HTMLElement {
  const toggleParty = actionButton(isInParty ? t('heroes.leaveParty') : t('heroes.joinParty'), () => {
    const result = context.store.execute(togglePartyMemberCommand(hero.id));
    if (!result.accepted) context.notify(describeRejection(result.rejection));
  });
  const tabButton = (tab: HeroTab, label: string): HTMLElement => {
    const button = actionButton(label, () => {
      activeTab = tab;
      context.requestRender();
    });
    button.classList.toggle('active', activeTab === tab);
    return button;
  };
  const header = t('heroes.header', { name: heroDisplayName(hero.name), className: className(hero.classId), level: hero.level });
  return element(
    'div',
    'hero-detail',
    element('div', 'card-row', element('div', 'card-title', header), toggleParty),
    element('div', 'tab-row', tabButton('stats', t('heroes.tabStats')), tabButton('items', t('heroes.tabItems'))),
    activeTab === 'stats' ? renderStatsTab(hero) : renderItemsTab(context, hero),
  );
}

export const renderHeroesPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const body = element('div', 'panel-body');
  if (state.company.length === 0) {
    body.append(element('p', 'hint welcome', t('heroes.empty')));
    return body;
  }
  const selectedHero = state.company.find((hero) => hero.id === selectedHeroId) ?? state.company[0];
  if (!selectedHero) return body;
  selectedHeroId = selectedHero.id;

  body.append(element('p', 'hint', t('heroes.partyLine', { count: state.partyHeroIds.length, max: MAXIMUM_PARTY_SIZE })));
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
