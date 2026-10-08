import assert from 'node:assert/strict';
import { findSpell } from '../src/content/spells';
import { createRandom } from '../src/kernel/random';
import type { BattleSpell } from '../src/model/spell';
import { simulateRealtimeBattle } from '../src/systems/battle';
import { createMonsterUnit } from '../src/systems/dungeons';
import { createHero } from '../src/systems/heroes';
import { heroToBattleUnit } from '../src/systems/stats';

const strike = (id: string, cooldownSeconds: number): BattleSpell => ({ id, isUltimate: false, cooldownSeconds, castSeconds: 0.2, resourceCost: 0, effect: { kind: 'damage', damageKind: 'physical', target: 'enemy', hits: 1, power: 1 } });

// A hero casts in slot order 1, 2, 3, then the Ultimate, with one basic attack after each cast. A spell that is not ready or would be wasted is skipped.
export function checkHeroSlotCastOrder(): void {
  const warrior = { ...createHero('warrior', 1, createRandom(4)), level: 20, learnedSpellIds: ['warrior.power-strike', 'warrior.shield-bash', 'warrior.guard-stance', 'warrior.heroic-strike'] };
  const equipped = { ...warrior, equippedSpellIds: ['warrior.guard-stance', 'warrior.power-strike', 'warrior.shield-bash'], equippedUltimateId: 'warrior.heroic-strike' };
  assert.ok(equipped.learnedSpellIds.every((id) => findSpell(id)), 'the cast order check uses real Warrior spells');
  assert.deepEqual(heroToBattleUnit(equipped).spells.map((spell) => spell.id), ['warrior.guard-stance', 'warrior.power-strike', 'warrior.shield-bash', 'warrior.heroic-strike'], 'hero spells reach the battle in slot order, the Ultimate last');

  const unhurtHeal: BattleSpell = { id: 'test.self-heal', isUltimate: false, cooldownSeconds: 0.1, castSeconds: 0.2, resourceCost: 0, effect: { kind: 'heal', target: 'self', power: 1 } };
  const spells = [unhurtHeal, strike('test.first', 0.1), strike('test.long-cooldown', 1000), strike('test.third', 0.1)];
  const hero = { ...heroToBattleUnit(warrior), id: 'hero-0', maxHp: 1_000_000, hp: 1_000_000, spells };
  const harmlessRat = { ...createMonsterUnit('cave-rat', 1, 'rat'), baseAttackSeconds: 10_000, maxHp: 1_000_000, hp: 1_000_000 };
  const report = simulateRealtimeBattle([hero, harmlessRat], createRandom(3).fork('battle'));
  const heroActions = report.actionEvents.flatMap((event) => {
    if (event.kind === 'castStart' && event.actorId === hero.id) return [event.spellId];
    if (event.kind === 'attackStart' && event.actorId === hero.id) return ['attack'];
    return [];
  }).slice(0, 10);
  assert.deepEqual(heroActions, ['test.first', 'attack', 'test.long-cooldown', 'attack', 'test.third', 'attack', 'test.first', 'attack', 'test.third', 'attack'],
    'a hero alternates cast and basic attack, goes round the slots, and skips a heal nobody needs and a spell on cooldown');
}
