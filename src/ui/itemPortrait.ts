import { BASE_ITEMS } from '../content/baseItems';
import { requireById } from '../content/lookup';
import { MATERIALS } from '../content/materials';
import type { Item } from '../model/item';
import { element } from './dom';
import { createItemIcon, createMaterialIcon } from './iconArt';

// A big framed pixel picture. The frame color shows the item quality.
export function createItemPortrait(item: Item): HTMLElement {
  const base = requireById(BASE_ITEMS, item.baseId);
  return element('div', `item-portrait quality-border-${item.quality}`, createItemIcon(item.baseId, item.materialId, base.mainCategory, 8));
}

export function createRecipePortrait(baseId: string, mainMaterialId: string): HTMLElement {
  const base = requireById(BASE_ITEMS, baseId);
  return element('div', 'item-portrait', createItemIcon(baseId, mainMaterialId, base.mainCategory, 8));
}

export function createMaterialPortrait(materialId: string): HTMLElement {
  const material = requireById(MATERIALS, materialId);
  return element('div', 'item-portrait', createMaterialIcon(material.id, material.category, 8));
}
