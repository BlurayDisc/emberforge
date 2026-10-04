import { describeHero } from '../game';
import type { GameState } from '../model/gameState';
import type { Hero } from '../model/hero';
import type { HeroSheet } from '../model/heroSheet';
import { className, heroDisplayName } from './displayNames';
import { element } from './dom';
import { t } from './i18n';
import { createPortrait } from './portraitArt';

// One row of the stat list, like the stat screen of a monster in a creature-catching game. The bar fills after the card appears.
interface StatRow {
  key: keyof HeroSheet;
  colorVariable: string;
}

const STAT_ROWS: readonly StatRow[] = [
  { key: 'health', colorVariable: '--green' },
  { key: 'strength', colorVariable: '--crimson' },
  { key: 'skill', colorVariable: '--green' },
  { key: 'magic', colorVariable: '--blue' },
  { key: 'physicalDamage', colorVariable: '--copper' },
  { key: 'magicalDamage', colorVariable: '--blue' },
  { key: 'armour', colorVariable: '--silver' },
  { key: 'resistance', colorVariable: '--blue' },
  { key: 'speed', colorVariable: '--gold' },
];

const CARD_DELAY_SECONDS = 1.2;
const CARD_SPACING_SECONDS = 1.1;
const ROW_SPACING_SECONDS = 0.1;
// A bar never reaches the end of its track, so the strongest stat of the party still shows room to grow.
const BAR_HEADROOM = 1.25;

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

function createStatRow(row: StatRow, value: number, strongestValue: number, startSeconds: number): HTMLElement {
  const fill = element('div', 'victory-stat-fill');
  fill.style.setProperty('--fill', `${Math.round(Math.min(1, value / (strongestValue * BAR_HEADROOM)) * 100)}%`);
  fill.style.setProperty('--bar-color', `var(${row.colorVariable})`);
  fill.style.animationDelay = `${startSeconds}s`;
  return element('div', 'victory-stat-row', element('span', 'victory-stat-name', t(`statname.${row.key}`)), element('div', 'victory-stat-track', fill), element('span', 'victory-stat-value', formatNumber(value)));
}

function createRecordLine(label: string, value: string): HTMLElement {
  return element('div', 'victory-record-line', element('span', '', label), element('span', 'victory-record-value', value));
}

function createHeroCard(state: GameState, hero: Hero, cardIndex: number, strongestSheet: Readonly<Record<keyof HeroSheet, number>>): HTMLElement {
  const view = describeHero(state, hero, Date.now());
  const { statistics } = hero;
  const startSeconds = CARD_DELAY_SECONDS + cardIndex * CARD_SPACING_SECONDS;
  const card = element(
    'div',
    'victory-card',
    element(
      'div',
      'victory-card-head',
      createPortrait(hero.classId, hero.name, 4),
      element('div', 'victory-card-title', element('div', 'victory-hero-name', heroDisplayName(hero.name)), element('div', 'victory-hero-class', t('heroes.levelShort', { className: className(hero.classId), level: hero.level })), element('div', 'victory-power', t('victory.power', { power: formatNumber(view.power) }))),
    ),
    element('div', 'victory-card-section', t('victory.stats')),
    element('div', 'victory-stats', ...STAT_ROWS.map((row, rowIndex) => createStatRow(row, view.sheet[row.key], strongestSheet[row.key], startSeconds + 0.4 + rowIndex * ROW_SPACING_SECONDS))),
    element('div', 'victory-card-section', t('victory.record')),
    element(
      'div',
      'victory-record',
      createRecordLine(t('heroes.kills'), formatNumber(statistics.monstersDefeated)),
      createRecordLine(t('heroes.damageDealt'), formatNumber(statistics.damageDealt)),
      createRecordLine(t('heroes.damageTaken'), formatNumber(statistics.damageTaken)),
      createRecordLine(t('heroes.healingDone'), formatNumber(statistics.healingDone)),
      createRecordLine(t('heroes.battles'), `${statistics.battlesWon} / ${statistics.battlesLost}`),
    ),
  );
  card.style.animationDelay = `${startSeconds}s`;
  return card;
}

export function createHeroCards(state: GameState, heroes: readonly Hero[]): { cards: HTMLElement; revealSeconds: number } {
  const sheets = heroes.map((hero) => describeHero(state, hero, Date.now()).sheet);
  const strongestSheet = Object.fromEntries(STAT_ROWS.map((row) => [row.key, Math.max(1, ...sheets.map((sheet) => sheet[row.key]))])) as Record<keyof HeroSheet, number>;
  return {
    cards: element('div', 'victory-cards', ...heroes.map((hero, index) => createHeroCard(state, hero, index, strongestSheet))),
    revealSeconds: CARD_DELAY_SECONDS + heroes.length * CARD_SPACING_SECONDS + 1.2,
  };
}
