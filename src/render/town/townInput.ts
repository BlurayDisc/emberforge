import type { TownScroll } from './townScroll';

const DRAG_START_DISTANCE_PIXELS = 6;
const TAP_PROTECTION_MILLISECONDS = 120;
const VELOCITY_SMOOTHING = 0.35;
const KEY_SLIDE_FRACTION = 0.6;
const WHEEL_SPEED = 1;

export interface TownInput {
  // True while a drag runs, and for a moment after it. A building tap in that moment is part of the drag, so it is ignored.
  isDragging(): boolean;
}

// Drag with a finger or the mouse, the wheel, and the arrow keys all move the town view.
export function attachTownInput(frame: HTMLElement, scroll: TownScroll, viewWidth: () => number, isBlocked: () => boolean): TownInput {
  let isTracking = false;
  let isDragging = false;
  let dragEndedAtMilliseconds = -Infinity;
  let startX = 0;
  let lastX = 0;
  let lastMilliseconds = 0;
  let velocityPixelsPerSecond = 0;
  const logicalPerScreenPixel = (): number => viewWidth() / Math.max(1, frame.clientWidth);

  frame.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || isBlocked() || frame.dataset.engine !== 'pixi') return;
    isTracking = true;
    isDragging = false;
    startX = lastX = event.clientX;
    lastMilliseconds = event.timeStamp;
    velocityPixelsPerSecond = 0;
  });
  frame.addEventListener('pointermove', (event) => {
    if (!isTracking || !event.isPrimary) return;
    if (!isDragging && Math.abs(event.clientX - startX) >= DRAG_START_DISTANCE_PIXELS) {
      isDragging = true;
      frame.setPointerCapture(event.pointerId);
    }
    if (!isDragging) return;
    const distance = -(event.clientX - lastX) * logicalPerScreenPixel();
    const seconds = Math.max(0.001, (event.timeStamp - lastMilliseconds) / 1000);
    velocityPixelsPerSecond = velocityPixelsPerSecond * (1 - VELOCITY_SMOOTHING) + (distance / seconds) * VELOCITY_SMOOTHING;
    scroll.dragBy(distance);
    lastX = event.clientX;
    lastMilliseconds = event.timeStamp;
  });
  const endTracking = (event: PointerEvent): void => {
    if (!isTracking || !event.isPrimary) return;
    isTracking = false;
    if (!isDragging) return;
    isDragging = false;
    dragEndedAtMilliseconds = event.timeStamp;
    if (event.timeStamp - lastMilliseconds < 80) scroll.fling(velocityPixelsPerSecond);
  };
  frame.addEventListener('pointerup', endTracking);
  frame.addEventListener('pointercancel', endTracking);

  frame.addEventListener(
    'wheel',
    (event) => {
      if (isBlocked() || frame.dataset.engine !== 'pixi') return;
      event.preventDefault();
      const distance = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      scroll.dragBy(distance * WHEEL_SPEED * logicalPerScreenPixel());
    },
    { passive: false },
  );

  document.addEventListener('keydown', (event) => {
    if (isBlocked() || frame.dataset.engine !== 'pixi') return;
    if (event.key === 'ArrowLeft') scroll.slideBy(-viewWidth() * KEY_SLIDE_FRACTION);
    if (event.key === 'ArrowRight') scroll.slideBy(viewWidth() * KEY_SLIDE_FRACTION);
  });

  return { isDragging: () => isDragging || performance.now() - dragEndedAtMilliseconds < TAP_PROTECTION_MILLISECONDS };
}
