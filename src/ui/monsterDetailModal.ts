import type { DungeonDefinition } from '../content/dungeons';
import { requireById } from '../content/lookup';
import { MATERIALS } from '../content/materials';
import { MONSTER_SPELLS } from '../content/monsterSpells';
import type { MonsterDefinition } from '../content/monsters';
import { describeMonsterStatistics } from '../game';
import { monsterSpriteCanvas } from './artProviders';
import { element } from './dom';
import { materialName } from './displayNames';
import { t } from './i18n';
import { createMaterialIcon } from './iconArt';
import { formatStatValue, statName } from './itemStatTable';
import { openModal } from './modal';
import { describeMonsterSpell, spellName } from './spellText';

export interface MonsterDetailOptions {
  showsDropRates: boolean;
  showsMonsterStatistics: boolean;
}

export function monsterRankTag(monster: MonsterDefinition): string {
  return rankTag(monster);
}

function rankTag(monster: MonsterDefinition): string {
  if (monster.rank === 'rare') return ` (${t('dungeons.rareTag')})`;
  if (monster.rank === 'boss') return ` (${t('dungeons.bossLabel')})`;
  return '';
}

function renderLootLine(drop: MonsterDefinition['drops'][number], showsDropRates: boolean): HTMLElement {
  const material = requireById(MATERIALS, drop.materialId);
  const quantity = drop.minQuantity === drop.maxQuantity ? String(drop.minQuantity) : `${drop.minQuantity}-${drop.maxQuantity}`;
  return element(
    'div',
    'loot-line',
    createMaterialIcon(material.id, material.category, 2),
    element('span', 'card-text small', showsDropRates ? t('dungeons.dropLine', { material: materialName(material.id), quantity, chance: Math.round(drop.chance * 100) }) : t('dungeons.dropLineNoChance', { material: materialName(material.id), quantity })),
  );
}

function renderStatisticsLine(monster: MonsterDefinition, dungeon: DungeonDefinition): HTMLElement {
  const statistics = describeMonsterStatistics(monster.id, dungeon.level);
  const parts: Array<[string, number]> = [
    ['health', statistics.health],
    [statistics.attackKind === 'magic' ? 'magicalDamage' : 'physicalDamage', statistics.attack],
    ['armour', statistics.armour],
    ['resistance', statistics.resistance],
    ['attackSeconds', statistics.attackSeconds],
  ];
  return element('div', 'card-text small', parts.map(([stat, value]) => `${statName(stat)} ${formatStatValue(stat, value)}`).join(' - '));
}

function renderMonsterSpellLines(monster: MonsterDefinition): HTMLElement[] {
  return (monster.spellIds ?? []).flatMap((spellId) => {
    const spell = MONSTER_SPELLS.find((candidate) => candidate.id === spellId);
    return spell ? [element('div', 'card-text small', t('dungeons.monsterSpell', { name: spellName(spell.id), effect: describeMonsterSpell(spell), seconds: spell.cooldownSeconds }))] : [];
  });
}

function renderMonsterEntry(monster: MonsterDefinition, dungeon: DungeonDefinition, options: MonsterDetailOptions): HTMLElement {
  const sprite = monsterSpriteCanvas(monster.spriteKey);
  return element(
    'div',
    'monster-entry',
    element('div', 'monster-sprite', sprite ?? ''),
    element(
      'div',
      'monster-details',
      element('div', 'card-title', `${t(`monster.${monster.id}`)}${rankTag(monster)}`),
      element('div', 'card-text small lore-text', t(`monster.${monster.id}.lore`)),
      element('div', 'card-text small', t('dungeons.monsterLevel', { level: dungeon.level })),
      options.showsMonsterStatistics ? renderStatisticsLine(monster, dungeon) : element('div', 'card-text small hint', t('dungeons.statisticsLocked')),
      ...renderMonsterSpellLines(monster),
      ...monster.drops.map((drop) => renderLootLine(drop, options.showsDropRates)),
      ...(options.showsDropRates ? [] : [element('div', 'card-text small hint', t('dungeons.dropsLocked'))]),
    ),
  );
}

// The dungeon screen shows only the picture and the name of each monster, so it fits one screen. A tap opens these details.
export function openMonsterDetail(monster: MonsterDefinition, dungeon: DungeonDefinition, options: MonsterDetailOptions): void {
  openModal(t(`monster.${monster.id}`), element('div', 'dungeon-view', renderMonsterEntry(monster, dungeon, options), element('p', 'hint', t('dungeons.lootHint'))));
}
