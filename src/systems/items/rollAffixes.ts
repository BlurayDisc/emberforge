import { AFFIXES, type AffixDefinition } from '../../content/affixes';
import {
  AFFIX_GROWTH_PER_ITEM_LEVEL,
  MAGIC_AFFIX_COUNTS,
  MAXIMUM_AFFIXES_PER_KIND_MAGIC,
  MAXIMUM_AFFIXES_PER_KIND_RARE,
  RARE_AFFIX_COUNTS,
} from '../../content/balance/items';
import type { Random } from '../../kernel/random';
import type { AffixKind, ItemAffix, ItemQuality } from '../../model/item';

function pickDistinct(pool: readonly AffixDefinition[], count: number, random: Random): AffixDefinition[] {
  const remaining = [...pool];
  const picked: AffixDefinition[] = [];
  for (let pickNumber = 0; pickNumber < count && remaining.length > 0; pickNumber++) {
    const choice = random.pick(remaining);
    picked.push(choice);
    remaining.splice(remaining.indexOf(choice), 1);
  }
  return picked;
}

function splitAffixCount(totalCount: number, maximumPerKind: number, random: Random): Record<AffixKind, number> {
  const minimumPrefixes = Math.max(0, totalCount - maximumPerKind);
  const maximumPrefixes = Math.min(totalCount, maximumPerKind);
  const prefixCount = random.nextInt(minimumPrefixes, maximumPrefixes);
  return { prefix: prefixCount, suffix: totalCount - prefixCount };
}

function rollAffixValue(definition: AffixDefinition, itemLevel: number, random: Random): number {
  const levelFactor = 1 + AFFIX_GROWTH_PER_ITEM_LEVEL * (itemLevel - 1);
  const rolled = random.nextInt(definition.minimumValue, definition.maximumValue);
  return Math.max(1, Math.round(rolled * levelFactor));
}

export function rollAffixes(quality: ItemQuality, itemLevel: number, random: Random): ItemAffix[] {
  if (quality !== 'magic' && quality !== 'rare') return [];
  const counts = quality === 'magic' ? MAGIC_AFFIX_COUNTS : RARE_AFFIX_COUNTS;
  const maximumPerKind = quality === 'magic' ? MAXIMUM_AFFIXES_PER_KIND_MAGIC : MAXIMUM_AFFIXES_PER_KIND_RARE;
  const split = splitAffixCount(random.pick(counts), maximumPerKind, random);

  const chosen = [
    ...pickDistinct(AFFIXES.filter((affix) => affix.kind === 'prefix'), split.prefix, random),
    ...pickDistinct(AFFIXES.filter((affix) => affix.kind === 'suffix'), split.suffix, random),
  ];
  return chosen.map((definition) => ({
    affixId: definition.id,
    kind: definition.kind,
    displayName: definition.displayName,
    stat: definition.stat,
    value: rollAffixValue(definition, itemLevel, random),
  }));
}
