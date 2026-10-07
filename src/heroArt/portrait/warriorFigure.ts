import type { HeroColors } from '../heroPalette';
import { paintKnightFist, paintKnightPauldrons, paintKnightSword, paintKnightSwordArm } from '../warriorPortraitArms';
import { paintKnightCape, paintKnightLegs, paintKnightTabard, paintKnightTorso } from '../warriorPortraitBody';
import { paintKnightHead } from '../warriorPortraitHead';
import { paintKnightShield } from '../warriorPortraitShield';
import { finishPortrait, startPortrait } from './portraitFrame';

const HELM_LEFT = 11;
const HELM_TOP = 1;

export function drawWarriorFigure(colors: HeroColors): HTMLCanvasElement {
  const drawing = startPortrait();
  const { painter } = drawing;
  paintKnightCape(painter);
  paintKnightLegs(painter, colors);
  paintKnightTorso(painter, colors);
  paintKnightTabard(painter, colors);
  paintKnightSwordArm(painter, colors);
  paintKnightHead(painter, colors, HELM_LEFT, HELM_TOP);
  paintKnightPauldrons(painter, colors);
  paintKnightSword(painter, colors);
  paintKnightFist(painter, colors);
  paintKnightShield(painter, colors);
  return finishPortrait(drawing);
}
