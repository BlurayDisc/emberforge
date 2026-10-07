import type { PixelDrawing } from '../pixelDraw';
import { drawColdForge } from './sceneColdForge';
import { drawBrokenTower } from './sceneBrokenTower';
import { drawThroneHall } from './sceneThroneHall';
import { drawSmithShop } from './sceneSmithShop';
import { drawRoadEast } from './sceneRoadEast';
import { drawTavern } from './sceneTavern';
import { drawFirstSword } from './sceneFirstSword';
import { drawCellarDoor } from './sceneCellarDoor';
import { drawColdWall } from './sceneColdWall';
import { drawScarecrowField } from './sceneScarecrowField';
import { drawCampfire } from './sceneCampfire';
import { drawSunkenMill } from './sceneSunkenMill';
import { drawWolfTrail } from './sceneWolfTrail';
import { drawGoblinTent } from './sceneGoblinTent';
import { drawStewardCoins } from './sceneStewardCoins';
import { drawHollowTree } from './sceneHollowTree';
import { drawDwarfMural } from './sceneDwarfMural';
import { drawChiefLair } from './sceneChiefLair';
import { drawRoyalGrain } from './sceneRoyalGrain';
import { drawKingRibbon } from './sceneKingRibbon';
import { drawTownAtDusk } from './sceneTownAtDusk';
import { drawEmberVoice } from './sceneEmberVoice';
import { drawRoadEastDawn } from './sceneRoadEastDawn';

// Every picture of the story, by id. A story page names its picture with one of these ids.
export const STORY_SCENES: Readonly<Record<string, () => PixelDrawing>> = {
  coldForge: drawColdForge,
  brokenTower: drawBrokenTower,
  throneHall: drawThroneHall,
  smithShop: drawSmithShop,
  roadEast: drawRoadEast,
  tavern: drawTavern,
  firstSword: drawFirstSword,
  cellarDoor: drawCellarDoor,
  coldWall: drawColdWall,
  scarecrowField: drawScarecrowField,
  campfire: drawCampfire,
  sunkenMill: drawSunkenMill,
  wolfTrail: drawWolfTrail,
  goblinTent: drawGoblinTent,
  stewardCoins: drawStewardCoins,
  hollowTree: drawHollowTree,
  dwarfMural: drawDwarfMural,
  chiefLair: drawChiefLair,
  royalGrain: drawRoyalGrain,
  kingRibbon: drawKingRibbon,
  townAtDusk: drawTownAtDusk,
  emberVoice: drawEmberVoice,
  roadEastDawn: drawRoadEastDawn,
};
