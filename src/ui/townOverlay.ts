import { BUILDINGS, type BuildingDefinition } from '../content/buildings';
import { activeRunOf, type GameStore } from '../game';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../kernel/stageSize';
import { element } from './dom';
import { onLanguageChange, t } from './i18n';

function percentOf(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

function createHotspot(building: BuildingDefinition, onSelect: (panelId: string) => void): HTMLElement {
  const panelId = building.panelId;
  const hotspot = element(panelId === null ? 'div' : 'button', panelId === null ? 'building-hotspot static' : 'building-hotspot', element('span', 'building-label'));
  if (hotspot instanceof HTMLButtonElement) hotspot.type = 'button';
  hotspot.style.left = percentOf(building.x - building.width / 2, LOGICAL_WIDTH);
  hotspot.style.top = percentOf(building.y - building.height, LOGICAL_HEIGHT);
  hotspot.style.width = percentOf(building.width, LOGICAL_WIDTH);
  hotspot.style.height = percentOf(building.height, LOGICAL_HEIGHT);
  if (panelId !== null) hotspot.addEventListener('click', () => onSelect(panelId));
  return hotspot;
}

export function createTownOverlay(store: GameStore, onSelect: (panelId: string) => void): HTMLElement {
  const overlay = element('div', 'town-overlay');
  const hotspots = BUILDINGS.map((building) => ({ building, hotspot: createHotspot(building, onSelect) }));
  const hint = element('div', 'stage-hint');
  overlay.append(...hotspots.map((entry) => entry.hotspot), hint);

  const refresh = (): void => {
    const state = store.getState();
    overlay.style.display = activeRunOf(state) === null ? 'block' : 'none';
    const hasNoHeroes = state.company.length === 0;
    const isReadyForFirstRun = !hasNoHeroes && state.runsStarted === 0;

    hotspots.forEach(({ building, hotspot }) => {
      hotspot.classList.toggle('attention', hasNoHeroes && building.id === 'tavern');
      const label = t(`building.${building.id}`);
      hotspot.setAttribute('aria-label', label);
      const labelElement = hotspot.querySelector('.building-label');
      if (labelElement) labelElement.textContent = label;
    });
    if (hasNoHeroes) hint.textContent = t('hint.noHeroes');
    else hint.textContent = t('hint.heroReady');
    hint.style.display = hasNoHeroes || isReadyForFirstRun ? 'block' : 'none';
  };

  store.subscribe(refresh);
  onLanguageChange(refresh);
  refresh();
  return overlay;
}
