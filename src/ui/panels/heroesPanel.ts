import { describeHero } from '../../game';
import type { Hero } from '../../model/hero';
import type { StatBlock } from '../../model/statBlock';
import { actionButton, element } from '../dom';
import { createExperienceBar, createLiveHealthBar } from '../liveBars';
import { className, heroDisplayName } from '../displayNames';
import { t } from '../i18n';
import { createList, createListRow } from '../listRow';
import { statLabel } from '../itemText';
import { createPortrait } from '../portraitArt';
import { renderEquipmentScreen } from './heroes/equipmentScreen';
import type { PanelContext, PanelRenderer } from './panelContext';

type HeroTab = 'stats' | 'equipment';

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
      element('div', 'card-text', t('heroes.hp', { max: view.stats.hp })),
      createLiveHealthBar(context.store, hero.id),
      element('div', 'card-text', t('heroes.xpTitle')),
      createExperienceBar(hero.experience, view.experienceToNextLevel),
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
    element('div', 'tab-row', tabButton('stats', t('heroes.tabStats')), tabButton('equipment', t('heroes.tabEquipment'))),
    activeTab === 'stats' ? renderStatsTab(context, hero) : renderEquipmentScreen(context, hero),
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
