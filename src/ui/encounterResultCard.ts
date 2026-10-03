import { requireById } from '../content/lookup';
import { MATERIALS } from '../content/materials';
import type { EncounterResult } from '../model/gameState';
import type { Hero } from '../model/hero';
import type { MaterialStack } from '../model/material';
import { element } from './dom';
import { className, heroDisplayName, listOf, materialName } from './displayNames';
import { t } from './i18n';
import { createMaterialIcon } from './iconArt';
import { openMaterialView } from './itemModals';
import { experienceToNextLevel } from '../game';
import { createExperienceGainBar } from './liveBars';
import { createMoneyDisplay } from './moneyDisplay';
import { createPortrait } from './portraitArt';

function formatNumber(value: number): string {
  return value >= 100 ? String(Math.round(value)) : value.toFixed(1);
}

function createExperienceBarOf(result: EncounterResult['heroes'][number]): HTMLElement {
  const experienceGainedInThisLevel = result.reachedLevel === null ? Math.min(result.experienceGained, result.experienceAfter) : result.experienceAfter;
  return createExperienceGainBar(result.experienceAfter - experienceGainedInThisLevel, experienceGainedInThisLevel, experienceToNextLevel(result.levelAfter));
}

function createHeroResultRow(result: EncounterResult['heroes'][number], hero: Hero | undefined, durationSeconds: number): HTMLElement {
  const dps = durationSeconds > 0 ? result.damageDealt / durationSeconds : 0;
  const name = hero ? heroDisplayName(hero.name) : result.heroId;
  const lines = [
    t('result.damage', { damage: result.damageDealt, dps: formatNumber(dps) }),
    t('result.taken', { taken: result.damageTaken, healing: result.healingDone }),
  ];
  const text = element('div', 'result-hero-text', element('div', 'card-title', hero ? `${name} (${className(hero.classId)})` : name), element('div', 'card-text small', listOf(lines)));
  if (result.reachedLevel !== null) text.append(element('div', 'level-up', t('result.levelUp', { level: result.reachedLevel })));
  text.append(createExperienceBarOf(result));
  return element('div', 'result-hero', hero ? createPortrait(hero.classId, hero.name, 2) : element('span', ''), text);
}

// A big box for each loot stack. Hover shows the details at once. A tap opens the same details on a touch screen.
function createLootBoxes(stacks: readonly MaterialStack[]): HTMLElement[] {
  return stacks.map((stack) => {
    const material = requireById(MATERIALS, stack.materialId);
    const tooltip = element(
      'span',
      'loot-tooltip',
      element('strong', '', materialName(material.id)),
      element('span', 'card-text small', t('inventory.materialInfo', { tier: material.tier, category: t(`category.${material.category}`) })),
      createMoneyDisplay(material.sellValueCopper),
    );
    const box = element('button', 'loot-box', createMaterialIcon(material.id, material.category, 4), element('span', 'loot-quantity', `x${stack.quantity}`), tooltip);
    box.type = 'button';
    box.addEventListener('click', () => openMaterialView(material.id));
    return box;
  });
}

export function createEncounterResultCard(result: EncounterResult, company: readonly Hero[]): HTMLElement {
  const heroRows = result.heroes.map((heroResult) =>
    createHeroResultRow(heroResult, company.find((hero) => hero.id === heroResult.heroId), result.durationSeconds),
  );
  const loot = element('div', 'result-loot');
  if (result.materials.length === 0) loot.append(element('span', 'card-text small', t('result.noLoot')));
  else loot.append(...createLootBoxes(result.materials));
  const card = element(
    'div',
    'result-card',
    element('div', 'result-title', result.won ? t('result.victory') : t('result.defeat')),
    element('div', 'card-text small', t('result.time', { seconds: formatNumber(result.durationSeconds), monsters: listOf(result.monsterIds.map((id) => t(`monster.${id}`))) })),
    ...heroRows,
    element('div', 'section-title', t('result.loot')),
    loot,
  );
  if (result.materialsWaiting.length > 0) {
    card.append(element('div', 'danger-text', t('report.materialsWaiting', { list: listOf(result.materialsWaiting.map((stack) => `${materialName(stack.materialId)} x${stack.quantity}`)) })));
  }
  return card;
}
