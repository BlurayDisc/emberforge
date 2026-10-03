const SCROLL_EASING_PER_SECOND = 9;

export interface ScreenScroller {
  goToScreen(screenIndex: number): void;
  // Jumps with no slide.
  snapToScreen(screenIndex: number): void;
  currentScreen(): number;
  // Called with the world pixel at the left edge of the view, whenever the view moves.
  onScroll(listener: (scrollLeft: number) => void): void;
  // Tells the listeners where the view is now, without moving it.
  announce(): void;
  advance(deltaSeconds: number): void;
  scrollLeft(): number;
}

export function createScreenScroller(screenWidth: number, screenCount: number, startScreen: number): ScreenScroller {
  let targetScreen = startScreen;
  let scrollLeft = startScreen * screenWidth;
  const listeners: Array<(scrollLeft: number) => void> = [];
  const clampScreen = (screenIndex: number): number => Math.max(0, Math.min(screenCount - 1, screenIndex));
  const announce = (): void => listeners.forEach((listener) => listener(scrollLeft));
  return {
    goToScreen: (screenIndex) => {
      targetScreen = clampScreen(screenIndex);
    },
    snapToScreen: (screenIndex) => {
      targetScreen = clampScreen(screenIndex);
      scrollLeft = targetScreen * screenWidth;
    },
    currentScreen: () => targetScreen,
    onScroll: (listener) => {
      listeners.push(listener);
    },
    announce,
    scrollLeft: () => scrollLeft,
    advance: (deltaSeconds) => {
      const targetLeft = targetScreen * screenWidth;
      if (scrollLeft === targetLeft) return;
      const remaining = targetLeft - scrollLeft;
      // Each frame moves at least one whole pixel, so the slide always ends and the camera stays on whole pixels.
      const step = Math.max(1, Math.round(Math.abs(remaining) * Math.min(1, deltaSeconds * SCROLL_EASING_PER_SECOND)));
      scrollLeft = Math.abs(remaining) <= step ? targetLeft : scrollLeft + Math.sign(remaining) * step;
      announce();
    },
  };
}
