import type { BattleSpell, SpellDefinition, SpellEffect } from '../model/spell';
import { classResourceName } from './displayNames';
import { t } from './i18n';

const percentOf = (fraction: number): number => Math.round(fraction * 100);

export function spellName(spellId: string): string {
  return t(`spell.${spellId}`);
}

function describeEffect(effect: SpellEffect): string {
  switch (effect.kind) {
    case 'damage': {
      const damageText = effect.target === 'allEnemies'
        ? t('spell.effect.damageAllEnemies', { percent: percentOf(effect.power) })
        : effect.hits > 1
          ? t('spell.effect.damageEnemyMulti', { hits: effect.hits, percent: percentOf(effect.power) })
          : t('spell.effect.damageEnemy', { percent: percentOf(effect.power) });
      if (!effect.inflicts) return damageText;
      return `${damageText} ${t('spell.effect.inflicts', { effect: t(`spell.status.${effect.inflicts.status}`, { percent: percentOf(effect.inflicts.strength) }), seconds: effect.inflicts.durationSeconds })}`;
    }
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

// A monster casts at heroes, so the words "you" and "enemy" of a hero spell would be wrong here.
export function describeMonsterSpell(spell: BattleSpell): string {
  const { effect } = spell;
  if (effect.kind === 'damage') {
    const damageText = t('spell.monster.damage', { percent: percentOf(effect.power) });
    if (!effect.inflicts) return damageText;
    return `${damageText} ${t('spell.effect.inflicts', { effect: t(`spell.status.${effect.inflicts.status}`, { percent: percentOf(effect.inflicts.strength) }), seconds: effect.inflicts.durationSeconds })}`;
  }
  if (effect.kind === 'status') {
    return t('spell.effect.status', {
      effect: t(`spell.status.${effect.status}`, { percent: percentOf(effect.strength) }),
      target: t(`spell.monster.target.${effect.target}`),
      seconds: effect.durationSeconds,
    });
  }
  return describeEffect(effect);
}
