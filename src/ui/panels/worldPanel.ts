import { DUNGEONS } from '../../content/dungeons';
import { TOWNS, type TownDefinition } from '../../content/towns';
import { actionButton, element } from '../dom';
import { listOf } from '../displayNames';
import { t } from '../i18n';
import { openModal } from '../modal';
import { drawWorldMap } from '../worldMapArt';
import type { PanelContext, PanelRenderer } from './panelContext';

function openTownView(town: TownDefinition, isCurrent: boolean): void {
  const dungeonNames = DUNGEONS.filter((dungeon) => dungeon.townId === town.id).map((dungeon) => t(`dungeon.${dungeon.id}`));
  const content = element(
    'div',
    'panel-body',
    element('p', 'card-text lore-text', t(`town.${town.id}.lore`)),
    element('div', 'card-text', t(`town.${town.id}.region`)),
    element('div', 'card-text small', t('world.levels', { name: t(`town.${town.id}`), first: town.firstLevel, last: town.lastLevel })),
    element('div', 'card-text small', dungeonNames.length > 0 ? t('world.dungeonsLabel', { names: listOf(dungeonNames) }) : t('world.unexplored')),
    element('div', isCurrent ? 'card-text level-ok' : 'card-text small locked-note', isCurrent ? t('world.here') : t('world.locked')),
  );
  openModal(t(`town.${town.id}`), content);
}

function renderTownMarker(town: TownDefinition, isCurrent: boolean): HTMLElement {
  const marker = actionButton('', () => openTownView(town, isCurrent), { className: `map-marker${isCurrent ? ' current' : ''}` });
  marker.style.left = `${town.mapX}%`;
  marker.style.top = `${town.mapY}%`;
  marker.append(element('span', 'map-pin'), element('span', 'map-label', t(`town.${town.id}`)));
  return marker;
}

export const renderWorldPanel: PanelRenderer = (context: PanelContext) => {
  const currentTownId = context.store.getState().townId;
  const map = element('div', 'world-map', drawWorldMap(TOWNS), ...TOWNS.map((town) => renderTownMarker(town, town.id === currentTownId)));
  const mapArea = element('div', 'world-map-area', map);
  return element('div', 'panel-body world-body', element('p', 'hint', t('world.tapHint')), mapArea, element('p', 'hint', t('world.hint')));
};
