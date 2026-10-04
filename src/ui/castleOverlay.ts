import { CASTLE_SPOTS, castleWorldX, type CastleSpot } from '../content/castle';
import { CASTLE_WIDTH, LOGICAL_HEIGHT } from '../kernel/stageSize';
import { openCastleStory } from './castleStoryModal';
import { hasHeardCastleSpot, isInCastle, markCastleSpotHeard, onCastleVisitChange, setInCastle } from './castleVisit';
import { actionButton, element } from './dom';
import { onLanguageChange, t } from './i18n';
import { focusedRunNumber, onRunFocusChange } from './runFocus';
import { enableSwipeBetweenScreens } from './swipeBetweenScreens';
import type { TownNavigation } from './townNavigation';

function percentOf(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

function createSpotHotspot(spot: CastleSpot): HTMLButtonElement {
  const hotspot = element('button', `castle-hotspot castle-${spot.kind}`, element('span', 'castle-marker', '!'), element('span', 'building-label'));
  hotspot.type = 'button';
  hotspot.style.left = percentOf(castleWorldX(spot) - spot.width / 2, CASTLE_WIDTH);
  hotspot.style.top = percentOf(spot.y - spot.height, LOGICAL_HEIGHT);
  hotspot.style.width = percentOf(spot.width, CASTLE_WIDTH);
  hotspot.style.height = percentOf(spot.height, LOGICAL_HEIGHT);
  hotspot.addEventListener('click', () => {
    openCastleStory(spot.id);
    markCastleSpotHeard(spot.id);
  });
  return hotspot;
}

function createArrow(direction: 'left' | 'right', onPress: () => void): HTMLButtonElement {
  const arrow = element('button', `town-arrow town-arrow-${direction}`, element('span', 'town-arrow-shape'));
  arrow.type = 'button';
  arrow.addEventListener('click', onPress);
  return arrow;
}

// The castle screens: hotspots on every person and place, arrows between the two screens, and a way out.
export function createCastleOverlay(navigation: TownNavigation): HTMLElement {
  const overlay = element('div', 'town-overlay castle-overlay');
  const world = element('div', 'town-world castle-world');
  const hotspots = CASTLE_SPOTS.map((spot) => ({ spot, hotspot: createSpotHotspot(spot) }));
  const title = element('div', 'town-screen-title');
  const goTo = (screenIndex: number): void => {
    navigation.goToScreen(screenIndex);
    refreshArrows();
  };
  const leftArrow = createArrow('left', () => goTo(navigation.currentScreen() - 1));
  const rightArrow = createArrow('right', () => goTo(navigation.currentScreen() + 1));
  const leaveButton = actionButton('', () => setInCastle(false), { className: 'action-button castle-leave-button' });
  world.append(...hotspots.map((entry) => entry.hotspot));
  overlay.append(world, leftArrow, rightArrow, title, leaveButton);
  enableSwipeBetweenScreens(() => overlay.style.display !== 'none' && document.querySelector('.panel, .modal') === null, () => goTo(navigation.currentScreen() + 1), () => goTo(navigation.currentScreen() - 1));

  const refreshArrows = (): void => {
    const screen = navigation.currentScreen();
    leftArrow.style.visibility = screen > 0 ? 'visible' : 'hidden';
    rightArrow.style.visibility = screen < navigation.screenCount - 1 ? 'visible' : 'hidden';
    title.textContent = t(`castle.screen.${screen}`);
  };

  const refresh = (): void => {
    overlay.style.display = isInCastle() && focusedRunNumber() === null ? 'block' : 'none';
    leaveButton.textContent = t('castle.leave');
    hotspots.forEach(({ spot, hotspot }) => {
      const name = t(`castle.${spot.id}.name`);
      hotspot.setAttribute('aria-label', name);
      hotspot.classList.toggle('unheard', !hasHeardCastleSpot(spot.id));
      const label = hotspot.querySelector('.building-label');
      if (label) label.textContent = name;
    });
    refreshArrows();
  };

  navigation.onScroll((scrollLeft) => {
    world.style.transform = `translateX(${-(scrollLeft / CASTLE_WIDTH) * 100}%)`;
    refreshArrows();
  });
  document.addEventListener('keydown', (event) => {
    const isCastleVisible = overlay.style.display !== 'none';
    const isMenuOpen = document.querySelector('.panel, .modal') !== null;
    if (!isCastleVisible || isMenuOpen) return;
    if (event.key === 'ArrowLeft') goTo(navigation.currentScreen() - 1);
    if (event.key === 'ArrowRight') goTo(navigation.currentScreen() + 1);
    if (event.key === 'Escape') setInCastle(false);
  });

  onCastleVisitChange(refresh);
  onRunFocusChange(refresh);
  onLanguageChange(refresh);
  refresh();
  return overlay;
}
