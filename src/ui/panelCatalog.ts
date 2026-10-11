import { renderDungeonsPanel } from './panels/dungeonsPanel';
import { renderHeroesPanel, resetHeroesTab } from './panels/heroesPanel';
import { renderInventoryPanel, resetInventorySelection } from './panels/inventoryPanel';
import type { GameState } from '../model/gameState';
import type { PanelRenderer } from './panels/panelContext';
import { renderSettingsPanel } from './panels/settingsPanel';
import { renderAcademyPanel } from './panels/town/academyView';
import { renderBankPanel } from './panels/town/bankView';
import { renderMerchantPanel, resetMerchantSelection } from './panels/town/merchantView';
import { renderMillPanel } from './panels/town/millView';
import { renderTavernPanel } from './panels/town/tavernView';
import { renderWorkshopPanel, resetWorkshopSelection } from './panels/town/workshopView';
import { renderWorldPanel } from './panels/worldPanel';
import type { IconName } from './pixelIcons';

export interface PanelDefinition {
  id: string;
  barIcon: IconName | null;
  // A panel with a top bar icon opens from the top bar instead of the bottom bar.
  topBarIcon?: IconName;
  render: PanelRenderer;
  onClose?: () => void;
  isLocked?: (state: GameState) => boolean;
}

export const PANEL_CATALOG: readonly PanelDefinition[] = [
  { id: 'heroes', barIcon: 'heroes', render: renderHeroesPanel, onClose: resetHeroesTab },
  { id: 'inventory', barIcon: 'inventory', render: renderInventoryPanel, onClose: resetInventorySelection },
  { id: 'workshop', barIcon: 'workshop', render: renderWorkshopPanel, onClose: resetWorkshopSelection },
  { id: 'dungeons', barIcon: 'dungeons', render: renderDungeonsPanel },
  { id: 'academy', barIcon: 'academy', render: renderAcademyPanel },
  { id: 'merchant', barIcon: 'merchant', render: renderMerchantPanel, onClose: resetMerchantSelection },
  { id: 'bank', barIcon: 'bank', render: renderBankPanel },
  { id: 'world', barIcon: null, topBarIcon: 'world', render: renderWorldPanel },
  { id: 'settings', barIcon: null, topBarIcon: 'gear', render: renderSettingsPanel },
  { id: 'tavern', barIcon: null, render: renderTavernPanel, isLocked: (state) => state.company.length === 0 },
  { id: 'mill', barIcon: null, render: renderMillPanel },
];

export function panelTitleKey(panelId: string): string {
  return `panel.${panelId}`;
}
