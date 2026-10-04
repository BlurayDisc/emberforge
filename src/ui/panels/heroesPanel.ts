import { describeHero, hasBankUnlock } from '../../game';
import type { Hero } from '../../model/hero';
import { ATTRIBUTE_BAR_BASE, ATTRIBUTE_BAR_PER_LEVEL } from '../../content/balance/heroSheet';
import type { HeroSheet } from '../../model/heroSheet';
import { actionButton, element, percentBar } from '../dom';
import { createExperienceBar, createLiveHealthBar } from '../liveBars';
import { className, classResourceName, heroDisplayName } from '../displayNames';
import { t } from '../i18n';
import { createList, createListRow } from '../listRow';
import { statName } from '../itemStatTable';
import { createGrowthGain } from '../classGrowth';
import { createFullBodyPortrait } from '../fullBody/fullBodyPortraitArt';
import { createPortrait } from '../portraitArt';
import { renderEquipmentScreen } from './heroes/equipmentScreen';
import { renderSpellsScreen } from './heroes/spellsScreen';
import type { PanelContext, PanelRenderer } from './panelContext';

type HeroTab = 'stats' | 'equipment' | 'spells' | 'record';

const MAIN_STAT_ORDER: readonly (keyof HeroSheet)[] = ['health', 'resource', 'physicalDamage', 'magicalDamage', 'armour', 'resistance', 'speed'];
const ATTRIBUTE_BARS: ReadonlyArray<{ stat: 'strength' | 'skill' | 'magic'; className: string }> = [
  { stat: 'strength', className: 'bar-strength' },
  { stat: 'skill', className: 'bar-skill' },
  { stat: 'magic', className: 'bar-magic' },
];

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
      createLiveHealthBar(context.store, hero.id),
      createExperienceBar(hero.experience, describeHero(context.store.getState(), hero, Date.now()).experienceToNextLevel),
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

function renderStatsTab(context: PanelContext, hero: Hero): HTMLElement {
  const view = describeHero(context.store.getState(), hero, Date.now());
  const mainRows = MAIN_STAT_ORDER.map((stat) => element('div', 'stat-table-row', element('span', 'stat-name', stat === 'resource' ? classResourceName(hero.classId) : statName(stat)), element('span', 'stat-value', String(view.sheet[stat]))));
  const showAttributeGrowth = hasBankUnlock(context.store.getState(), 'attributeGrowth');
  const attributeMaximum = ATTRIBUTE_BAR_BASE + ATTRIBUTE_BAR_PER_LEVEL * hero.level;
  const attributeRows = ATTRIBUTE_BARS.map(({ stat, className: barClass }) =>
    element('div', 'attribute-row', element('span', 'stat-name', statName(stat)), percentBar(view.sheet[stat] / attributeMaximum, barClass), element('span', 'stat-value', String(view.sheet[stat]), ...(showAttributeGrowth ? [createGrowthGain(hero.classId, stat)] : []))),
  );
  const identity = element(
    'div',
    'hero-identity',
    createFullBodyPortrait(hero.classId, hero.name, 3),
    element(
      'div',
      'hero-identity-text',
      element('div', 'card-title', t('heroes.header', { name: heroDisplayName(hero.name), className: className(hero.classId), level: hero.level })),
      element('div', 'card-text', t('heroes.hp', { max: view.sheet.health })),
      createLiveHealthBar(context.store, hero.id),
      element('div', 'card-text', t('heroes.xpTitle')),
      createExperienceBar(hero.experience, view.experienceToNextLevel),
    ),
  );
  return element(
    'div',
    'hero-detail',
    identity,
    element('div', 'section-title', t('heroes.mainStats')),
    element('div', 'stat-table', ...mainRows),
    element('div', 'section-title', t('heroes.attributes')),
    element('div', 'attribute-list', ...attributeRows),
  );
}

function renderRecordTab(context: PanelContext, hero: Hero): HTMLElement {
  const view = describeHero(context.store.getState(), hero, Date.now());
  const { statistics } = hero;
  const record = [
    statisticRow(t('heroes.power'), String(view.power)),
    statisticRow(t('heroes.kills'), String(statistics.monstersDefeated)),
    statisticRow(t('heroes.damageDealt'), String(statistics.damageDealt)),
    statisticRow(t('heroes.dps'), formatNumber(view.damagePerSecond)),
    statisticRow(t('heroes.damageTaken'), String(statistics.damageTaken)),
    statisticRow(t('heroes.healingDone'), String(statistics.healingDone)),
    statisticRow(t('heroes.battles'), `${statistics.battlesWon} / ${statistics.battlesLost}`),
  ];
  return element('div', 'hero-detail', element('div', 'section-title', t('heroes.record')), element('div', 'stat-grid wide', ...record));
}

const TAB_RENDERERS: Record<HeroTab, (context: PanelContext, hero: Hero) => HTMLElement> = {
  stats: renderStatsTab,
  equipment: renderEquipmentScreen,
  spells: renderSpellsScreen,
  record: renderRecordTab,
};

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
    element('div', 'tab-row', tabButton('stats', t('heroes.tabStats')), tabButton('equipment', t('heroes.tabEquipment')), tabButton('spells', t('heroes.tabSpells')), tabButton('record', t('heroes.tabRecord'))),
    TAB_RENDERERS[activeTab](context, hero),
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
