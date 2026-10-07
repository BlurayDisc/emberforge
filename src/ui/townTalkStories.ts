import { ALWAYS, type TownTalk } from './townTalkLine';
import { t } from './i18n';

// Lines that tell about the town and its people, whatever the player did. The player hears them less often than the lines about the player.
export const TOWN_STORY_TALKS: readonly TownTalk[] = [
  { key: 'talk.townHistory', paramsFor: (state) => ({ town: t(`town.${state.townId}`) }) },
  { key: 'talk.farmers', paramsFor: (state) => ({ region: t(`town.${state.townId}.region`) }) },
  { key: 'talk.smith', paramsFor: () => ALWAYS },
  { key: 'talk.keep', paramsFor: () => ALWAYS },
  { key: 'talk.princess', paramsFor: () => ALWAYS },
  { key: 'talk.castleBell', paramsFor: () => ALWAYS },
  { key: 'talk.castleOpen', paramsFor: () => ALWAYS },
  { key: 'talk.rats', paramsFor: () => ALWAYS },
  { key: 'talk.southRoad', paramsFor: () => ALWAYS },
  { key: 'talk.petTheCat', paramsFor: () => ALWAYS },
  { key: 'talk.petTheDog', paramsFor: () => ALWAYS },
  { key: 'talk.petTheHen', paramsFor: () => ALWAYS },
  { key: 'talk.turnips', paramsFor: () => ALWAYS },
  { key: 'talk.sheep', paramsFor: () => ALWAYS },
  { key: 'talk.stars', paramsFor: () => ALWAYS },
  { key: 'talk.well', paramsFor: () => ALWAYS },
  { key: 'talk.scarecrow', paramsFor: () => ALWAYS },
  { key: 'talk.bread', paramsFor: () => ALWAYS },
];
