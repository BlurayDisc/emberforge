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
    const fightCount = store.getState().dungeonRuns.length;
    buttons.forEach(({ id, badge }) => {
      badge.textContent = id === 'dungeons' && fightCount > 0 ? String(fightCount) : '';
      badge.style.display = id === 'dungeons' && fightCount > 0 ? 'inline-block' : 'none';
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
