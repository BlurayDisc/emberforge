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
    return [{ id: panel.id, button, label }];
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
  const refreshMoney = (): void => {
    moneySlot.replaceChildren(createMoneyDisplay(store.getState().copper));
  };

  panelHost.onChange(refreshButtons);
  store.subscribe(refreshMoney);
  onLanguageChange(refreshLabels);
  refreshButtons();
  refreshLabels();
  refreshMoney();
  return bar;
}
