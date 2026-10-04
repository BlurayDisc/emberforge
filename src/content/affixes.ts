import affixesData from '../../data/affixes.json';
import type { AffixKind, AffixStat } from '../model/item';

export interface AffixDefinition {
  id: string;
  kind: AffixKind;
  displayName: string;
  stat: AffixStat;
  minimumValue: number;
  maximumValue: number;
  // Percent affixes set this to false, so a high item level does not make them too strong.
  scalesWithItemLevel?: boolean;
}

export const AFFIXES = affixesData as unknown as readonly AffixDefinition[];
