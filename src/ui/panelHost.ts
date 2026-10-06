import type { GameStore } from '../game';
import { actionButton, element } from './dom';
import { t, onLanguageChange } from './i18n';
import { PANEL_CATALOG, panelTitleKey } from './panelCatalog';
import type { PanelContext } from './panels/panelContext';
import { createToastStack } from './toastStack';

export interface PanelHost {
  element: HTMLElement;
  // The small notices. They live apart from the panel, so a redraw or a closed panel does not remove them.
  notificationsElement: HTMLElement;
  toggle(panelId: string): void;
  open(panelId: string): void;
  activePanelId(): string | null;
  closeActivePanel(): boolean;
  notify(message: string): void;
  onChange(listener: () => void): void;
}

const GHOST_CLICK_GUARD_MS = 400;

export function createPanelHost(store: GameStore): PanelHost {
  const host = element('div', 'panel-host');
  const changeListeners: Array<() => void> = [];
  let activeId: string | null = null;
  const toasts = createToastStack();
  const notify = toasts.show;

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

  // Going into a sub screen (for example a crafter) saves the list position. Coming back restores it, and the sub screen itself starts at the top.
  // The sub screen also hands over what Back does, so the Escape key goes back one screen first and closes the panel only from the main screen.
  const savedScrollOffsets: number[][] = [];
  const backActions: Array<() => void> = [];
  let scrollOffsetsForNextRender: number[] | null = null;
  const enterSubScreen = (goBack: () => void): void => {
    savedScrollOffsets.push(readScrollOffsets());
    backActions.push(goBack);
    scrollOffsetsForNextRender = [];
  };
  const leaveSubScreen = (): void => {
    scrollOffsetsForNextRender = savedScrollOffsets.pop() ?? [];
    backActions.pop();
  };

  const render = (): void => {
    const scrollOffsets = scrollOffsetsForNextRender ?? (renderedPanelId === activeId ? readScrollOffsets() : []);
    scrollOffsetsForNextRender = null;
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
        enterSubScreen,
        leaveSubScreen,
      };
      const header = element('div', 'panel-header', element('span', 'panel-title', t(panelTitleKey(definition.id))));
      if (!isActivePanelLocked()) header.append(actionButton('x', () => setActive(null), { className: 'action-button close-button' }));
      host.append(element('div', `panel panel-${definition.id}`, header, definition.render(context)));
    }
    restoreScrollOffsets(scrollOffsets);
    renderedPanelId = definition ? definition.id : null;
  };

  const setActive = (panelId: string | null): void => {
    if (isActivePanelLocked() && panelId !== activeId) return;
    const previousId = activeId;
    activeId = panelId !== null && PANEL_CATALOG.some((panel) => panel.id === panelId) ? panelId : null;
    if (previousId !== activeId) {
      openedAtMs = performance.now();
      savedScrollOffsets.length = 0;
      backActions.length = 0;
      PANEL_CATALOG.find((panel) => panel.id === previousId)?.onClose?.();
    }
    render();
    changeListeners.forEach((listener) => listener());
  };

  // A tap on a town building opens a panel on pointerup. The browser then sends its delayed click to the element that is under the finger now, which is a button of the new panel. The guard drops that click.
  let openedAtMs = 0;
  host.addEventListener(
    'click',
    (event) => {
      if (performance.now() - openedAtMs < GHOST_CLICK_GUARD_MS) {
        event.stopPropagation();
        event.preventDefault();
      }
    },
    true,
  );

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
    notificationsElement: toasts.element,
    toggle: (panelId) => setActive(activeId === panelId ? null : panelId),
    open: (panelId) => setActive(panelId),
    activePanelId: () => activeId,
    closeActivePanel: () => {
      if (activeId === null || isActivePanelLocked()) return false;
      const goBack = backActions[backActions.length - 1];
      if (goBack) {
        goBack();
        return true;
      }
      setActive(null);
      return true;
    },
    notify,
    onChange: (listener) => {
      changeListeners.push(listener);
    },
  };
}
