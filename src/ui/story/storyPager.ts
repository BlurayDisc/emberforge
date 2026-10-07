import { actionButton, element } from '../dom';
import { t } from '../i18n';
import { openModal } from '../modal';
import { drawingToImage } from '../pixelDraw';
import { setStoryMusicActive } from '../storyMusic';
import { STORY_SCENES } from './storyScenes';

export interface StoryPage {
  sceneId: string;
  text: string;
  // An ember page is the voice of Elowen in the dwarf hearth.
  isEmber?: boolean;
}

export interface StoryPagerOptions {
  title: string;
  heading?: string;
  pages: readonly StoryPage[];
  canSkip: boolean;
  finishLabel?: string;
  onFinished?: () => void;
}

// Every page sits in the same grid cell, and the tallest one sets the size.
// So the text, the picture and the buttons never move when the page changes.
// The story music plays while the window is open.
export function openStoryPager({ title, heading, pages, canSkip, finishLabel, onFinished }: StoryPagerOptions): void {
  const pictures = pages.map((page) => {
    const drawScene = STORY_SCENES[page.sceneId];
    if (!drawScene) throw new Error(`Unknown story scene: ${page.sceneId}`);
    return element('div', 'story-slot', drawingToImage(drawScene(), 1, 'pixel-icon story-picture'));
  });
  const texts = pages.map((page) => element('p', `story-slot lore-text story-text${page.isEmber ? ' story-ember' : ''}`, page.text));
  const dots = pages.map(() => element('span', 'story-dot'));
  const content = element('div', 'panel-body');
  setStoryMusicActive(true);
  const modal = openModal(title, content, () => {
    setStoryMusicActive(false);
    onFinished?.();
  });
  let pageIndex = 0;

  const skipButton = actionButton(t('lore.skip'), () => modal.close());
  const nextButton = actionButton('', () => {
    if (pageIndex === pages.length - 1) modal.close();
    else showPage(pageIndex + 1);
  }, { className: 'action-button primary footer-action' });

  function showPage(index: number): void {
    pageIndex = index;
    const isLastPage = index === pages.length - 1;
    [...pictures, ...texts].forEach((slot, slotIndex) => slot.classList.toggle('story-slot-active', slotIndex % pages.length === index));
    dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index));
    nextButton.textContent = isLastPage ? (finishLabel ?? t('story.done')) : t('lore.next');
    skipButton.classList.toggle('story-hidden', isLastPage || !canSkip);
  }

  content.append(
    ...(heading ? [element('div', 'section-title', heading)] : []),
    element('div', 'story-stack story-picture-frame', ...pictures),
    element('div', 'story-stack', ...texts),
    element('div', 'story-dots', ...dots),
    element('div', 'panel-footer', skipButton, nextButton),
  );
  showPage(0);
  nextButton.focus();
}
