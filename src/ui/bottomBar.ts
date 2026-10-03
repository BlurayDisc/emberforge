import type { GameStore } from '../game';
import { actionButton, element } from './dom';
import { createMoneyDisplay } from './moneyDisplay';
import { PANEL_CATALOG } from './panelCatalog';
import type { PanelHost } from './panelHost';
import { createPixelIcon } from './pixelIcons';

export function createBottomBar(store: GameStore, panelHost: PanelHost): HTMLElement {
  const bar = element('nav', 'bottom-bar');
  const buttons = PANEL_CATALOG.flatMap((panel) => {
    if (panel.barIcon === null) return [];
    const button = actionButton('', () => panelHost.toggle(panel.id), { className: 'bar-button' });
    button.append(createPixelIcon(panel.barIcon, 2), element('span', 'bar-label', panel.label));
    return [{ id: panel.id, button }];
  });
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
