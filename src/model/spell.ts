import type { AttackKind } from './battle';
import type { ClassId } from './hero';

export type SpellStatus = 'guard' | 'haste' | 'weaken' | 'slow' | 'wound';

// Guard cuts the damage a unit takes. Haste adds speed. Slow cuts speed. Weaken cuts the damage a unit deals. Wound cuts the healing a unit receives. Strength is a fraction.
// A damage spell can also put a status on each enemy that it hits.
export interface InflictedStatus {
  status: SpellStatus;
  strength: number;
  durationSeconds: number;
}

export type SpellEffect =
  | { kind: 'damage'; damageKind: AttackKind; target: 'enemy' | 'allEnemies'; hits: number; power: number; inflicts?: InflictedStatus }
  | { kind: 'drain'; damageKind: AttackKind; target: 'enemy'; hits: number; power: number; healFraction: number }
  | { kind: 'heal'; target: 'ally' | 'allAllies' | 'self'; power: number }
  | { kind: 'status'; status: SpellStatus; target: 'self' | 'allAllies' | 'enemy' | 'allEnemies'; strength: number; durationSeconds: number };

// What a battle needs to cast a spell. A monster spell is only this.
export interface BattleSpell {
  id: string;
  isUltimate: boolean;
  cooldownSeconds: number;
  resourceCost: number;
  effect: SpellEffect;
}

export interface SpellDefinition extends BattleSpell {
  classId: ClassId;
  unlockLevel: number;
}
