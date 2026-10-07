import { drawGoblin } from './creature/goblinArt';
import { drawGoblinChief } from './creature/goblinChiefArt';
import { drawHobgoblin } from './creature/hobgoblinArt';
import { drawRat } from './creature/ratArt';
import { drawScarecrow } from './creature/scarecrowArt';
import { drawSpider } from './creature/spiderArt';
import { drawToad } from './creature/toadArt';
import { drawWolf } from './creature/wolfArt';

export const CREATURE_DRAWERS: Readonly<Record<string, () => HTMLCanvasElement>> = {
  'monster-rat': drawRat,
  'monster-wolf': drawWolf,
  'monster-scarecrow': drawScarecrow,
  'monster-goblin': drawGoblin,
  'monster-spider': drawSpider,
  'monster-toad': drawToad,
  'monster-hobgoblin': drawHobgoblin,
  'monster-goblin-chief': drawGoblinChief,
};
