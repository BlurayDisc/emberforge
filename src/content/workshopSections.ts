import workshopSectionsData from '../../data/workshop-sections.json';
import type { ProfessionId } from './baseItems';

export interface WorkshopSection {
  id: string;
  professionIds: readonly ProfessionId[];
}

// A profession that is in no section is hidden from the workshop (jewelcrafting, until a later unlock).
export const WORKSHOP_SECTIONS = workshopSectionsData.sections as readonly WorkshopSection[];
