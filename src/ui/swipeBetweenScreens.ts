const MINIMUM_SWIPE_DISTANCE_PX = 48;
const HORIZONTAL_DOMINANCE = 1.5;

// A finger swipe to the left shows the screen on the right, like a page turn. Only touch and pen swipe: a mouse drag would clash with clicks on buildings.
// The town overlay lets pointer events through to the canvas, so the listeners sit on the document. The caller says when its screens are in use.
export function enableSwipeBetweenScreens(isActive: () => boolean, goToNext: () => void, goToPrevious: () => void): void {
  const target = document;
  let startX = 0;
  let startY = 0;
  let trackedPointerId: number | null = null;
  let swipeJustHappened = false;

  target.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' || !event.isPrimary || !isActive()) return;
    trackedPointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
  });
  target.addEventListener('pointerup', (event) => {
    if (event.pointerId !== trackedPointerId) return;
    trackedPointerId = null;
    const distanceX = event.clientX - startX;
    const distanceY = event.clientY - startY;
    const isHorizontalSwipe = Math.abs(distanceX) >= MINIMUM_SWIPE_DISTANCE_PX && Math.abs(distanceX) > Math.abs(distanceY) * HORIZONTAL_DOMINANCE;
    if (!isHorizontalSwipe) return;
    swipeJustHappened = true;
    if (distanceX < 0) goToNext();
    else goToPrevious();
  });
  target.addEventListener('pointercancel', () => {
    trackedPointerId = null;
  });
  // A swipe that ends on a building would also click it. The click that follows the swipe is dropped.
  target.addEventListener('click', (event) => {
    if (!swipeJustHappened) return;
    swipeJustHappened = false;
    event.stopPropagation();
    event.preventDefault();
  }, true);
  target.addEventListener('pointerdown', () => {
    swipeJustHappened = false;
  }, true);
}
