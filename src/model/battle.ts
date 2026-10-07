import type { ResourceId } from './resource';
import type { BattleSpell } from './spell';

export type BattleSide = 'party' | 'enemy';
export type MonsterRank = 'normal' | 'rare' | 'boss';
export type UnitRank = 'hero' | MonsterRank;
export type AttackKind = 'physical' | 'magic';
export type UnitBehavior = 'fighter' | 'healer';
// A unit without a priority keeps the default choice. 'highestDefence' attacks the opponent with the most Defence first (the frontline).
export type TargetPriority = 'highestDefence';
export type BattleActionKind = 'attack' | 'heal' | 'effect';

export interface BattleUnit {
  id: string;
  definitionId: string;
  name: string;
  side: BattleSide;
  rank: UnitRank;
  spriteKey: string;
  level: number;
  maxHp: number;
  hp: number;
  attack: number;
  attackKind: AttackKind;
  defence: number;
  resistance: number;
  // Seconds for one basic attack before any bonus, and the bonus from Agility and gear (0.25 means +25%). Haste and Slow join the same pool in battle.
  baseAttackSeconds: number;
  attackSpeedBonus: number;
  critChance: number;
  // How far one hit can swing from its base damage, as a fraction: 0.1 means 90-110%.
  damageVarianceFraction: number;
  criticalDamageMultiplier: number;
  // The main attribute value of the unit. Empower raises the attack from it. A monster has none (value 0).
  mainAttributeValue: number;
  // The fraction of damage dealt that the unit heals.
  lifeSteal: number;
  behavior: UnitBehavior;
  targetPriority?: TargetPriority;
  // The share of the flat Defence of the target that this unit's physical hits ignore. A boss uses it so a wall of Defence does not make it harmless.
  armourPenetration?: number;
  resourceId: ResourceId;
  maxResource: number;
  resource: number;
  spells: readonly BattleSpell[];
}

export interface BattleEvent {
  timeSeconds: number;
  kind: BattleActionKind;
  actorId: string;
  targetId: string;
  amount: number;
  isCritical: boolean;
  targetHpAfter: number;
  actorResourceAfter: number;
  targetResourceAfter: number;
  // Set on the first event of a spell cast: what the cast cost the actor.
  resourceSpent?: number;
  // True for damage that Thorns sent back. The actor is the unit that wore the Thorns.
  isReflect?: boolean;
  // True when the target dodged the hit (the amount is 0).
  isDodge?: boolean;
  // True for the damage that a Burn does each second. No spell look plays for it.
  isDamageOverTime?: boolean;
  // Damage that the shield of the target took, and what is left in the shield after the event.
  absorbed?: number;
  targetShieldAfter?: number;
  // Set when a spell caused the event. A spell with several targets gives one event for each target.
  spellId?: string;
}

export interface BattleReport {
  winner: BattleSide;
  durationSeconds: number;
  events: BattleEvent[];
  finalUnits: BattleUnit[];
}
