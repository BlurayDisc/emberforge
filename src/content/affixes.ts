import affixesData from '../../data/affixes.json';
import type { AffixKind } from '../model/item';
import type { StatBlock } from '../model/statBlock';

export interface AffixDefinition {
  id: string;
  kind: AffixKind;
  displayName: string;
  stat: keyof StatBlock;
  minimumValue: number;
  maximumValue: number;
}

export const AFFIXES = affixesData as unknown as readonly AffixDefinition[];
