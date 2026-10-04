import { DUNGEONS, type DungeonDefinition } from '../content/dungeons';
import { requireById } from '../content/lookup';
import { MONSTER_SPELLS } from '../content/monsterSpells';
import { MONSTERS, type MonsterDefinition } from '../content/monsters';
import { describeMonsterStatistics } from '../game';
import { dungeonBackdropCanvas, monsterSpriteCanvas } from './artProviders';
import { actionButton, element } from './dom';
import { materialName } from './displayNames';
import { statName } from './itemStatTable';
import { t } from './i18n';
import { createMaterialIcon } from './iconArt';
import { openModal, type ModalHandle } from './modal';
import { describeMonsterSpell, spellName } from './spellText';
import { MATERIALS } from '../content/materials';

function monsterIdsOf(dungeon: DungeonDefinition): string[] {
  return [...dungeon.monsterIds, ...(dungeon.rareMonsterId ? [dungeon.rareMonsterId] : []), ...(dungeon.bossMonsterId ? [dungeon.bossMonsterId] : [])];
}

function rankTag(monster: MonsterDefinition): string {
  if (monster.rank === 'rare') return ` (${t('dungeons.rareTag')})`;
  if (monster.rank === 'boss') return ` (${t('dungeons.bossLabel')})`;
  return '';
}

function renderLootLine(drop: MonsterDefinition['drops'][number]): HTMLElement {
  const material = requireById(MATERIALS, drop.materialId);
  const quantity = drop.minQuantity === drop.maxQuantity ? String(drop.minQuantity) : `${drop.minQuantity}-${drop.maxQuantity}`;
  return element(
    'div',
    'loot-line',
    createMaterialIcon(material.id, material.category, 2),
    element('span', 'card-text small', t('dungeons.dropLine', { material: materialName(material.id), quantity, chance: Math.round(drop.chance * 100) })),
  );
}

export interface DungeonViewOptions {
  showsDropRates: boolean;
  showsMonsterStatistics: boolean;
  // Set only for a dungeon that is free to start. The details window then shows the same Fight button as the list.
  fight?: { isEnabled: boolean; start: () => void };
}

function renderStatisticsLine(monster: MonsterDefinition, dungeon: DungeonDefinition): HTMLElement {
  const statistics = describeMonsterStatistics(monster.id, dungeon.level);
  const parts: Array<[string, number]> = [
    ['health', statistics.health],
    ['physicalDamage', statistics.attack],
    ['armour', statistics.armour],
    ['resistance', statistics.resistance],
    ['speed', statistics.speed],
  ];
  return element('div', 'card-text small', parts.map(([stat, value]) => `${statName(stat)} ${value}`).join(' - '));
}

function renderMonsterSpellLines(monster: MonsterDefinition): HTMLElement[] {
  return (monster.spellIds ?? []).flatMap((spellId) => {
    const spell = MONSTER_SPELLS.find((candidate) => candidate.id === spellId);
    return spell ? [element('div', 'card-text small', t('dungeons.monsterSpell', { name: spellName(spell.id), effect: describeMonsterSpell(spell), seconds: spell.cooldownSeconds }))] : [];
  });
}

function renderMonsterEntry(monster: MonsterDefinition, dungeon: DungeonDefinition, options: DungeonViewOptions): HTMLElement {
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
      ...(options.showsDropRates ? monster.drops.map(renderLootLine) : [element('div', 'card-text small hint', t('dungeons.dropsLocked'))]),
    ),
  );
}

// A big dungeon picture gives each dungeon an identity. Below it: the monsters and what each one drops.
export function openDungeonView(dungeonId: string, options: DungeonViewOptions): void {
  const dungeon = requireById(DUNGEONS, dungeonId);
  const backdrop = dungeonBackdropCanvas(dungeon.id);
  const monsters = monsterIdsOf(dungeon).map((monsterId) => requireById(MONSTERS, monsterId));
  let handle: ModalHandle;
  const fightButton = options.fight
    ? actionButton(t('dungeons.start'), () => {
        handle.close();
        options.fight?.start();
      }, { className: 'action-button primary', disabled: !options.fight.isEnabled })
    : null;
  const content = element(
    'div',
    'dungeon-view',
    element('div', 'dungeon-portrait', backdrop ?? ''),
    element('p', 'card-text', t(`dungeon.${dungeon.id}.description`)),
    element('div', 'card-text small', t('dungeons.levelRange', { min: dungeon.minimumHeroLevel, max: dungeon.recommendedMaxLevel })),
    ...(fightButton ? [fightButton] : []),
    element('div', 'section-title', t('dungeons.creeps')),
    ...monsters.map((monster) => renderMonsterEntry(monster, dungeon, options)),
    ...(options.showsDropRates ? [element('p', 'hint', t('dungeons.lootHint'))] : []),
  );
  handle = openModal(t(`dungeon.${dungeon.id}`), content);
}
