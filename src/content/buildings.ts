import buildingsData from '../../data/buildings.json';

export type BuildingStyle = 'tavern' | 'workshop' | 'merchant' | 'gate';

export interface BuildingDefinition {
  id: string;
  label: string;
  panelId: string;
  style: BuildingStyle;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const BUILDINGS = buildingsData as unknown as readonly BuildingDefinition[];
