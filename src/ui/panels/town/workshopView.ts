import { BASE_ITEMS } from '../../../content/baseItems';
import { CATALYST_MATERIAL_ID } from '../../../content/balance/items';
import { requireById } from '../../../content/lookup';
import { MATERIALS } from '../../../content/materials';
import {
  countCatalysts,
  craftItemCommand,
  listWorkshopRecipes,
  type IngredientView,
  type WorkshopRecipeView,
} from '../../../game';
import type { Item } from '../../../model/item';
import { actionButton, element } from '../../dom';
import { craftedBaseName, itemDisplayName, materialName, qualityName } from '../../displayNames';
import { describeRejection, t } from '../../i18n';
import { createItemIcon } from '../../iconArt';
import { createList, createListRow } from '../../listRow';
import type { PanelContext, PanelRenderer } from '../panelContext';

let usesCatalyst = false;

function describeIngredients(ingredients: readonly IngredientView[]): HTMLElement[] {
  return ingredients.map((ingredient) =>
    element(
      'span',
      ingredient.owned >= ingredient.needed ? 'ingredient' : 'ingredient missing',
      `${materialName(ingredient.materialId)} ${ingredient.owned}/${ingredient.needed}`,
    ),
  );
}

function findCraftedItem(context: PanelContext): Item | undefined {
  const itemId = `item-${context.store.getState().itemsCrafted}`;
  for (const entry of context.store.getState().backpack) {
    if (entry.content.kind === 'item' && entry.content.item.id === itemId) return entry.content.item;
  }
  return undefined;
}

function craft(context: PanelContext, recipe: WorkshopRecipeView): void {
  const result = context.store.execute(craftItemCommand(recipe.baseId, recipe.tier, usesCatalyst));
  if (!result.accepted) {
    context.notify(describeRejection(result.rejection));
    return;
  }
  const item = findCraftedItem(context);
  if (item) {
    context.notify(t('workshop.crafted', { name: itemDisplayName(item), quality: qualityName(item.quality), level: item.itemLevel }));
  }
}

function renderRecipe(context: PanelContext, recipe: WorkshopRecipeView, catalystCount: number): HTMLElement {
  const canCraft = recipe.canCraft && (!usesCatalyst || catalystCount > 0);
  const base = requireById(BASE_ITEMS, recipe.baseId);
  const mainMaterial = requireById(MATERIALS, recipe.mainMaterialId);
  return createListRow({
    art: createItemIcon(recipe.baseId, mainMaterial.id, base.mainCategory, 3),
    title: `${craftedBaseName(recipe.mainMaterialId, recipe.baseId)} (${recipe.sizeText})`,
    lines: [element('div', 'card-text small', ...describeIngredients(recipe.ingredients))],
    actions: [actionButton(t('workshop.craft'), () => craft(context, recipe), { disabled: !canCraft })],
  });
}

export const renderWorkshopPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const catalystCount = countCatalysts(state);
  const recipes = listWorkshopRecipes(state);
  const professionIds = [...new Set(recipes.map((recipe) => recipe.professionId))];

  const catalystToggle = element('input', '');
  catalystToggle.type = 'checkbox';
  catalystToggle.checked = usesCatalyst;
  catalystToggle.addEventListener('change', () => {
    usesCatalyst = catalystToggle.checked;
    context.requestRender();
  });

  const body = element(
    'div',
    'panel-body',
    element('p', 'hint', t('workshop.hint')),
    element('label', 'card-row', catalystToggle, t('workshop.useCatalyst', { catalyst: materialName(CATALYST_MATERIAL_ID), count: catalystCount })),
  );
  for (const professionId of professionIds) {
    const professionRecipes = recipes.filter((recipe) => recipe.professionId === professionId);
    body.append(
      element('div', 'section-title', t(`profession.${professionId}`)),
      createList(...professionRecipes.map((recipe) => renderRecipe(context, recipe, catalystCount))),
    );
  }
  body.append(actionButton(t('workshop.leave'), context.closePanel));
  return body;
};
