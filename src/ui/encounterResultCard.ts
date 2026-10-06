import { BASE_ITEMS } from '../content/baseItems';
import { requireById } from '../content/lookup';
import { MATERIALS } from '../content/materials';
import type { EncounterResult } from '../model/gameState';
import type { Hero } from '../model/hero';
import type { Item } from '../model/item';
import type { MaterialStack } from '../model/material';
import { element } from './dom';
import { className, heroDisplayName, itemDisplayName, listOf, materialName } from './displayNames';
import { t } from './i18n';
import { createItemIcon, createMaterialIcon } from './iconArt';
import { openItemView, openMaterialView } from './itemModals';
import { experienceToNextLevel } from '../game';
import { createExperienceGainBar, createHealthLossBar } from './liveBars';
import { createLevelUpGrowth } from './levelUpGrowth';
import { createMaterialTooltip } from './materialBoxes';
import { createMoneyDisplay } from './moneyDisplay';
import { createPortrait } from './portraitArt';

function formatNumber(value: number): string {
  return value >= 100 ? String(Math.round(value)) : value.toFixed(1);
}

function createExperienceBarOf(result: EncounterResult['heroes'][number]): HTMLElement {
  const experienceGainedInThisLevel = result.reachedLevel === null ? Math.min(result.experienceGained, result.experienceAfter) : result.experienceAfter;
  return createExperienceGainBar(result.experienceAfter - experienceGainedInThisLevel, experienceGainedInThisLevel, experienceToNextLevel(result.levelAfter), t('result.experienceLabel', { level: result.levelAfter, experience: result.experienceGained }));
}

function createHealthLossBarOf(result: EncounterResult['heroes'][number]): HTMLElement {
  return createHealthLossBar(result.healthBefore, result.healthLost, result.maxHealth, t('result.healthLost', { lost: result.healthLost }));
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
  if (result.reachedLevel !== null && hero) text.append(createLevelUpGrowth(hero.classId, result.levelBefore, result.levelAfter));
  text.append(createHealthLossBarOf(result), createExperienceBarOf(result));
  return element('div', 'result-hero', hero ? createPortrait(hero.classId, hero.name, 2) : element('span', ''), text);
}

// A big box for each loot stack. Hover shows the details at once. A tap opens the same details on a touch screen.
function createLootBoxes(stacks: readonly MaterialStack[]): HTMLElement[] {
  return stacks.map((stack) => {
    const material = requireById(MATERIALS, stack.materialId);
    const box = element('button', 'loot-box', createMaterialIcon(material.id, material.category, 4), element('span', 'loot-quantity', `x${stack.quantity}`), createMaterialTooltip(material.id));
    box.type = 'button';
    box.addEventListener('click', () => openMaterialView(material.id));
    return box;
  });
}

// A dropped item shows its quality as a coloured frame. A tap opens the item details.
function createItemLootBoxes(items: readonly Item[]): HTMLElement[] {
  return items.map((item) => {
    const tooltip = element('span', 'loot-tooltip', element('strong', `quality-${item.quality}`, itemDisplayName(item)), createMoneyDisplay(item.sellValueCopper));
    const box = element('button', `loot-box quality-border-${item.quality}`, createItemIcon(item.baseId, item.materialId, requireById(BASE_ITEMS, item.baseId).mainCategory, 4), tooltip);
    box.type = 'button';
    box.addEventListener('click', () => openItemView(item));
    return box;
  });
}

export function createEncounterResultCard(result: EncounterResult, company: readonly Hero[]): HTMLElement {
  const heroRows = result.heroes.map((heroResult) =>
    createHeroResultRow(heroResult, company.find((hero) => hero.id === heroResult.heroId), result.durationSeconds),
  );
  const loot = element('div', 'result-loot');
  if (result.materials.length === 0 && result.items.length === 0) loot.append(element('span', 'card-text small', t('result.noLoot')));
  else loot.append(...createLootBoxes(result.materials), ...createItemLootBoxes(result.items));
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
  if (result.itemsWaiting.length > 0) {
    card.append(element('div', 'danger-text', t('report.itemsWaiting', { list: listOf(result.itemsWaiting.map(itemDisplayName)) })));
  }
  return card;
}
