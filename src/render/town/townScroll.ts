const SLIDE_EASING_PER_SECOND = 9;
const FLING_FRICTION_PER_SECOND = 4.5;
const FLING_STOP_SPEED = 10;

export interface TownScroll {
  // The world pixel at the left edge of the view. Always a whole number.
  scrollLeft(): number;
  setViewWidth(viewWidth: number): void;
  jumpTo(scrollLeft: number): void;
  // Slides to a place a distance away.
  slideBy(distance: number): void;
  // Moves at once, as a finger drag does. A slide or a fling in progress stops.
  dragBy(distance: number): void;
  // The finger lets go at this speed. The view coasts and slows down.
  fling(pixelsPerSecond: number): void;
  canMove(direction: -1 | 1): boolean;
  // Returns true when the view moved.
  advance(deltaSeconds: number): boolean;
}

export function createTownScroll(worldWidth: number, initialViewWidth: number): TownScroll {
  let viewWidth = initialViewWidth;
  let position = 0;
  let slideTarget: number | null = null;
  let velocity = 0;
  const maximum = (): number => Math.max(0, worldWidth - viewWidth);
  const clamp = (value: number): number => Math.max(0, Math.min(maximum(), value));
  const stopMotion = (): void => {
    slideTarget = null;
    velocity = 0;
  };

  return {
    scrollLeft: () => Math.round(position),
    setViewWidth: (newViewWidth) => {
      viewWidth = newViewWidth;
      position = clamp(position);
      if (slideTarget !== null) slideTarget = clamp(slideTarget);
    },
    jumpTo: (scrollLeft) => {
      stopMotion();
      position = clamp(scrollLeft);
    },
    slideBy: (distance) => {
      velocity = 0;
      slideTarget = clamp((slideTarget ?? position) + distance);
    },
    dragBy: (distance) => {
      stopMotion();
      position = clamp(position + distance);
    },
    fling: (pixelsPerSecond) => {
      slideTarget = null;
      velocity = pixelsPerSecond;
    },
    canMove: (direction) => (direction < 0 ? Math.round(position) > 0 : Math.round(position) < maximum()),
    advance: (deltaSeconds) => {
      const before = Math.round(position);
      if (velocity !== 0) {
        position = clamp(position + velocity * deltaSeconds);
        velocity *= Math.exp(-FLING_FRICTION_PER_SECOND * deltaSeconds);
        if (Math.abs(velocity) < FLING_STOP_SPEED || position === 0 || position === maximum()) velocity = 0;
      } else if (slideTarget !== null) {
        const remaining = slideTarget - position;
        const step = Math.max(1, Math.abs(remaining) * Math.min(1, deltaSeconds * SLIDE_EASING_PER_SECOND));
        if (Math.abs(remaining) <= step) {
          position = slideTarget;
          slideTarget = null;
        } else {
          position += Math.sign(remaining) * step;
        }
      }
      return Math.round(position) !== before;
    },
  };
}
