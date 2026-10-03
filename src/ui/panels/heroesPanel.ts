import {
  describeHero,
  equipItemCommand,
  listBackpackItemsForHero,
  unequipItemCommand,
  type BackpackItemOption,
} from '../../game';
import type { Hero } from '../../model/hero';
import type { EquipmentSlot } from '../../model/item';
import type { StatBlock } from '../../model/statBlock';
import { actionButton, element, percentBar } from '../dom';
import { className, heroDisplayName, itemDisplayName } from '../displayNames';
import { describeRejection, t } from '../i18n';
import { createList, createListRow } from '../listRow';
import { EQUIPMENT_SLOT_ORDER, formatStatBonuses, slotLabel, statLabel, totalItemBonuses } from '../itemText';
import { createPortrait } from '../portraitArt';
import type { PanelContext, PanelRenderer } from './panelContext';

type HeroTab = 'stats' | 'items';

const STAT_ORDER: readonly (keyof StatBlock)[] = ['strength', 'magic', 'skill', 'speed', 'defence', 'resistance'];

let selectedHeroId: string | null = null;
let activeTab: HeroTab = 'stats';

function formatNumber(value: number): string {
  return value >= 100 ? String(Math.round(value)) : value.toFixed(1);
}

function renderHeroListEntry(context: PanelContext, hero: Hero): HTMLElement {
  const entry = createListRow({
    art: createPortrait(hero.classId, hero.name, 1),
    title: heroDisplayName(hero.name),
    lines: [
      element('div', 'card-text small', t('heroes.levelShort', { className: className(hero.classId), level: hero.level })),
      percentBar(hero.healthFraction, 'bar-health'),
    ],
    className: `hero-choice${hero.id === selectedHeroId ? ' selected' : ''}`,
  });
  entry.addEventListener('click', () => {
    selectedHeroId = hero.id;
    context.requestRender();
  });
  return entry;
}

function statisticRow(label: string, value: string): HTMLElement {
  return element('div', 'card-row', element('span', 'stat-name', label), element('span', '', value));
}

function renderStatsTab(hero: Hero): HTMLElement {
  const view = describeHero(hero);
  const { statistics } = hero;
  const statRows = STAT_ORDER.map((stat) => statisticRow(statLabel(stat), String(view.stats[stat])));
  const record = [
    statisticRow(t('heroes.power'), String(view.power)),
    statisticRow(t('heroes.kills'), String(statistics.monstersDefeated)),
    statisticRow(t('heroes.damageDealt'), String(statistics.damageDealt)),
    statisticRow(t('heroes.dps'), formatNumber(view.damagePerSecond)),
    statisticRow(t('heroes.damageTaken'), String(statistics.damageTaken)),
    statisticRow(t('heroes.healingDone'), String(statistics.healingDone)),
    statisticRow(t('heroes.battles'), `${statistics.battlesWon} / ${statistics.battlesLost}`),
  ];
  const identity = element(
    'div',
    'hero-identity',
    createPortrait(hero.classId, hero.name, 4),
    element(
      'div',
      'hero-identity-text',
      element('div', 'card-title', t('heroes.header', { name: heroDisplayName(hero.name), className: className(hero.classId), level: hero.level })),
      element('div', 'card-text', t('heroes.hp', { current: view.currentHp, max: view.stats.hp })),
      percentBar(hero.healthFraction, 'bar-health'),
      element('div', 'card-text', t('heroes.xp', { current: hero.experience, next: view.experienceToNextLevel })),
      percentBar(hero.experience / view.experienceToNextLevel, 'bar-experience'),
    ),
  );
  return element(
    'div',
    'hero-detail',
    identity,
    element('div', 'section-title', t('heroes.attributes')),
    element('div', 'stat-grid', ...statRows),
    element('div', 'section-title', t('heroes.record')),
    element('div', 'stat-grid wide', ...record),
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
    element('span', '', element('span', `quality-${item.quality}`, itemDisplayName(item)), element('div', 'card-text small', `${formatStatBonuses(totalItemBonuses(item))}${problemText}`)),
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
    ...(options.length > 0 ? options.map((option) => renderBackpackOption(context, hero, option)) : [element('p', 'hint', t('heroes.noItems'))]),
  );
}

function renderHeroDetail(context: PanelContext, hero: Hero): HTMLElement {
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
  body.append(
    element(
      'div',
      'hero-layout',
      createList(...state.company.map((hero) => renderHeroListEntry(context, hero))),
      renderHeroDetail(context, selectedHero),
    ),
  );
  return body;
};
