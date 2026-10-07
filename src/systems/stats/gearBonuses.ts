import { MATERIALS } from '../../content/materials';
import type { Hero } from '../../model/hero';
import type { AffixStat } from '../../model/item';

type BonusBySource = Partial<Record<AffixStat, number>>;

// Base stats, affixes and the set material of every equipped item, added together for one stat.
export function gearBonusForStat(hero: Hero, stat: AffixStat): number {
  return Object.values(hero.equipment).reduce((total, item) => {
    const fromBase = (item.baseStats as BonusBySource)[stat] ?? 0;
    const fromAffixes = item.affixes.reduce((sum, affix) => (affix.stat === stat ? sum + affix.value : sum), 0);
    const setBonus = MATERIALS.find((material) => material.id === item.materialId)?.setBonus;
    const fromSetMaterial = setBonus?.stat === stat ? setBonus.value : 0;
    return total + fromBase + fromAffixes + fromSetMaterial;
  }, 0);
}

export function gearDamage(hero: Hero, damageKey: 'physicalDamage' | 'magicalDamage'): number {
  return Object.values(hero.equipment).reduce((total, item) => total + (item.baseStats[damageKey] ?? 0), 0);
}
