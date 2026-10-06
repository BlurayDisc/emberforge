import type { CrafterView } from '../game';
import type { Item } from '../model/item';
import { element } from './dom';
import { createCrafterPortrait } from './crafterPortraitArt';
import { t } from './i18n';
import { createItemPortrait } from './itemPortrait';
import { createItemCard } from './itemText';
import { createExperienceGainBar } from './liveBars';
import { openModal } from './modal';

export interface CraftCollectResult {
  crafterAfter: CrafterView;
  levelBefore: number;
  experienceGained: number;
  item: Item;
}

// Same bar as the fight result: a level up leaves only the gold part, because the bar starts again from empty.
function createCrafterExperienceBar({ crafterAfter, levelBefore, experienceGained }: CraftCollectResult): HTMLElement {
  const reachedNewLevel = crafterAfter.level > levelBefore;
  const experienceGainedInThisLevel = reachedNewLevel ? crafterAfter.experience : Math.min(experienceGained, crafterAfter.experience);
  return createExperienceGainBar(
    crafterAfter.experience - experienceGainedInThisLevel,
    experienceGainedInThisLevel,
    crafterAfter.experienceToNextLevel,
    t('workshop.collectExperienceLabel', { level: crafterAfter.level, experience: experienceGained }),
  );
}

export function openCraftCollectSummary(result: CraftCollectResult): void {
  const { crafterAfter, levelBefore, item } = result;
  const crafterText = element('div', 'result-hero-text', element('div', 'card-title', t(`profession.${crafterAfter.professionId}`)));
  if (crafterAfter.level > levelBefore) crafterText.append(element('div', 'level-up', t('result.levelUp', { level: crafterAfter.level })));
  crafterText.append(createCrafterExperienceBar(result), element('div', 'card-text small', t('workshop.crafterXp', { current: crafterAfter.experience, next: crafterAfter.experienceToNextLevel })));
  const content = element(
    'div',
    'craft-summary',
    element('div', 'result-hero', createCrafterPortrait(crafterAfter.professionId, 2), crafterText),
    element('div', 'section-title', t('workshop.collectNewItem')),
    element('div', 'modal-columns', createItemPortrait(item), createItemCard(item)),
    element('div', 'card-text small', t('workshop.collectInBackpack')),
  );
  openModal(t('workshop.collectTitle'), content);
}
