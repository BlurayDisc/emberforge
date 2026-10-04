import { actionButton, element } from './dom';
import { t } from './i18n';
import { openModal } from './modal';
import { WIKI_URL } from './wikiLinks';

// Shown once, when the player first clears the victory dungeon. The player may keep playing.
export function openVictoryScreen(): void {
  const content = element('div', 'panel-body victory-screen');
  const modal = openModal(t('lore.prologue.title'), content);
  content.append(
    element('div', 'victory-banner', t('victory.title')),
    ...[1, 2, 3].map((paragraph) => element('p', 'card-text lore-text', t(`victory.${paragraph}`))),
    element(
      'div',
      'report-actions',
      actionButton(t('victory.continue'), () => modal.close()),
      actionButton(t('victory.wiki'), () => window.open(WIKI_URL, '_blank', 'noopener'), { className: 'action-button primary' }),
    ),
  );
}
