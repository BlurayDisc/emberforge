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

const SPRITE_DRAWERS: Readonly<Record<ClassId, (colors: HeroColors) => HTMLCanvasElement>> = {
  warrior: drawWarriorSprite,
  archer: drawArcherSprite,
  mage: drawMageSprite,
  priest: drawPriestSprite,
  thief: drawThiefSprite,
  barbarian: drawBarbarianSprite,
  fighter: drawFighterSprite,
};

export function drawHeroSprite(classId: ClassId, heroName: string): HTMLCanvasElement {
  return SPRITE_DRAWERS[classId](heroColorsOf(pickHeroAppearance(classId, heroName)));
}
