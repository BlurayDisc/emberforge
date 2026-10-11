import { findActiveRun, type GameStore } from '../game';
import { isInCastle, onCastleVisitChange } from './castleVisit';
import { formatNow } from './clockText';
import { actionButton, element } from './dom';
import { onLanguageChange, t } from './i18n';
import { createMoneyDisplay } from './moneyDisplay';
import { PANEL_CATALOG, panelTitleKey } from './panelCatalog';
import { togglePanelFromBar } from './panelOpening';
import type { PanelHost } from './panelHost';
import { createPixelIcon } from './pixelIcons';
import { focusedRunNumber, onRunFocusChange } from './runFocus';

const CLOCK_REFRESH_MILLISECONDS = 1000;
const GAIN_FLASH_MILLISECONDS = 700;

// The one place that shows the gold of the player. With no menu open it also shows the place, the clock, World and Settings.
// With a menu open it shrinks to the menu title, the gold and the X button.
export function createTopBar(store: GameStore, panelHost: PanelHost): HTMLElement {
  const bar = element('header', 'top-bar');
  const title = element('div', 'top-bar-title');
  const clock = element('div', 'top-bar-clock');
  const gold = element('div', 'top-bar-gold');
  const placeBlock = element('div', 'top-bar-place', title, clock);
  const menuButtons = PANEL_CATALOG.flatMap((panel) => {
    if (!panel.topBarIcon) return [];
    const button = actionButton('', () => togglePanelFromBar(panelHost, panel.id), { className: 'action-button top-bar-button' });
    button.append(createPixelIcon(panel.topBarIcon, 3));
    return [{ id: panel.id, button }];
  });
  const closeButton = actionButton('x', () => panelHost.closeActivePanel(), { className: 'action-button close-button top-bar-button' });
  bar.append(placeBlock, gold, ...menuButtons.map(({ button }) => button), closeButton);

  const placeName = (): string => {
    const state = store.getState();
    const runNumber = focusedRunNumber();
    const run = runNumber === null ? undefined : findActiveRun(state, runNumber);
    if (run) return t(`dungeon.${run.dungeonId}`);
    return isInCastle() ? t('castle.name') : t(`town.${state.townId}`);
  };

  const refreshLayout = (): void => {
    const activePanelId = panelHost.activePanelId();
    const isMenuOpen = activePanelId !== null;
    bar.classList.toggle('top-bar-menu-open', isMenuOpen);
    title.textContent = isMenuOpen ? t(panelTitleKey(activePanelId)) : placeName();
    menuButtons.forEach(({ id, button }) => {
      button.title = t(panelTitleKey(id));
      button.setAttribute('aria-label', t(panelTitleKey(id)));
    });
    closeButton.style.display = isMenuOpen && panelHost.canCloseActivePanel() ? '' : 'none';
  };
  const refreshClock = (): void => {
    clock.textContent = formatNow();
  };

  let previousCopper = store.getState().copper;
  let flashTimer: number | undefined;
  const refreshGold = (): void => {
    const { copper } = store.getState();
    gold.replaceChildren(createMoneyDisplay(copper));
    if (copper > previousCopper) {
      gold.classList.add('top-bar-gold-gain');
      window.clearTimeout(flashTimer);
      flashTimer = window.setTimeout(() => gold.classList.remove('top-bar-gold-gain'), GAIN_FLASH_MILLISECONDS);
    }
    previousCopper = copper;
  };

  panelHost.onChange(refreshLayout);
  onRunFocusChange(refreshLayout);
  onCastleVisitChange(refreshLayout);
  onLanguageChange(() => {
    refreshLayout();
    refreshClock();
  });
  store.subscribe(() => {
    refreshGold();
    refreshLayout();
  });
  window.setInterval(refreshClock, CLOCK_REFRESH_MILLISECONDS);
  refreshLayout();
  refreshClock();
  refreshGold();
  return bar;
}
