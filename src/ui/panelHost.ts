import type { GameStore } from '../game';
import { actionButton, element } from './dom';
import { PANEL_CATALOG, type PanelId } from './panelCatalog';
import type { PanelContext } from './panels/panelContext';

const TOAST_MILLISECONDS = 3000;

export interface PanelHost {
  element: HTMLElement;
  toggle(panelId: PanelId): void;
  open(panelId: PanelId): void;
  activePanelId(): PanelId | null;
  onChange(listener: () => void): void;
}

export function createPanelHost(store: GameStore): PanelHost {
  const host = element('div', 'panel-host');
  const changeListeners: Array<() => void> = [];
  let activeId: PanelId | null = null;
  let toastTimer: number | undefined;

  const notify = (message: string): void => {
    host.querySelector('.toast')?.remove();
    host.append(element('div', 'toast', message));
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => host.querySelector('.toast')?.remove(), TOAST_MILLISECONDS);
  };

  const render = (): void => {
    const toast = host.querySelector('.toast');
    const definition = PANEL_CATALOG.find((panel) => panel.id === activeId);
    host.replaceChildren();
    if (definition) {
      const context: PanelContext = { store, requestRender: render, closePanel: () => setActive(null), notify };
      const header = element(
        'div',
        'panel-header',
        element('span', 'panel-title', definition.label),
        actionButton('×', () => setActive(null), { className: 'action-button close-button' }),
      );
      host.append(element('div', 'panel', header, definition.render(context)));
    }
    if (toast) host.append(toast);
  };

  const setActive = (panelId: PanelId | null): void => {
    activeId = panelId;
    render();
    changeListeners.forEach((listener) => listener());
  };

  store.subscribe(render);

  return {
    element: host,
    toggle: (panelId) => setActive(activeId === panelId ? null : panelId),
    open: (panelId) => setActive(panelId),
    activePanelId: () => activeId,
    onChange: (listener) => {
      changeListeners.push(listener);
    },
  };
}
