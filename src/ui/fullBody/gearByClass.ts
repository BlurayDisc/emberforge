import type { ClassId } from '../../model/hero';
import type { GearDrawer } from './figureColors';
import { drawArcherGear } from './gear/archerGear';
import { drawBarbarianGear } from './gear/barbarianGear';
import { drawFighterGear } from './gear/fighterGear';
import { drawMageGear } from './gear/mageGear';
import { drawPriestGear } from './gear/priestGear';
import { drawThiefGear } from './gear/thiefGear';
import { drawWarriorGear } from './gear/warriorGear';

export const GEAR_BY_CLASS: Record<ClassId, GearDrawer> = {
  warrior: drawWarriorGear,
  archer: drawArcherGear,
  mage: drawMageGear,
  priest: drawPriestGear,
  thief: drawThiefGear,
  barbarian: drawBarbarianGear,
  fighter: drawFighterGear,
};
