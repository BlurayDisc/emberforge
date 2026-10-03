import type { ResourceId } from '../model/resource';
import { PALETTE } from './palette';

export const RESOURCE_BAR_COLORS: Readonly<Record<ResourceId, string>> = {
  mana: PALETTE.cobalt,
  stamina: PALETTE.stamina,
  hatred: PALETTE.violet,
  rage: PALETTE.rage,
};
