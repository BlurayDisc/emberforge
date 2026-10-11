import { ARMOUR_SHAPE_ROWS } from './itemShapesArmour';
import { CASTER_RANGED_AND_TRINKET_SHAPE_ROWS } from './itemShapesCasterRangedAndTrinkets';
import { MELEE_SHAPE_ROWS } from './itemShapesMelee';

type Rows = readonly string[];

// One picture for each base item id. Letters are colours: see BASE_LEGEND and the material tint in iconArt.ts.
export const ITEM_SHAPE_ROWS: Readonly<Record<string, Rows>> = {
  ...MELEE_SHAPE_ROWS,
  ...CASTER_RANGED_AND_TRINKET_SHAPE_ROWS,
  ...ARMOUR_SHAPE_ROWS,
};
