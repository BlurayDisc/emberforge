import { castleSpot, castleTaleKeys } from '../content/castle';
import { castleFigureCanvas } from './artProviders';
import { groupTalesIntoPages } from './castleTalePages';
import { actionButton, element } from './dom';
import { t } from './i18n';
import { isCastleChapterOneCleared } from './castleVisit';
import { openModal } from './modal';

// A person or a place in the castle tells its story. The tales are the keys castle.<id>.tale.1 to castle.<id>.tale.<n>, and after chapter 1 also castle.<id>.tale.after1.<n>.
// The tales are split into pages. Every page sits in the same grid cell, and the tallest one sets the size, so nothing moves when the page changes.
export function openCastleStory(spotId: string): void {
  const spot = castleSpot(spotId);
  const portrait = spot.look === null ? null : castleFigureCanvas(spot.look);
  const taleTexts = castleTaleKeys(spot, isCastleChapterOneCleared()).map((key) => t(key));
  const pageSlots = groupTalesIntoPages(taleTexts).map((page) => element('div', 'story-slot castle-page', ...page.map((text) => element('p', 'card-text castle-tale', text))));
  const dots = pageSlots.map(() => element('span', 'story-dot'));
  const content = element('div', 'panel-body');
  const modal = openModal(t(`castle.${spot.id}.name`), content, undefined, undefined, true);
  let pageIndex = 0;

  const previousButton = actionButton(t('lore.previous'), () => showPage(pageIndex - 1));
  const nextButton = actionButton('', () => {
    if (pageIndex === pageSlots.length - 1) modal.close();
    else showPage(pageIndex + 1);
  }, { className: 'action-button primary footer-action' });

  function showPage(index: number): void {
    pageIndex = index;
    pageSlots.forEach((slot, slotIndex) => slot.classList.toggle('story-slot-active', slotIndex === index));
    dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index));
    previousButton.classList.toggle('story-hidden', index === 0);
    nextButton.textContent = index === pageSlots.length - 1 ? t('castle.farewell') : t('lore.next');
  }

  content.append(
    element(
      'div',
      'castle-story',
      ...(portrait ? [element('div', 'castle-portrait', portrait)] : []),
      element('div', 'castle-story-text', element('div', 'section-title', t(`castle.${spot.id}.title`)), element('div', 'story-stack', ...pageSlots)),
    ),
    ...(pageSlots.length > 1 ? [element('div', 'story-dots', ...dots)] : []),
    element('div', 'panel-footer', previousButton, nextButton),
  );
  showPage(0);
}
