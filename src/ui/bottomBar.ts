import { backpackPressureOf, type GameStore } from '../game';
import { actionButton, element } from './dom';
import { onLanguageChange, t } from './i18n';
import { PANEL_CATALOG, panelTitleKey } from './panelCatalog';
import type { PanelHost } from './panelHost';
import { createPixelIcon } from './pixelIcons';

export function createBottomBar(store: GameStore, panelHost: PanelHost): HTMLElement {
  const bar = element('nav', 'bottom-bar');
  const buttons = PANEL_CATALOG.flatMap((panel) => {
    if (panel.barIcon === null) return [];
    const label = element('span', 'bar-label');
    const button = actionButton('', () => panelHost.toggle(panel.id), { className: 'bar-button' });
    button.append(createPixelIcon(panel.barIcon, 2), label);
    const badge = element('span', 'bar-badge');
    if (panel.id === 'dungeons') button.append(badge);
    return [{ id: panel.id, button, label, badge }];
  });
  bar.append(element('div', 'bar-buttons', ...buttons.map((entry) => entry.button)));

  const refreshButtons = (): void => {
    buttons.forEach(({ id, button }) => button.classList.toggle('active', panelHost.activePanelId() === id));
  };
  const refreshLabels = (): void => {
    buttons.forEach(({ id, label }) => {
      label.textContent = t(panelTitleKey(id));
    });
  };
  const refreshBadges = (): void => {
    const { dungeonRuns, reports } = store.getState();
    const badgeCount = dungeonRuns.length + reports.length;
    buttons.forEach(({ id, badge }) => {
      badge.textContent = id === 'dungeons' && badgeCount > 0 ? String(badgeCount) : '';
      badge.style.display = id === 'dungeons' && badgeCount > 0 ? 'inline-block' : 'none';
      badge.classList.toggle('has-results', reports.length > 0);
    });
  };
  // The warning is a quiet colour on the Inventory button: a small square and a thin line. It does not move or flash.
  const refreshBackpackWarning = (): void => {
    const pressure = backpackPressureOf(store.getState());
    const inventoryButton = buttons.find(({ id }) => id === 'inventory')?.button;
    if (!inventoryButton) return;
    inventoryButton.classList.toggle('storage-warning', pressure === 'warning');
    inventoryButton.classList.toggle('storage-urgent', pressure === 'urgent');
    inventoryButton.title = pressure === 'none' ? '' : t(`storage.${pressure}`);
  };

  panelHost.onChange(refreshButtons);
  store.subscribe(refreshBadges);
  store.subscribe(refreshBackpackWarning);
  onLanguageChange(refreshBackpackWarning);
  onLanguageChange(refreshLabels);
  refreshButtons();
  refreshLabels();
  refreshBadges();
  refreshBackpackWarning();
  return bar;
}
