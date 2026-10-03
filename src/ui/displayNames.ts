import type { BattleUnit } from '../model/battle';
import type { ClassId } from '../model/hero';
import type { ResourceId } from '../model/resource';
import { CLASSES } from '../content/classes';
import { requireById } from '../content/lookup';
import type { Item, ItemQuality } from '../model/item';
import { hasTranslation, t } from './i18n';

export function className(classId: ClassId): string {
  return t(`class.${classId}.name`);
}

export function resourceName(resourceId: ResourceId): string {
  return t(`resource.${resourceId}`);
}

export function classResourceName(classId: ClassId): string {
  return resourceName(requireById(CLASSES, classId).resourceId);
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

export function itemNameWithoutUpgrade(item: Item): string {
  if (item.rareNameParts) {
    const [first, second] = item.rareNameParts;
    return [t(`rarename.first.${first}`), t(`rarename.second.${second}`)].join(t('format.nameJoiner'));
  }
  const prefix = item.affixes.find((affix) => affix.kind === 'prefix');
  const suffix = item.affixes.find((affix) => affix.kind === 'suffix');
  // Each language orders the parts itself: English "Arcane Copper Sword of the Bear", Chinese suffix first.
  return t('format.itemName', {
    prefix: prefix ? t(`affix.${prefix.affixId}`) : '',
    base: itemBaseDisplayName(item),
    suffix: suffix ? t(`affix.${suffix.affixId}`) : '',
  }).replace(/\s+/g, ' ').trim();
}

export function itemDisplayName(item: Item): string {
  return item.upgradeLevel > 0 ? `${itemNameWithoutUpgrade(item)} +${item.upgradeLevel}` : itemNameWithoutUpgrade(item);
}

export function unitDisplayName(unit: BattleUnit): string {
  return unit.rank === 'hero' ? heroDisplayName(unit.name) : t(`monster.${unit.definitionId}`);
}
