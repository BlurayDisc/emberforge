import type { GameStore } from '../../game';

export interface PanelContext {
  store: GameStore;
  requestRender(): void;
  closePanel(): void;
  openPanel(panelId: string): void;
  notify(message: string): void;
  // goBack is what the Back button and the Escape key do on the sub screen.
  enterSubScreen(goBack: () => void): void;
  leaveSubScreen(): void;
}

export type PanelRenderer = (context: PanelContext) => HTMLElement;
