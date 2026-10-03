import {
  countCatalysts,
  craftItemCommand,
  listWorkshopRecipes,
  type IngredientView,
  type WorkshopRecipeView,
} from '../../../game';
import type { Item } from '../../../model/item';
import { actionButton, element } from '../../dom';
import type { PanelContext } from '../panelContext';

let usesCatalyst = false;

function describeIngredients(ingredients: readonly IngredientView[]): HTMLElement[] {
  return ingredients.map((ingredient) =>
    element(
      'span',
      ingredient.owned >= ingredient.needed ? 'ingredient' : 'ingredient missing',
      `${ingredient.materialName} ${ingredient.owned}/${ingredient.needed}`,
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
    context.notify(result.rejectionReason ?? 'Crafting failed.');
    return;
  }
  const item = findCraftedItem(context);
  context.notify(item ? `Crafted: ${item.name} (${item.quality}, item level ${item.itemLevel}).` : 'Crafted an item.');
}

function renderRecipe(context: PanelContext, recipe: WorkshopRecipeView, catalystCount: number): HTMLElement {
  const canCraft = recipe.canCraft && (!usesCatalyst || catalystCount > 0);
  return element(
    'div',
    'card',
    element('div', 'card-title', `${recipe.itemName} (${recipe.sizeText})`),
    element('div', 'card-text small', ...describeIngredients(recipe.ingredients)),
    actionButton('Craft', () => craft(context, recipe), { disabled: !canCraft }),
  );
}

export function renderWorkshopView(context: PanelContext, goBack: () => void): HTMLElement {
  const state = context.store.getState();
  const catalystCount = countCatalysts(state);
  const recipes = listWorkshopRecipes(state);
  const professions = [...new Set(recipes.map((recipe) => recipe.professionLabel))];

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
    element('p', 'hint', 'Materials come from monster drops. A recipe uses materials of one tier only. Item level depends on your best hero.'),
    element('label', 'card-row', catalystToggle, `Use 1 Tarnished Catalyst for better quality (you have ${catalystCount})`),
  );
  for (const profession of professions) {
    body.append(
      element('div', 'card-title', profession),
      element(
        'div',
        'card-grid',
        ...recipes.filter((recipe) => recipe.professionLabel === profession).map((recipe) => renderRecipe(context, recipe, catalystCount)),
      ),
    );
  }
  body.append(actionButton('Back to town square', goBack));
  return body;
}
