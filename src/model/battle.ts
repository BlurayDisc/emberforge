import type { ResourceId } from './resource';
import type { BattleSpell } from './spell';

export type BattleSide = 'party' | 'enemy';
export type MonsterRank = 'normal' | 'rare' | 'boss';
export type UnitRank = 'hero' | MonsterRank;
export type AttackKind = 'physical' | 'magic';
export type UnitBehavior = 'fighter' | 'healer';
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
  speed: number;
  critChance: number;
  behavior: UnitBehavior;
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
  // Set when a spell caused the event. A spell with several targets gives one event for each target.
  spellId?: string;
}

export interface BattleReport {
  winner: BattleSide;
  durationSeconds: number;
  events: BattleEvent[];
  finalUnits: BattleUnit[];
}
