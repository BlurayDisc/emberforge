import { renderDungeonsPanel } from './panels/dungeonsPanel';
import { renderHeroesPanel } from './panels/heroesPanel';
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
  render: PanelRenderer;
  onClose?: () => void;
  isLocked?: (state: GameState) => boolean;
}

export const PANEL_CATALOG: readonly PanelDefinition[] = [
  { id: 'heroes', barIcon: 'heroes', render: renderHeroesPanel },
  { id: 'inventory', barIcon: 'inventory', render: renderInventoryPanel, onClose: resetInventorySelection },
  { id: 'workshop', barIcon: 'workshop', render: renderWorkshopPanel, onClose: resetWorkshopSelection },
  { id: 'merchant', barIcon: 'merchant', render: renderMerchantPanel, onClose: resetMerchantSelection },
  { id: 'dungeons', barIcon: 'dungeons', render: renderDungeonsPanel },
  { id: 'world', barIcon: 'world', render: renderWorldPanel },
  { id: 'settings', barIcon: 'menu', render: renderSettingsPanel },
  { id: 'tavern', barIcon: null, render: renderTavernPanel, isLocked: (state) => state.company.length === 0 },
  { id: 'bank', barIcon: null, render: renderBankPanel },
  { id: 'academy', barIcon: null, render: renderAcademyPanel },
  { id: 'mill', barIcon: null, render: renderMillPanel },
];

export function panelTitleKey(panelId: string): string {
  return `panel.${panelId}`;
}
