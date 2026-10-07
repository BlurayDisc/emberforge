import { pickHeroAppearance } from '../content/heroAppearance';
import type { ClassId } from '../model/hero';
import { drawArcherSprite } from './battle/archerArt';
import { drawBarbarianSprite } from './battle/barbarianArt';
import { drawFighterSprite } from './battle/fighterArt';
import { drawMageSprite } from './battle/mageArt';
import { drawPriestSprite } from './battle/priestArt';
import { drawThiefSprite } from './battle/thiefArt';
import { drawWarriorSprite } from './battle/warriorArt';
import { heroColorsOf, type HeroColors } from './heroPalette';
import type { HeroPose } from './heroPose';

const SPRITE_DRAWERS: Readonly<Record<ClassId, (colors: HeroColors, pose?: HeroPose) => HTMLCanvasElement>> = {
  warrior: drawWarriorSprite,
  archer: drawArcherSprite,
  mage: drawMageSprite,
  priest: drawPriestSprite,
  thief: drawThiefSprite,
  barbarian: drawBarbarianSprite,
  fighter: drawFighterSprite,
};

export const CLASSES_WITH_POSES: readonly ClassId[] = ['archer', 'mage', 'priest'];

export function drawHeroSprite(classId: ClassId, heroName: string, pose: HeroPose = 'ready'): HTMLCanvasElement {
  return SPRITE_DRAWERS[classId](heroColorsOf(pickHeroAppearance(classId, heroName)), pose);
}
