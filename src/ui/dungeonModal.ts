import { DUNGEONS, type DungeonDefinition } from '../content/dungeons';
import { requireById } from '../content/lookup';
import { MONSTERS, type MonsterDefinition } from '../content/monsters';
import { dungeonBackdropCanvas, monsterSpriteCanvas } from './artProviders';
import { element } from './dom';
import { materialName } from './displayNames';
import { t } from './i18n';
import { createMaterialIcon } from './iconArt';
import { openModal } from './modal';
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

function renderMonsterEntry(monster: MonsterDefinition, dungeon: DungeonDefinition): HTMLElement {
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
      ...monster.drops.map(renderLootLine),
    ),
  );
}

// A big dungeon picture gives each dungeon an identity. Below it: the monsters and what each one drops.
export function openDungeonView(dungeonId: string): void {
  const dungeon = requireById(DUNGEONS, dungeonId);
  const backdrop = dungeonBackdropCanvas(dungeon.id);
  const monsters = monsterIdsOf(dungeon).map((monsterId) => requireById(MONSTERS, monsterId));
  const content = element(
    'div',
    'dungeon-view',
    element('div', 'dungeon-portrait', backdrop ?? ''),
    element('p', 'card-text', t(`dungeon.${dungeon.id}.description`)),
    element('div', 'card-text small level-ok', t('dungeons.recommended', { min: dungeon.recommendedMinLevel, max: dungeon.recommendedMaxLevel })),
    element('div', 'section-title', t('dungeons.creeps')),
    ...monsters.map((monster) => renderMonsterEntry(monster, dungeon)),
    element('p', 'hint', t('dungeons.lootHint')),
  );
  openModal(t(`dungeon.${dungeon.id}`), content);
}
