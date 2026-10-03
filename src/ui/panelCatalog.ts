import { renderDungeonsPanel } from './panels/dungeonsPanel';
import { renderHeroesPanel } from './panels/heroesPanel';
import { renderInventoryPanel, resetInventorySelection } from './panels/inventoryPanel';
import type { PanelRenderer } from './panels/panelContext';
import { renderSettingsPanel } from './panels/settingsPanel';
import { renderMerchantPanel } from './panels/town/merchantView';
import { renderTavernPanel } from './panels/town/tavernView';
import { renderWorkshopPanel, resetWorkshopSelection } from './panels/town/workshopView';
import { renderWorldPanel } from './panels/worldPanel';
import type { IconName } from './pixelIcons';

export interface PanelDefinition {
  id: string;
  barIcon: IconName | null;
  render: PanelRenderer;
  onClose?: () => void;
}

export const PANEL_CATALOG: readonly PanelDefinition[] = [
  { id: 'heroes', barIcon: 'heroes', render: renderHeroesPanel },
  { id: 'inventory', barIcon: 'inventory', render: renderInventoryPanel, onClose: resetInventorySelection },
  { id: 'dungeons', barIcon: 'dungeons', render: renderDungeonsPanel },
  { id: 'world', barIcon: 'world', render: renderWorldPanel },
  { id: 'settings', barIcon: 'menu', render: renderSettingsPanel },
  { id: 'tavern', barIcon: null, render: renderTavernPanel },
  { id: 'workshop', barIcon: null, render: renderWorkshopPanel, onClose: resetWorkshopSelection },
  { id: 'merchant', barIcon: null, render: renderMerchantPanel },
];

export function panelTitleKey(panelId: string): string {
  return `panel.${panelId}`;
}
