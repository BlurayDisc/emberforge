import type { BattleSpell, SpellDefinition, SpellEffect } from '../model/spell';
import { classResourceName } from './displayNames';
import { t } from './i18n';

const percentOf = (fraction: number): number => Math.round(fraction * 100);

export function spellName(spellId: string): string {
  return t(`spell.${spellId}`);
}

function statusPhrase(inflicted: { status: string; strength: number; charges?: number }): string {
  return t(`spell.status.${inflicted.status}`, { percent: percentOf(inflicted.strength), charges: inflicted.charges ?? 1 });
}

function describeEffect(effect: SpellEffect): string {
  switch (effect.kind) {
    case 'damage': {
      const damageText = effect.target === 'allEnemies'
        ? t('spell.effect.damageAllEnemies', { percent: percentOf(effect.power) })
        : effect.target === 'spreadEnemies'
          ? t('spell.effect.damageSpread', { hits: effect.hits, percent: percentOf(effect.power) })
          : effect.hits > 1
          ? t('spell.effect.damageEnemyMulti', { hits: effect.hits, percent: percentOf(effect.power) })
          : t('spell.effect.damageEnemy', { percent: percentOf(effect.power) });
      const parts = [damageText];
      if (effect.defencePower) parts.push(t('spell.effect.defenceBonus', { percent: percentOf(effect.defencePower) }));
      if (effect.magicPower) parts.push(t('spell.effect.magicBonus', { percent: percentOf(effect.magicPower) }));
      if (effect.inflicts) parts.push(t('spell.effect.inflicts', { effect: statusPhrase(effect.inflicts), seconds: effect.inflicts.durationSeconds }));
      if (effect.alsoOnSelf) parts.push(t('spell.effect.alsoOnSelf', { effect: statusPhrase(effect.alsoOnSelf), seconds: effect.alsoOnSelf.durationSeconds }));
      return parts.join(' ');
    }
    case 'drain':
      return t('spell.effect.drain', { percent: percentOf(effect.power), heal: percentOf(effect.healFraction) });
    case 'heal':
      return t(`spell.effect.heal.${effect.target}`, { percent: percentOf(effect.power) });
    case 'shield':
      return t('spell.effect.shield', { percent: percentOf(effect.resourceFraction), absorb: effect.absorbPerResourcePoint, seconds: effect.durationSeconds });
    case 'status': {
      const statusText = t('spell.effect.status', {
        effect: statusPhrase(effect),
        target: t(`spell.target.${effect.target}`),
        seconds: effect.durationSeconds,
      });
      if (!effect.alsoOnSelf) return statusText;
      return `${statusText} ${t('spell.effect.alsoOnSelf', { effect: statusPhrase(effect.alsoOnSelf), seconds: effect.alsoOnSelf.durationSeconds })}`;
    }
  }
}

export function describeSpell(spell: SpellDefinition): string {
  return describeEffect(spell.effect);
}

export function describeSpellCosts(spell: SpellDefinition): string {
  if (spell.effect.kind === 'shield') return t('spell.costsShare', { resource: classResourceName(spell.classId), percent: percentOf(spell.effect.resourceFraction), seconds: spell.cooldownSeconds });
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
