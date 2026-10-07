// Report of a real-time battle (see systems/battle/realtime). The report is built once from a seed and replayed by the screen.
//
// Time: the battle runs in fixed ticks of `tickSeconds`. Tick i is at time i * tickSeconds. Every track has one sample per tick, from tick 0 (the start) to the last tick,
// so sample i of any track is the state of that unit at time i * tickSeconds. A track keeps its last position after the unit died (state 'dead').
//
// Space: x runs along the field (0 to field.length), y across it (0 to field.depth). Heroes start on the left, monsters on the right. Units are circles of `bodyRadius`.
// facing is -1 (looks left) or 1 (looks right).
//
// Events: `events` keep the old BattleEvent shape (the damage, heal or effect lands at its timeSeconds). `actionEvents` add the start of every action and deaths, so a view can
// play the windup before the hit and the cast before the effect. Order of play for one attack: attackStart (windup begins) ... a BattleEvent at hitAtSeconds.
// For a ranged attack, projectile is true: the damage is already applied at hitAtSeconds (the release). The projectile is only visual and its flight needs no result.
import type { BattleReport, BattleSide, UnitRank } from './battle';

export type UnitMotionState = 'idle' | 'moving' | 'attacking' | 'casting' | 'dead';

export interface UnitTrack {
  unitId: string;
  side: BattleSide;
  rank: UnitRank;
  bodyRadius: number;
  attackReach: number;
  x: number[];
  y: number[];
  facing: (1 | -1)[];
  state: UnitMotionState[];
}

export type RealtimeActionEvent =
  | { kind: 'attackStart'; timeSeconds: number; actorId: string; targetId: string; hitAtSeconds: number; endsAtSeconds: number; projectile: boolean; isHeal: boolean }
  | { kind: 'castStart'; timeSeconds: number; actorId: string; targetId: string | null; spellId: string; effectAtSeconds: number }
  | { kind: 'death'; timeSeconds: number; unitId: string };

export interface RealtimeBattleReport extends BattleReport {
  tickSeconds: number;
  field: { length: number; depth: number };
  tracks: UnitTrack[];
  actionEvents: RealtimeActionEvent[];
}
