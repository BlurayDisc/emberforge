import type { AttackKind } from './battle';
import type { ClassId } from './hero';

export type SpellStatus = 'guard' | 'fortify' | 'thorns' | 'sunder' | 'haste' | 'weaken' | 'slow' | 'wound' | 'evade' | 'burn' | 'hex' | 'empower';

// Guard and Fortify raise the armour of a unit, Sunder cuts it (all three are shares of the flat armour value). Thorns sends a share of the damage a unit takes back to the attacker. Haste adds attack speed. Slow cuts attack speed (same pool). Weaken cuts the damage a unit deals. Wound cuts the healing a unit receives. Evade dodges whole hits (strength is 1, charges is how many hits it can dodge). Burn hurts the unit once each second (strength is a fraction of the attack of the caster, as magic damage). Hex raises the magic damage that a unit takes. Empower raises the main attribute of the caster (Strength, Agility or Intelligence). Strength is a fraction.
// A damage spell can also put a status on each enemy that it hits.
export interface InflictedStatus {
  status: SpellStatus;
  strength: number;
  durationSeconds: number;
  charges?: number;
}

export type SpellEffect =
  // defencePower adds this fraction of the caster's Defence to the damage of each hit. magicPower adds a second part to each hit
  // (a fraction of the attack) that deals magic damage, so Resistance cuts it and Defence does not.
  // 'spreadEnemies' shoots the hits one after the other, each at the next living enemy (arrow 1 at enemy 1, arrow 2 at enemy 2, then enemy 1 again). With one enemy, every hit lands on it.
  // alsoOnSelf is a status that the caster gets when the spell is cast.
  | { kind: 'damage'; damageKind: AttackKind; target: 'enemy' | 'allEnemies' | 'spreadEnemies'; hits: number; power: number; defencePower?: number; magicPower?: number; inflicts?: InflictedStatus; alsoOnSelf?: InflictedStatus }
  | { kind: 'drain'; damageKind: AttackKind; target: 'enemy'; hits: number; power: number; healFraction: number }
  | { kind: 'heal'; target: 'ally' | 'allAllies' | 'self'; power: number }
  // alsoOnSelf is a second status that the caster gets, whoever the spell targets.
  // A shield pays a share of the maximum resource pool of the caster (resourceCost is 0). It absorbs a flat amount plus a share of the maximum health of the caster (the flat part is the early power spike, the health part grows with the hero), and it ends after durationSeconds.
  // The shield has its own counter: damage empties the shield before it touches the health.
  | { kind: 'shield'; target: 'self'; resourceFraction: number; absorbFlat: number; absorbMaxHpFraction: number; durationSeconds: number }
  | { kind: 'status'; status: SpellStatus; target: 'self' | 'allAllies' | 'enemy' | 'allEnemies'; strength: number; durationSeconds: number; charges?: number; alsoOnSelf?: InflictedStatus };

// What a battle needs to cast a spell. A monster spell is only this.
export interface BattleSpell {
  id: string;
  isUltimate: boolean;
  cooldownSeconds: number;
  // How long the caster stands still while it casts. 0 is an instant cast.
  castSeconds: number;
  resourceCost: number;
  effect: SpellEffect;
}

export interface SpellDefinition extends BattleSpell {
  classId: ClassId;
  unlockLevel: number;
  // The spells of one family are ranks of one spell (Shield Bash, Shield Bash II). Learning a rank replaces the lower rank, in the same slot.
  // A spell without these fields is rank 1 of its own family.
  familyId?: string;
  rank?: number;
  // A reserved spell stays in the data, but the game does not load it. A class specialisation reuses it later.
  reservedFor?: 'specialisation';
  note?: string;
}
