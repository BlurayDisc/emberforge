import type { GameStore } from '../game';
import { actionButton, element } from './dom';
import { createMoneyDisplay } from './moneyDisplay';
import { PANEL_CATALOG } from './panelCatalog';
import type { PanelHost } from './panelHost';

export function createBottomBar(store: GameStore, panelHost: PanelHost): HTMLElement {
  const bar = element('nav', 'bottom-bar');
  const buttons = PANEL_CATALOG.map((panel) => ({
    id: panel.id,
    button: actionButton(panel.label, () => panelHost.toggle(panel.id), { className: 'bar-button' }),
  }));
  const moneySlot = element('div', 'bar-money');
  bar.append(element('div', 'bar-buttons', ...buttons.map((entry) => entry.button)), moneySlot);

  const refreshButtons = (): void => {
    buttons.forEach(({ id, button }) => button.classList.toggle('active', panelHost.activePanelId() === id));
  };
  const refreshMoney = (): void => {
    moneySlot.replaceChildren(createMoneyDisplay(store.getState().copper));
  };

  panelHost.onChange(refreshButtons);
  store.subscribe(refreshMoney);
  refreshButtons();
  refreshMoney();
  return bar;
}
