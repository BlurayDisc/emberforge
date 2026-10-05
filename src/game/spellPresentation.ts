import { SPELL_SOUNDS, type SpellSoundSet } from '../content/audio';
import { MONSTER_SPELLS } from '../content/monsterSpells';
import { SPELLS } from '../content/spells';
import { findSpellVisual, type SpellVisualSpec } from '../content/spellVisuals';
import type { BattleEvent, BattleUnit } from '../model/battle';
import type { BattleSpell } from '../model/spell';

export type SpellRole = 'damage' | 'heal' | 'buff' | 'debuff';

// Everything the stage and the speaker need to show one battle event that a spell caused.
export interface SpellPresentation {
  spellId: string;
  role: SpellRole;
  visual: SpellVisualSpec | undefined;
  sounds: SpellSoundSet | undefined;
  // True on the first event of a cast. The cast effect and cast sound play once for each cast.
  startsCast: boolean;
  // The place of this hit among the hits of one cast. A spell with many hits shows them one after the other.
  hitIndex: number;
  // False for the second arrow at the same enemy. The inflicted status shows once for each enemy.
  isFirstHitOnTarget: boolean;
  // How long the status lasts on the target: for a buff, a debuff, or the debuff that a damage hit inflicts.
  statusDurationSeconds: number | null;
  // A damage spell that also gives the caster a status (Evasive Shot): how long it lasts. The buff look shows on the caster once for each cast.
  selfStatusDurationSeconds: number | null;
}

function findBattleSpell(spellId: string): BattleSpell | undefined {
  return SPELLS.find((spell) => spell.id === spellId) ?? MONSTER_SPELLS.find((spell) => spell.id === spellId);
}

function isSameCast(first: BattleEvent, second: BattleEvent): boolean {
  return first.actorId === second.actorId && first.timeSeconds === second.timeSeconds && first.spellId === second.spellId;
}

function roleOf(spell: BattleSpell, event: BattleEvent, unitsById: ReadonlyMap<string, BattleUnit>): SpellRole {
  if (event.kind === 'heal') return 'heal';
  if (event.kind === 'attack') return 'damage';
  const isOpponent = unitsById.get(event.actorId)?.side !== unitsById.get(event.targetId)?.side;
  return spell.effect.kind === 'status' && isOpponent ? 'debuff' : 'buff';
}

function statusDurationOf(spell: BattleSpell, role: SpellRole): number | null {
  if (spell.effect.kind === 'status' || spell.effect.kind === 'shield') return spell.effect.durationSeconds;
  if (role === 'damage' && spell.effect.kind === 'damage') return spell.effect.inflicts?.durationSeconds ?? null;
  return null;
}

// Returns null when a spell did not cause the event. Only a heal spell shows heal effects: a life steal heal has no spell look.
export function describeSpellEvent(events: readonly BattleEvent[], eventIndex: number, unitsById: ReadonlyMap<string, BattleUnit>): SpellPresentation | null {
  const event = events[eventIndex];
  if (!event || event.spellId === undefined) return null;
  const spell = findBattleSpell(event.spellId);
  if (!spell) return null;
  const role = roleOf(spell, event, unitsById);
  let castStartIndex = eventIndex;
  while (castStartIndex > 0 && isSameCast(events[castStartIndex - 1] as BattleEvent, event)) castStartIndex -= 1;
  // Hits that a spread spell sends to different enemies still fall one after the other.
  const isSpread = spell.effect.kind === 'damage' && spell.effect.target === 'spreadEnemies';
  const hitsBefore = events.slice(castStartIndex, eventIndex).filter((earlier) => earlier.kind === event.kind && (isSpread || earlier.targetId === event.targetId)).length;
  const isFirstHitOnTarget = !events.slice(castStartIndex, eventIndex).some((earlier) => earlier.kind === event.kind && earlier.targetId === event.targetId);
  const showsLook = role !== 'heal' || spell.effect.kind === 'heal';
  return {
    spellId: spell.id,
    role,
    visual: showsLook ? findSpellVisual(spell.id) : undefined,
    sounds: showsLook ? SPELL_SOUNDS[spell.id] : undefined,
    startsCast: castStartIndex === eventIndex,
    hitIndex: hitsBefore,
    isFirstHitOnTarget,
    statusDurationSeconds: statusDurationOf(spell, role),
    selfStatusDurationSeconds: spell.effect.kind === 'damage' ? spell.effect.alsoOnSelf?.durationSeconds ?? null : null,
  };
}
