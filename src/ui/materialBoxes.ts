import { requireById } from '../content/lookup';
import { MATERIALS } from '../content/materials';
import type { IngredientView } from '../game';
import { element } from './dom';
import { materialName } from './displayNames';
import { t } from './i18n';
import { createMaterialIcon } from './iconArt';
import { openMaterialView } from './itemModals';
import { createMoneyDisplay } from './moneyDisplay';

// The hover card of a material box. A tap on the box opens the same details on a touch screen.
export function createMaterialTooltip(materialId: string): HTMLElement {
  const material = requireById(MATERIALS, materialId);
  return element(
    'span',
    'loot-tooltip',
    element('strong', '', materialName(material.id)),
    element('span', 'card-text small', t('inventory.materialInfo', { tier: material.tier, category: t(`category.${material.category}`) })),
    createMoneyDisplay(material.sellValueCopper),
  );
}

// One box for each material a recipe needs. The count reads owned/needed and turns red when the player has too few.
export function createIngredientBoxes(ingredients: readonly IngredientView[]): HTMLElement {
  const boxes = ingredients.map((ingredient) => {
    const material = requireById(MATERIALS, ingredient.materialId);
    const isMissing = ingredient.owned < ingredient.needed;
    const quantity = element('span', 'loot-quantity', `${ingredient.owned}/${ingredient.needed}`);
    const box = element('button', `loot-box ingredient-box${isMissing ? ' missing' : ''}`, createMaterialIcon(material.id, material.category, 3), quantity, createMaterialTooltip(material.id));
    box.type = 'button';
    box.addEventListener('click', (event) => {
      event.stopPropagation();
      openMaterialView(material.id);
    });
    return box;
  });
  return element('div', 'ingredient-boxes', ...boxes);
}
