import type { GameStore } from '../game';
import { actionButton, element } from './dom';
import { onLanguageChange, t } from './i18n';
import { createMoneyDisplay } from './moneyDisplay';
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
  const moneySlot = element('div', 'bar-money');
  bar.append(element('div', 'bar-buttons', ...buttons.map((entry) => entry.button)), moneySlot);

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
  const refreshMoney = (): void => {
    moneySlot.replaceChildren(createMoneyDisplay(store.getState().copper));
  };

  panelHost.onChange(refreshButtons);
  store.subscribe(refreshMoney);
  store.subscribe(refreshBadges);
  onLanguageChange(refreshLabels);
  refreshButtons();
  refreshLabels();
  refreshMoney();
  refreshBadges();
  return bar;
}
