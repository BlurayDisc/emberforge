export type BattleSide = 'party' | 'enemy';
export type MonsterRank = 'normal' | 'rare' | 'boss';
export type UnitRank = 'hero' | MonsterRank;
export type AttackKind = 'physical' | 'magic';
export type UnitBehavior = 'fighter' | 'healer';
export type BattleActionKind = 'attack' | 'heal';

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
}

export interface BattleEvent {
  timeSeconds: number;
  kind: BattleActionKind;
  actorId: string;
  targetId: string;
  amount: number;
  isCritical: boolean;
  targetHpAfter: number;
}

export interface BattleReport {
  winner: BattleSide;
  durationSeconds: number;
  events: BattleEvent[];
  finalUnits: BattleUnit[];
}
