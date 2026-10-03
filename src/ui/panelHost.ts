import type { GameStore } from '../game';
import { actionButton, element } from './dom';
import { t, onLanguageChange } from './i18n';
import { PANEL_CATALOG, panelTitleKey } from './panelCatalog';
import type { PanelContext } from './panels/panelContext';

const TOAST_MILLISECONDS = 3000;

export interface PanelHost {
  element: HTMLElement;
  toggle(panelId: string): void;
  open(panelId: string): void;
  activePanelId(): string | null;
  notify(message: string): void;
  onChange(listener: () => void): void;
}

export function createPanelHost(store: GameStore): PanelHost {
  const host = element('div', 'panel-host');
  const changeListeners: Array<() => void> = [];
  let activeId: string | null = null;
  let toastTimer: number | undefined;

  const notify = (message: string): void => {
    host.querySelector('.toast')?.remove();
    host.append(element('div', 'toast', message));
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => host.querySelector('.toast')?.remove(), TOAST_MILLISECONDS);
  };

  const isActivePanelLocked = (): boolean => {
    const definition = PANEL_CATALOG.find((panel) => panel.id === activeId);
    return definition?.isLocked?.(store.getState()) ?? false;
  };

  // A redraw replaces every element. A scrolled list would jump to the top, so the scroll offsets are kept for a redraw of the same panel.
  const readScrollOffsets = (): number[] => Array.from(host.querySelectorAll('.panel-body'), (body) => body.scrollTop);
  const restoreScrollOffsets = (offsets: number[]): void => {
    host.querySelectorAll('.panel-body').forEach((body, index) => {
      body.scrollTop = offsets[index] ?? 0;
    });
  };
  let renderedPanelId: string | null = null;

  const render = (): void => {
    const toast = host.querySelector('.toast');
    const scrollOffsets = renderedPanelId === activeId ? readScrollOffsets() : [];
    const definition = PANEL_CATALOG.find((panel) => panel.id === activeId);
    host.replaceChildren();
    host.classList.toggle('open', definition !== undefined);
    if (definition) {
      const context: PanelContext = {
        store,
        requestRender: render,
        closePanel: () => setActive(null),
        openPanel: (panelId) => setActive(panelId),
        notify,
      };
      const header = element('div', 'panel-header', element('span', 'panel-title', t(panelTitleKey(definition.id))));
      if (!isActivePanelLocked()) header.append(actionButton('x', () => setActive(null), { className: 'action-button close-button' }));
      host.append(element('div', 'panel', header, definition.render(context)));
    }
    if (toast) host.append(toast);
    restoreScrollOffsets(scrollOffsets);
    renderedPanelId = definition ? definition.id : null;
  };

  const setActive = (panelId: string | null): void => {
    if (isActivePanelLocked() && panelId !== activeId) return;
    const previousId = activeId;
    activeId = panelId !== null && PANEL_CATALOG.some((panel) => panel.id === panelId) ? panelId : null;
    if (previousId !== activeId) {
      PANEL_CATALOG.find((panel) => panel.id === previousId)?.onClose?.();
      host.querySelector('.toast')?.remove();
    }
    render();
    changeListeners.forEach((listener) => listener());
  };

  // A click on the empty space around the panel closes it. A drag that starts inside the panel must not.
  let pressStartedOutsidePanel = false;
  host.addEventListener('pointerdown', (event) => {
    pressStartedOutsidePanel = event.target === host;
  });
  host.addEventListener('click', (event) => {
    if (pressStartedOutsidePanel && event.target === host) setActive(null);
  });

  store.subscribe(render);
  onLanguageChange(render);

  return {
    element: host,
    toggle: (panelId) => setActive(activeId === panelId ? null : panelId),
    open: (panelId) => setActive(panelId),
    activePanelId: () => activeId,
    notify,
    onChange: (listener) => {
      changeListeners.push(listener);
    },
  };
}
