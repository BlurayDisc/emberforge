import { BUILDINGS, type BuildingDefinition } from '../content/buildings';
import type { GameStore } from '../game';
import { LOGICAL_HEIGHT, TOWN_WIDTH } from '../kernel/stageSize';
import { element } from './dom';
import { isInCastle, onCastleVisitChange, setInCastle } from './castleVisit';
import { onLanguageChange, t } from './i18n';
import { createMillStatus } from './millStatus';
import { focusedRunNumber, onRunFocusChange } from './runFocus';
import { enableSwipeBetweenScreens } from './swipeBetweenScreens';
import type { TownNavigation } from './townNavigation';

export interface TownOverlay {
  element: HTMLElement;
  // Moves with the town when it scrolls. Building signs and speech bubbles live here.
  world: HTMLElement;
}

function percentOf(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

function createHotspot(building: BuildingDefinition, onSelect: (panelId: string) => void): HTMLElement {
  const panelId = building.panelId;
  const isClickable = panelId !== null || building.opens === 'castle';
  const hotspot = element(isClickable ? 'button' : 'div', isClickable ? 'building-hotspot' : 'building-hotspot static', element('span', 'building-label'));
  if (hotspot instanceof HTMLButtonElement) hotspot.type = 'button';
  hotspot.style.left = percentOf(building.x - building.width / 2, TOWN_WIDTH);
  hotspot.style.top = percentOf(building.y - building.height, LOGICAL_HEIGHT);
  hotspot.style.width = percentOf(building.width, TOWN_WIDTH);
  hotspot.style.height = percentOf(building.height, LOGICAL_HEIGHT);
  if (panelId !== null) hotspot.addEventListener('click', () => onSelect(panelId));
  if (building.opens === 'castle') hotspot.addEventListener('click', () => setInCastle(true));
  return hotspot;
}

function createArrow(direction: 'left' | 'right', onPress: () => void): HTMLButtonElement {
  const arrow = element('button', `town-arrow town-arrow-${direction}`, element('span', 'town-arrow-shape'));
  arrow.type = 'button';
  arrow.addEventListener('click', onPress);
  return arrow;
}

export function createTownOverlay(store: GameStore, onSelect: (panelId: string) => void, navigation: TownNavigation, notify: (message: string) => void): TownOverlay {
  const overlay = element('div', 'town-overlay');
  const world = element('div', 'town-world');
  const namedBuildings = BUILDINGS.filter((building) => building.label !== null || building.panelId !== null);
  const hotspots = namedBuildings.map((building) => ({ building, hotspot: createHotspot(building, onSelect) }));
  const hint = element('div', 'stage-hint');
  const title = element('div', 'town-screen-title');
  const goTo = (screenIndex: number): void => {
    navigation.goToScreen(screenIndex);
    refreshArrows();
  };
  const leftArrow = createArrow('left', () => goTo(navigation.currentScreen() - 1));
  const rightArrow = createArrow('right', () => goTo(navigation.currentScreen() + 1));
  world.append(...hotspots.map((entry) => entry.hotspot));
  const mill = BUILDINGS.find((building) => building.id === 'mill');
  if (mill) world.append(createMillStatus(store, mill, notify));
  overlay.append(world, leftArrow, rightArrow, title, hint);
  enableSwipeBetweenScreens(() => overlay.style.display !== 'none' && document.querySelector('.panel, .modal') === null, () => goTo(navigation.currentScreen() + 1), () => goTo(navigation.currentScreen() - 1));

  const refreshArrows = (): void => {
    const screen = navigation.currentScreen();
    leftArrow.style.visibility = screen > 0 ? 'visible' : 'hidden';
    rightArrow.style.visibility = screen < navigation.screenCount - 1 ? 'visible' : 'hidden';
    title.textContent = t(`town.screen.${screen}`);
  };

  const refresh = (): void => {
    const state = store.getState();
    overlay.style.display = focusedRunNumber() === null && !isInCastle() ? 'block' : 'none';
    const hasNoHeroes = state.company.length === 0;
    const isReadyForFirstRun = !hasNoHeroes && state.runsStarted === 0;

    hotspots.forEach(({ building, hotspot }) => {
      const label = building.label === null ? '' : t(`building.${building.id}`);
      hotspot.setAttribute('aria-label', label);
      const labelElement = hotspot.querySelector('.building-label');
      if (labelElement) labelElement.textContent = label;
    });
    if (hasNoHeroes) hint.textContent = t('hint.noHeroes');
    else hint.textContent = t('hint.heroReady');
    hint.style.display = hasNoHeroes || isReadyForFirstRun ? 'block' : 'none';
    refreshArrows();
  };

  navigation.onScroll((scrollLeft) => {
    world.style.transform = `translateX(${-(scrollLeft / TOWN_WIDTH) * 100}%)`;
  });
  document.addEventListener('keydown', (event) => {
    const isTownVisible = overlay.style.display !== 'none';
    const isMenuOpen = document.querySelector('.panel, .modal') !== null;
    if (!isTownVisible || isMenuOpen) return;
    if (event.key === 'ArrowLeft') goTo(navigation.currentScreen() - 1);
    if (event.key === 'ArrowRight') goTo(navigation.currentScreen() + 1);
  });

  store.subscribe(refresh);
  onRunFocusChange(refresh);
  onCastleVisitChange(refresh);
  onLanguageChange(refresh);
  refresh();
  return { element: overlay, world };
}
