import buildingsData from '../../data/buildings.json';

export type BuildingStyle = 'tavern' | 'workshop' | 'merchant' | 'gate' | 'keep' | 'cottage' | 'townhouse' | 'chapel' | 'barn' | 'mill' | 'barracks' | 'watchtower' | 'stall' | 'bank' | 'academy';

export interface BuildingDefinition {
  id: string;
  // Houses and stalls have no name sign.
  label: string | null;
  panelId: string | null;
  // A building that opens a place instead of a menu.
  opens?: 'castle';
  style: BuildingStyle;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const BUILDINGS = buildingsData as unknown as readonly BuildingDefinition[];
