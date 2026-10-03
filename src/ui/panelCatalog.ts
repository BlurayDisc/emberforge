import { renderDungeonsPanel } from './panels/dungeonsPanel';
import { renderHeroesPanel } from './panels/heroesPanel';
import { renderInventoryPanel } from './panels/inventoryPanel';
import { renderMenuPanel } from './panels/menuPanel';
import type { PanelRenderer } from './panels/panelContext';
import { renderTownPanel } from './panels/townPanel';
import { renderWorldPanel } from './panels/worldPanel';

export type PanelId = 'heroes' | 'inventory' | 'dungeons' | 'world' | 'town' | 'menu';

export interface PanelDefinition {
  id: PanelId;
  label: string;
  render: PanelRenderer;
}

export const PANEL_CATALOG: readonly PanelDefinition[] = [
  { id: 'heroes', label: 'Heroes', render: renderHeroesPanel },
  { id: 'inventory', label: 'Inventory', render: renderInventoryPanel },
  { id: 'dungeons', label: 'Dungeons', render: renderDungeonsPanel },
  { id: 'world', label: 'World', render: renderWorldPanel },
  { id: 'town', label: 'Town', render: renderTownPanel },
  { id: 'menu', label: 'Menu', render: renderMenuPanel },
];
