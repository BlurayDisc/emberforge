import type { GameStore } from '../../game';

export interface PanelContext {
  store: GameStore;
  requestRender(): void;
  closePanel(): void;
  openPanel(panelId: string): void;
  notify(message: string): void;
}

export type PanelRenderer = (context: PanelContext) => HTMLElement;
