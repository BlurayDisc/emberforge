import { LOGICAL_WIDTH } from './pixelStage';

const FIELD_MARGIN_PIXELS = 44;
const GROUND_BACK_FEET_Y = 178;
const GROUND_FRONT_FEET_Y = 232;
// A sprite is wider than the body circle of the simulation. Each side is drawn this share of its sprite width away from the circle,
// so units that touch in the simulation do not paint over each other.
const SIDE_GAP_SPRITE_FRACTION = 0.35;

export interface FieldSize {
  length: number;
  depth: number;
}

// The field is flat in the simulation. The stage draws it from the side: the field x runs left to right and the field y runs from the back to the front of the ground.
// There is no scaling by depth: the stage keeps one pixel scale.
export interface FieldProjection {
  screenX(fieldX: number): number;
  feetY(fieldY: number): number;
  sideGap(isParty: boolean, spriteWidth: number): number;
}

export function createFieldProjection(field: FieldSize): FieldProjection {
  const pixelsPerFieldUnit = (LOGICAL_WIDTH - 2 * FIELD_MARGIN_PIXELS) / field.length;
  const pixelsPerDepthUnit = (GROUND_FRONT_FEET_Y - GROUND_BACK_FEET_Y) / field.depth;
  return {
    screenX: (fieldX) => FIELD_MARGIN_PIXELS + fieldX * pixelsPerFieldUnit,
    feetY: (fieldY) => GROUND_BACK_FEET_Y + fieldY * pixelsPerDepthUnit,
    sideGap: (isParty, spriteWidth) => (isParty ? -1 : 1) * spriteWidth * SIDE_GAP_SPRITE_FRACTION,
  };
}
