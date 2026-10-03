import materialsData from '../../data/materials.json';
import type { MaterialCategory } from '../model/material';

export interface MaterialDefinition {
  id: string;
  name: string;
  tier: number;
  category: MaterialCategory;
  sellValueCopper: number;
  craftedItemPrefix?: string;
}

export const MATERIALS = materialsData as unknown as readonly MaterialDefinition[];
