import { healthBarTopY, type UnitVisual } from './battleUnitVisual';

const GAP_BETWEEN_BARS_PIXELS = 1;

function isDrawn(visual: UnitVisual): boolean {
  return visual.defeatedStartSeconds === 0;
}

// Units that fight at close range stand over each other, and so do their bars. The bar of the unit nearer the front keeps its place,
// and a bar behind it moves up until no two bars cover each other. It sorts the array in place and allocates nothing, so it can run in each frame.
export function spreadOverlappingHealthBars(visuals: UnitVisual[]): void {
  for (let index = 1; index < visuals.length; index++) {
    const moving = visuals[index] as UnitVisual;
    let slot = index - 1;
    while (slot >= 0 && (visuals[slot] as UnitVisual).feetY < moving.feetY) {
      visuals[slot + 1] = visuals[slot] as UnitVisual;
      slot -= 1;
    }
    visuals[slot + 1] = moving;
  }
  for (let index = 0; index < visuals.length; index++) {
    const visual = visuals[index] as UnitVisual;
    if (!isDrawn(visual)) continue;
    let top = healthBarTopY(visual);
    for (let attempt = 0; attempt < visuals.length; attempt++) {
      let hasMoved = false;
      for (let placedIndex = 0; placedIndex < index; placedIndex++) {
        const placed = visuals[placedIndex] as UnitVisual;
        if (!isDrawn(placed)) continue;
        const sharesColumn = Math.abs(visual.centerX - placed.centerX) < visual.healthBarHalfWidth + placed.healthBarHalfWidth;
        const placedTop = placed.healthBar.sprite.y;
        const sharesRow = Math.abs(top - placedTop) < visual.healthBarHeight + GAP_BETWEEN_BARS_PIXELS;
        if (sharesColumn && sharesRow) {
          top = placedTop - visual.healthBarHeight - GAP_BETWEEN_BARS_PIXELS;
          hasMoved = true;
        }
      }
      if (!hasMoved) break;
    }
    visual.healthBar.sprite.y = top;
  }
}
