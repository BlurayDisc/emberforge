import { playSound } from '../audio';
import { DUNGEONS } from '../content/dungeons';
import type { GameState } from '../model/gameState';
import type { Hero } from '../model/hero';
import { actionButton, element } from './dom';
import { t } from './i18n';
import { drawAscii, drawingToImage } from './pixelDraw';
import { createHeroCards } from './victoryHeroCards';
import { WIKI_URL } from './wikiLinks';

const TROPHY_ROWS = ['..oooooooo..', 'ooogllgggdoo', 'ogoglgggdogo', 'ogoglgggdogo', '.ooglgggdoo.', '..oglgggdo..', '...ogggdo...', '....oddo....', '.....oo.....', '.....oo.....', '...oooooo...', '..oddggddo..'];
const TROPHY_LEGEND = { o: '#17110d', g: '#f2c14e', l: '#fff2b0', d: '#b9821f' };
const CONFETTI_COLORS = ['var(--gold)', 'var(--copper)', 'var(--green)', 'var(--blue)', 'var(--crimson)', 'var(--parchment)'];
const CONFETTI_COUNT = 36;
const STORY_PARAGRAPHS = [1, 2, 3];

// Confetti falls in whole steps, so it keeps the pixel look. The numbers come from a fixed formula, so it looks the same every time.
function createConfetti(): HTMLElement[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, index) => {
    const piece = element('span', 'victory-confetti');
    piece.style.left = `${(index * 37) % 100}%`;
    piece.style.background = CONFETTI_COLORS[index % CONFETTI_COLORS.length] ?? 'var(--gold)';
    piece.style.animationDelay = `${((index * 53) % 40) / 10}s`;
    piece.style.animationDuration = `${4 + ((index * 7) % 5)}s`;
    return piece;
  });
}

// Totals of the whole adventure, shown under the hero cards.
function createAdventureTotals(state: GameState, heroes: readonly Hero[]): HTMLElement {
  const lines: Array<[string, string]> = [
    [t('victory.dungeonsCleared'), `${state.clearedDungeonIds.length} / ${DUNGEONS.length}`],
    [t('victory.monstersDefeated'), state.company.reduce((sum, hero) => sum + hero.statistics.monstersDefeated, 0).toLocaleString()],
    [t('victory.fightsStarted'), state.runsStarted.toLocaleString()],
    [t('victory.itemsCrafted'), state.itemsCrafted.toLocaleString()],
    [t('victory.spellsLearned'), state.company.reduce((sum, hero) => sum + hero.learnedSpellIds.length, 0).toLocaleString()],
    [t('victory.heroesInCompany'), String(Math.max(state.company.length, heroes.length))],
  ];
  return element('div', 'victory-totals', ...lines.map(([label, value]) => element('div', 'victory-total', element('div', 'victory-total-value', value), element('div', 'victory-total-label', label))));
}

// The Victory screen covers the whole page. It opens when the player first clears the victory dungeon, and again from the Settings screen.
// The player may keep playing. onClosed runs when the screen closes (the chapter story follows it).
export function openVictoryScreen(state: GameState, heroes: readonly Hero[], onClosed?: () => void): void {
  const overlay = element('div', 'victory-overlay');
  const close = (): void => {
    document.removeEventListener('keydown', closeOnEscape);
    overlay.remove();
    onClosed?.();
  };
  const closeOnEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') close();
  };
  const { cards, revealSeconds } = createHeroCards(state, heroes);
  const totals = createAdventureTotals(state, heroes);
  totals.style.animationDelay = `${revealSeconds}s`;
  const trophy = drawingToImage(drawAscii(TROPHY_ROWS, TROPHY_LEGEND), 10, 'pixel-icon victory-trophy');
  overlay.append(
    element('div', 'victory-rays'),
    ...createConfetti(),
    element(
      'div',
      'victory-content',
      trophy,
      element('div', 'victory-title', t('victory.title')),
      element('div', 'victory-subtitle', t('victory.subtitle')),
      ...(heroes.length > 0 ? [element('div', 'victory-section', t('victory.hallOfFame')), cards] : []),
      element('div', 'victory-section', t('victory.adventure')),
      totals,
      element('div', 'victory-story', ...STORY_PARAGRAPHS.map((paragraph, index) => {
        const line = element('p', 'victory-line', t(`victory.${paragraph}`));
        line.style.animationDelay = `${revealSeconds + 0.8 + index * 0.9}s`;
        return line;
      })),
      element('div', 'victory-actions', actionButton(t('victory.continue'), close), actionButton(t('victory.wiki'), () => window.open(WIKI_URL, '_blank', 'noopener'), { className: 'action-button primary' })),
    ),
  );
  document.addEventListener('keydown', closeOnEscape);
  document.body.append(overlay);
  playSound('victory-fanfare');
}
