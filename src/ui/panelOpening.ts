import { focusRun, focusedRunNumber } from './runFocus';
import { closeEveryModalWithItsCloseAction } from './modal';
import type { PanelHost } from './panelHost';

// What a tap on a menu button does, in the bottom bar and in the top bar.
export function togglePanelFromBar(panelHost: PanelHost, panelId: string): void {
  closeEveryModalWithItsCloseAction();
  // Leaving the battle view only changes the focus. The run keeps going in the background.
  if (focusedRunNumber() !== null) {
    focusRun(null);
    panelHost.open(panelId);
    return;
  }
  panelHost.toggle(panelId);
}
