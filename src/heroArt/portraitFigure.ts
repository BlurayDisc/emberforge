import { pickHeroAppearance } from '../content/heroAppearance';
import type { ClassId } from '../model/hero';
import { heroColorsOf, type HeroColors } from './heroPalette';
import { drawArcherFigure } from './portrait/archerFigure';
import { drawBarbarianFigure } from './portrait/barbarianFigure';
import { drawFighterFigure } from './portrait/fighterFigure';
import { drawMageFigure } from './portrait/mageFigure';
import { drawPriestFigure } from './portrait/priestFigure';
import { drawThiefFigure } from './portrait/thiefFigure';
import { drawWarriorFigure } from './portrait/warriorFigure';

const FIGURE_DRAWERS: Readonly<Record<ClassId, (colors: HeroColors) => HTMLCanvasElement>> = {
  warrior: drawWarriorFigure,
  archer: drawArcherFigure,
  mage: drawMageFigure,
  priest: drawPriestFigure,
  thief: drawThiefFigure,
  barbarian: drawBarbarianFigure,
  fighter: drawFighterFigure,
};

export function drawHeroPortraitFigure(classId: ClassId, heroName: string): HTMLCanvasElement {
  return FIGURE_DRAWERS[classId](heroColorsOf(pickHeroAppearance(classId, heroName)));
}
