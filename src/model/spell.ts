import type { AttackKind } from './battle';
import type { ClassId } from './hero';

export type SpellStatus = 'guard' | 'haste' | 'weaken';

// Guard cuts the damage a unit takes. Haste adds speed. Weaken cuts the damage a unit deals. Strength is a fraction.
export type SpellEffect =
  | { kind: 'damage'; damageKind: AttackKind; target: 'enemy' | 'allEnemies'; hits: number; power: number }
  | { kind: 'drain'; damageKind: AttackKind; target: 'enemy'; hits: number; power: number; healFraction: number }
  | { kind: 'heal'; target: 'ally' | 'allAllies' | 'self'; power: number }
  | { kind: 'status'; status: SpellStatus; target: 'self' | 'allAllies' | 'enemy' | 'allEnemies'; strength: number; durationSeconds: number };

export interface SpellDefinition {
  id: string;
  classId: ClassId;
  unlockLevel: number;
  isUltimate: boolean;
  cooldownSeconds: number;
  resourceCost: number;
  effect: SpellEffect;
}
