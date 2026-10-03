import { requireById } from '../content/lookup';
import { MATERIALS } from '../content/materials';
import type { EncounterResult } from '../model/gameState';
import type { Hero } from '../model/hero';
import { element } from './dom';
import { className, heroDisplayName, listOf, materialName } from './displayNames';
import { t } from './i18n';
import { createMaterialIcon } from './iconArt';
import { createMoneyDisplay } from './moneyDisplay';
import { createPortrait } from './portraitArt';

function formatNumber(value: number): string {
  return value >= 100 ? String(Math.round(value)) : value.toFixed(1);
}

function createHeroResultRow(result: EncounterResult['heroes'][number], hero: Hero | undefined, durationSeconds: number): HTMLElement {
  const dps = durationSeconds > 0 ? result.damageDealt / durationSeconds : 0;
  const name = hero ? heroDisplayName(hero.name) : result.heroId;
  const lines = [
    t('result.damage', { damage: result.damageDealt, dps: formatNumber(dps) }),
    t('result.taken', { taken: result.damageTaken, healing: result.healingDone }),
    t('result.xp', { xp: result.experienceGained }),
  ];
  const row = element(
    'div',
    'result-hero',
    hero ? createPortrait(hero.classId, hero.name, 2) : element('span', ''),
    element('div', 'result-hero-text', element('div', 'card-title', hero ? `${name} (${className(hero.classId)})` : name), element('div', 'card-text small', listOf(lines))),
  );
  if (result.reachedLevel !== null) row.append(element('div', 'level-up', t('result.levelUp', { level: result.reachedLevel })));
  return row;
}

function createLootRow(result: EncounterResult): HTMLElement {
  const loot = element('div', 'result-loot');
  if (result.copperGained === 0 && result.materials.length === 0) return element('div', 'card-text small', t('result.noLoot'));
  loot.append(createMoneyDisplay(result.copperGained));
  for (const stack of result.materials) {
    const material = requireById(MATERIALS, stack.materialId);
    loot.append(element('span', 'loot-chip', createMaterialIcon(material.id, material.category, 2), `${materialName(material.id)} x${stack.quantity}`));
  }
  return loot;
}

export function createEncounterResultCard(result: EncounterResult, company: readonly Hero[]): HTMLElement {
  const heroRows = result.heroes.map((heroResult) =>
    createHeroResultRow(heroResult, company.find((hero) => hero.id === heroResult.heroId), result.durationSeconds),
  );
  return element(
    'div',
    'result-card',
    element('div', 'result-title', result.won ? t('result.victory') : t('result.defeat')),
    element('div', 'card-text small', t('result.time', { seconds: formatNumber(result.durationSeconds), monsters: listOf(result.monsterIds.map((id) => t(`monster.${id}`))) })),
    ...heroRows,
    element('div', 'section-title', t('result.loot')),
    createLootRow(result),
  );
}
