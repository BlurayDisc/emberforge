import { BASE_ITEMS } from '../content/baseItems';
import { requireById } from '../content/lookup';
import { MATERIALS } from '../content/materials';
import type { Item } from '../model/item';
import { actionButton, element } from './dom';
import { craftedBaseName, materialName } from './displayNames';
import { t } from './i18n';
import { createItemCard, statLabel } from './itemText';
import { createItemPortrait, createMaterialPortrait } from './itemPortrait';
import { createMoneyDisplay } from './moneyDisplay';
import { openModal } from './modal';
import type { StatBlock } from '../model/statBlock';

export function formatStatRanges(ranges: Record<string, [number, number]>): string {
  return Object.entries(ranges)
    .map(([stat, [low, high]]) => `+${low === high ? low : `${low}-${high}`} ${statLabel(stat as keyof StatBlock)}`)
    .join(', ');
}

export function openItemView(item: Item): void {
  openModal(t('modal.itemTitle'), element('div', 'modal-columns', createItemPortrait(item), createItemCard(item)));
}

export function openMaterialView(materialId: string, extra: Node[] = []): void {
  const material = requireById(MATERIALS, materialId);
  const details = element(
    'div',
    'item-card',
    element('div', 'item-name', materialName(material.id)),
    element('div', 'card-text small', t('inventory.materialInfo', { tier: material.tier, category: t(`category.${material.category}`) })),
    element('div', 'card-row', t('item.sells'), createMoneyDisplay(material.sellValueCopper)),
    ...extra,
  );
  openModal(materialName(material.id), element('div', 'modal-columns', createMaterialPortrait(material.id), details));
}

export function createRecipeTitle(baseId: string, mainMaterialId: string): string {
  return craftedBaseName(mainMaterialId, requireById(BASE_ITEMS, baseId).id);
}

export { actionButton };
