import type { BattleUnit } from '../model/battle';
import type { ClassId } from '../model/hero';
import type { Item, ItemQuality } from '../model/item';
import { hasTranslation, t } from './i18n';

export function className(classId: ClassId): string {
  return t(`class.${classId}.name`);
}

export function heroDisplayName(storedName: string): string {
  return hasTranslation(`heroname.${storedName}`) ? t(`heroname.${storedName}`) : storedName;
}

export function materialName(materialId: string): string {
  return t(`material.${materialId}`);
}

export function qualityName(quality: ItemQuality): string {
  return t(`quality.${quality}`);
}

export function listOf(names: readonly string[]): string {
  return names.join(t('format.listJoiner'));
}

export function craftedBaseName(materialId: string, baseId: string): string {
  return [t(`material.${materialId}.prefix`), t(`base.${baseId}`)].join(t('format.nameJoiner'));
}

export function itemBaseDisplayName(item: Item): string {
  return craftedBaseName(item.materialId, item.baseId);
}

export function itemDisplayName(item: Item): string {
  const joiner = t('format.nameJoiner');
  if (item.rareNameParts) {
    const [first, second] = item.rareNameParts;
    return [t(`rarename.first.${first}`), t(`rarename.second.${second}`)].join(joiner);
  }
  const prefix = item.affixes.find((affix) => affix.kind === 'prefix');
  const suffix = item.affixes.find((affix) => affix.kind === 'suffix');
  return [prefix ? t(`affix.${prefix.affixId}`) : '', itemBaseDisplayName(item), suffix ? t(`affix.${suffix.affixId}`) : '']
    .filter((part) => part !== '')
    .join(joiner);
}

export function unitDisplayName(unit: BattleUnit): string {
  return unit.rank === 'hero' ? heroDisplayName(unit.name) : t(`monster.${unit.definitionId}`);
}
