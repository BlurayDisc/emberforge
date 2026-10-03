import type { SpellDefinition, SpellEffect } from '../model/spell';
import { classResourceName } from './displayNames';
import { t } from './i18n';

const percentOf = (fraction: number): number => Math.round(fraction * 100);

export function spellName(spellId: string): string {
  return t(`spell.${spellId}`);
}

function describeEffect(effect: SpellEffect): string {
  switch (effect.kind) {
    case 'damage':
      if (effect.target === 'allEnemies') return t('spell.effect.damageAllEnemies', { percent: percentOf(effect.power) });
      return effect.hits > 1
        ? t('spell.effect.damageEnemyMulti', { hits: effect.hits, percent: percentOf(effect.power) })
        : t('spell.effect.damageEnemy', { percent: percentOf(effect.power) });
    case 'drain':
      return t('spell.effect.drain', { percent: percentOf(effect.power), heal: percentOf(effect.healFraction) });
    case 'heal':
      return t(`spell.effect.heal.${effect.target}`, { percent: percentOf(effect.power) });
    case 'status':
      return t('spell.effect.status', {
        effect: t(`spell.status.${effect.status}`, { percent: percentOf(effect.strength) }),
        target: t(`spell.target.${effect.target}`),
        seconds: effect.durationSeconds,
      });
  }
}

export function describeSpell(spell: SpellDefinition): string {
  return describeEffect(spell.effect);
}

export function describeSpellCosts(spell: SpellDefinition): string {
  return t('spell.costs', { resource: classResourceName(spell.classId), cost: spell.resourceCost, seconds: spell.cooldownSeconds });
}
