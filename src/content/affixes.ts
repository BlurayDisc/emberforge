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

export const AFFIXES: readonly AffixDefinition[] = [
  { id: 'mighty', kind: 'prefix', displayName: 'Mighty', stat: 'strength', minimumValue: 1, maximumValue: 3 },
  { id: 'arcane', kind: 'prefix', displayName: 'Arcane', stat: 'magic', minimumValue: 1, maximumValue: 3 },
  { id: 'sturdy', kind: 'prefix', displayName: 'Sturdy', stat: 'defence', minimumValue: 1, maximumValue: 3 },
  { id: 'warded', kind: 'prefix', displayName: 'Warded', stat: 'resistance', minimumValue: 1, maximumValue: 3 },
  { id: 'of-the-bear', kind: 'suffix', displayName: 'of the Bear', stat: 'hp', minimumValue: 4, maximumValue: 10 },
  { id: 'of-haste', kind: 'suffix', displayName: 'of Haste', stat: 'speed', minimumValue: 1, maximumValue: 3 },
  { id: 'of-precision', kind: 'suffix', displayName: 'of Precision', stat: 'skill', minimumValue: 1, maximumValue: 3 },
  { id: 'of-the-ox', kind: 'suffix', displayName: 'of the Ox', stat: 'strength', minimumValue: 1, maximumValue: 2 },
];
