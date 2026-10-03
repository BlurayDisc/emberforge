import { renderDungeonsPanel } from './panels/dungeonsPanel';
import { renderHeroesPanel } from './panels/heroesPanel';
import { renderInventoryPanel } from './panels/inventoryPanel';
import { renderMenuPanel } from './panels/menuPanel';
import type { PanelRenderer } from './panels/panelContext';
import { renderMerchantPanel } from './panels/town/merchantView';
import { renderTavernPanel } from './panels/town/tavernView';
import { renderWorkshopPanel } from './panels/town/workshopView';
import { renderWorldPanel } from './panels/worldPanel';
import type { IconName } from './pixelIcons';

export interface PanelDefinition {
  id: string;
  label: string;
  barIcon: IconName | null;
  render: PanelRenderer;
}

export const PANEL_CATALOG: readonly PanelDefinition[] = [
  { id: 'heroes', label: 'Heroes', barIcon: 'heroes', render: renderHeroesPanel },
  { id: 'inventory', label: 'Inventory', barIcon: 'inventory', render: renderInventoryPanel },
  { id: 'dungeons', label: 'Dungeons', barIcon: 'dungeons', render: renderDungeonsPanel },
  { id: 'world', label: 'World', barIcon: 'world', render: renderWorldPanel },
  { id: 'menu', label: 'Menu', barIcon: 'menu', render: renderMenuPanel },
  { id: 'tavern', label: 'Tavern', barIcon: null, render: renderTavernPanel },
  { id: 'workshop', label: 'Workshop', barIcon: null, render: renderWorkshopPanel },
  { id: 'merchant', label: 'Merchant', barIcon: null, render: renderMerchantPanel },
];
