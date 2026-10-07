import { DUNGEONS } from '../content/dungeons';
import type { DungeonDefinition } from '../content/dungeons';
import { requireById } from '../content/lookup';
import { MONSTERS, type MonsterDefinition } from '../content/monsters';
import type { GameStore } from '../game';
import { dungeonBackdropCanvas, monsterSpriteCanvas } from './artProviders';
import { createDungeonHeroPicker } from './dungeonHeroPicker';
import { actionButton, element } from './dom';
import { listOf, materialName } from './displayNames';
import { t } from './i18n';
import { openModal, type ModalHandle } from './modal';
import { monsterRankTag, openMonsterDetail } from './monsterDetailModal';

export interface DungeonFightOptions {
  store: GameStore;
  start: (heroIds: string[], screen: ModalHandle) => void;
}

export interface DungeonViewOptions {
  showsDropRates: boolean;
  showsMonsterStatistics: boolean;
  // Set only for a dungeon that is free to start. The screen then also holds the hero choice and the Fight button.
  fight?: DungeonFightOptions;
}

function monsterIdsOf(dungeon: DungeonDefinition): string[] {
  return [...dungeon.monsterIds, ...(dungeon.rareMonsterId ? [dungeon.rareMonsterId] : []), ...(dungeon.bossMonsterId ? [dungeon.bossMonsterId] : [])];
}

function dropNamesOf(monsters: readonly MonsterDefinition[]): string[] {
  const materialIds = new Set(monsters.flatMap((monster) => monster.drops.map((drop) => drop.materialId)));
  return [...materialIds].map((materialId) => materialName(materialId));
}

function createMonsterTile(monster: MonsterDefinition, dungeon: DungeonDefinition, options: DungeonViewOptions): HTMLElement {
  const sprite = monsterSpriteCanvas(monster.spriteKey);
  const tile = element('button', 'monster-tile', element('div', 'monster-sprite', sprite ?? ''), element('div', 'card-text small', `${t(`monster.${monster.id}`)}${monsterRankTag(monster)}`));
  tile.type = 'button';
  tile.addEventListener('click', () => openMonsterDetail(monster, dungeon, options));
  return tile;
}

// One screen with no scroll: the dungeon picture, its monsters (a tap opens the details), the hero choice and the Fight button.
// A dungeon that is locked or busy shows the same screen without the hero choice.
export function openDungeonView(dungeonId: string, options: DungeonViewOptions): void {
  const dungeon = requireById(DUNGEONS, dungeonId);
  const monsters = monsterIdsOf(dungeon).map((monsterId) => requireById(MONSTERS, monsterId));
  const { fight } = options;
  let handle: ModalHandle;
  const fightButton = actionButton(t(dungeon.minimumPartySize > 1 ? 'dungeons.startParty' : 'dungeons.start'), () => {
    if (picker) fight?.start(picker.selectedHeroIds(), handle);
  }, { className: 'action-button primary', disabled: true });
  const picker = fight ? createDungeonHeroPicker(fight.store, dungeon, () => {
    fightButton.disabled = !picker?.canFight();
  }) : null;
  fightButton.disabled = !picker?.canFight();

  const content = element(
    'div',
    'dungeon-view dungeon-screen',
    element(
      'div',
      'dungeon-top',
      element('div', 'dungeon-portrait', dungeonBackdropCanvas(dungeon.id) ?? ''),
      element(
        'div',
        'dungeon-info',
        element('p', 'card-text dungeon-description', t(`dungeon.${dungeon.id}.description`)),
        element('div', 'card-text small', t('dungeons.levelRange', { min: dungeon.minimumHeroLevel, max: dungeon.recommendedMaxLevel })),
        element('div', 'section-title', t('dungeons.creeps')),
        element('div', 'monster-tiles', ...monsters.map((monster) => createMonsterTile(monster, dungeon, options))),
        element('div', 'card-text small dungeon-drops', t('dungeons.dropsOverview', { list: listOf(dropNamesOf(monsters)) })),
      ),
    ),
    ...(picker ? [picker.element] : []),
    element('div', 'panel-footer', ...(picker ? [fightButton] : []), actionButton(t('report.close'), () => handle.close())),
  );
  handle = openModal(t(`dungeon.${dungeon.id}`), content);
}
