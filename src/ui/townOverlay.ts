import { BUILDINGS, type BuildingDefinition } from '../content/buildings';
import { activeRunOf, type GameStore } from '../game';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../kernel/stageSize';
import { element } from './dom';

function percentOf(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

function createHotspot(building: BuildingDefinition, onSelect: (panelId: string) => void): HTMLButtonElement {
  const hotspot = element('button', 'building-hotspot', element('span', 'building-label', building.label));
  hotspot.type = 'button';
  hotspot.setAttribute('aria-label', building.label);
  hotspot.style.left = percentOf(building.x - building.width / 2, LOGICAL_WIDTH);
  hotspot.style.top = percentOf(building.y - building.height, LOGICAL_HEIGHT);
  hotspot.style.width = percentOf(building.width, LOGICAL_WIDTH);
  hotspot.style.height = percentOf(building.height, LOGICAL_HEIGHT);
  hotspot.addEventListener('click', () => onSelect(building.panelId));
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
    hotspots.forEach(({ building, hotspot }) => hotspot.classList.toggle('attention', hasNoHeroes && building.id === 'tavern'));
    if (hasNoHeroes) hint.textContent = 'Welcome! Enter the Tavern to hire your first hero. It is free.';
    else if (state.partyHeroIds.length === 0) hint.textContent = 'Your party is empty. Open Heroes and press "Join party".';
    else if (state.runsStarted === 0) hint.textContent = 'Your hero is ready. Enter the Dungeons to find loot.';
    hint.style.display = hint.textContent === '' || (!hasNoHeroes && state.partyHeroIds.length > 0 && state.runsStarted > 0) ? 'none' : 'block';
  };

  store.subscribe(refresh);
  refresh();
  return overlay;
}
