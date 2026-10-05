import { actionButton, element } from '../dom';
import { t } from '../i18n';
import { openModal } from '../modal';
import { drawingToImage, type PixelDrawing } from '../pixelDraw';
import { drawBrokenTower } from './sceneBrokenTower';
import { drawColdForge } from './sceneColdForge';
import { drawRoadEast } from './sceneRoadEast';
import { drawSmithShop } from './sceneSmithShop';
import { drawThroneHall } from './sceneThroneHall';

const PAGE_DRAWERS: ReadonlyArray<() => PixelDrawing> = [drawColdForge, drawBrokenTower, drawThroneHall, drawSmithShop, drawRoadEast];

// Every page sits in the same grid cell, and the tallest one sets the size.
// So the text, the picture and the buttons never move when the page changes.
export function openStoryBook(onFinished: () => void): void {
  const pictures = PAGE_DRAWERS.map((drawPage) => element('div', 'story-slot', drawingToImage(drawPage(), 1, 'pixel-icon story-picture')));
  const texts = PAGE_DRAWERS.map((_, index) => element('p', 'story-slot lore-text story-text', t(`lore.prologue.${index + 1}`)));
  const dots = PAGE_DRAWERS.map(() => element('span', 'story-dot'));
  const content = element('div', 'panel-body');
  const modal = openModal(t('lore.prologue.title'), content, onFinished);
  let pageIndex = 0;

  const skipButton = actionButton(t('lore.skip'), () => modal.close());
  const nextButton = actionButton('', () => {
    if (pageIndex === PAGE_DRAWERS.length - 1) modal.close();
    else showPage(pageIndex + 1);
  }, { className: 'action-button primary' });

  function showPage(index: number): void {
    pageIndex = index;
    const isLastPage = index === PAGE_DRAWERS.length - 1;
    [...pictures, ...texts].forEach((slot, slotIndex) => slot.classList.toggle('story-slot-active', slotIndex % PAGE_DRAWERS.length === index));
    dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index));
    nextButton.textContent = isLastPage ? t('lore.begin') : t('lore.next');
    skipButton.classList.toggle('story-hidden', isLastPage);
  }

  content.append(
    element('div', 'story-stack story-picture-frame', ...pictures),
    element('div', 'story-stack', ...texts),
    element('div', 'story-dots', ...dots),
    element('div', 'panel-footer story-footer', skipButton, nextButton),
  );
  showPage(0);
  nextButton.focus();
}
