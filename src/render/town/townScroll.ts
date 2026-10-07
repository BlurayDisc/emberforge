const SLIDE_EASING_PER_SECOND = 9;
const SWIPE_SPEED_FOR_NEXT_PAGE = 120;

export interface TownScroll {
  // The world pixel at the left edge of the view. Always a whole number.
  scrollLeft(): number;
  setViewWidth(viewWidth: number): void;
  // The page the view shows or slides to. A drag in progress does not change it until the finger lets go.
  targetPage(): number;
  // The page whose centre is nearest to the centre of the view.
  nearestPage(): number;
  jumpToPage(page: number): void;
  slideToPage(page: number): void;
  // Follows the finger. Stops a slide in progress.
  dragBy(distance: number): void;
  // The finger lets go at this speed. The view slides to the next page on a fast swipe, or to the nearest page.
  release(pixelsPerSecond: number): void;
  canMove(direction: -1 | 1): boolean;
  // Returns true when the view moved.
  advance(deltaSeconds: number): boolean;
}

// The town has a fixed number of pages. Each page is centred in the view, so a wide view also shows a little of its neighbours.
export function createTownScroll(worldWidth: number, pageCount: number, initialViewWidth: number): TownScroll {
  const pageWidth = worldWidth / pageCount;
  let viewWidth = initialViewWidth;
  let position = 0;
  let page = 0;
  let isDragging = false;
  let isSliding = false;
  const maximum = (): number => Math.max(0, worldWidth - viewWidth);
  const clamp = (value: number): number => Math.max(0, Math.min(maximum(), value));
  const clampPage = (value: number): number => Math.max(0, Math.min(pageCount - 1, value));
  const scrollLeftOfPage = (target: number): number => clamp(target * pageWidth + pageWidth / 2 - viewWidth / 2);
  const nearestPage = (): number => clampPage(Math.floor((position + viewWidth / 2) / pageWidth));

  return {
    scrollLeft: () => Math.round(position),
    setViewWidth: (newViewWidth) => {
      viewWidth = newViewWidth;
      if (isDragging) position = clamp(position);
      else position = scrollLeftOfPage(page);
      isSliding = false;
    },
    targetPage: () => page,
    nearestPage,
    jumpToPage: (target) => {
      page = clampPage(target);
      isDragging = false;
      isSliding = false;
      position = scrollLeftOfPage(page);
    },
    slideToPage: (target) => {
      page = clampPage(target);
      isDragging = false;
      isSliding = true;
    },
    dragBy: (distance) => {
      if (!isDragging) page = nearestPage();
      isDragging = true;
      isSliding = false;
      position = Math.max(scrollLeftOfPage(0), Math.min(scrollLeftOfPage(pageCount - 1), position + distance));
    },
    release: (pixelsPerSecond) => {
      if (!isDragging) return;
      isDragging = false;
      isSliding = true;
      if (Math.abs(pixelsPerSecond) >= SWIPE_SPEED_FOR_NEXT_PAGE) page = clampPage(page + Math.sign(pixelsPerSecond));
      else page = nearestPage();
    },
    canMove: (direction) => maximum() > 0 && clampPage(page + direction) !== page,
    advance: (deltaSeconds) => {
      if (!isSliding) return false;
      const before = Math.round(position);
      const remaining = scrollLeftOfPage(page) - position;
      const step = Math.max(1, Math.abs(remaining) * Math.min(1, deltaSeconds * SLIDE_EASING_PER_SECOND));
      if (Math.abs(remaining) <= step) {
        position = scrollLeftOfPage(page);
        isSliding = false;
      } else {
        position += Math.sign(remaining) * step;
      }
      return Math.round(position) !== before;
    },
  };
}
