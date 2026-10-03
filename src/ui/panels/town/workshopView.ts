import { BASE_ITEMS } from '../../../content/baseItems';
import { CATALYST_MATERIAL_ID } from '../../../content/balance/items';
import { requireById } from '../../../content/lookup';
import { MATERIALS } from '../../../content/materials';
import {
  countCatalysts,
  craftItemCommand,
  crafterJob,
  listCrafters,
  listWorkshopRecipes,
  type CrafterView,
  type IngredientView,
  type WorkshopRecipeView,
} from '../../../game';
import { actionButton, element, percentBar } from '../../dom';
import { craftedBaseName, itemDisplayName, materialName } from '../../displayNames';
import { describeRejection, t } from '../../i18n';
import { createItemIcon, createLockIcon } from '../../iconArt';
import { createRecipePortrait } from '../../itemPortrait';
import { formatStatRanges } from '../../itemModals';
import { formatDuration } from '../../liveUpdate';
import { createJobBar } from '../../liveBars';
import { createList, createListRow } from '../../listRow';
import { openModal } from '../../modal';
import type { PanelContext, PanelRenderer } from '../panelContext';

let usesCatalyst = false;

function describeIngredients(ingredients: readonly IngredientView[]): HTMLElement[] {
  return ingredients.map((ingredient) =>
    element('span', ingredient.owned >= ingredient.needed ? 'ingredient' : 'ingredient missing', `${materialName(ingredient.materialId)} ${ingredient.owned}/${ingredient.needed}`),
  );
}

function craft(context: PanelContext, recipe: WorkshopRecipeView): boolean {
  const result = context.store.execute(craftItemCommand(recipe.baseId, recipe.tier, usesCatalyst, Date.now()));
  if (!result.accepted) {
    context.notify(describeRejection(result.rejection));
    return false;
  }
  context.notify(t('workshop.started', { name: craftedBaseName(recipe.mainMaterialId, recipe.baseId) }));
  return true;
}

function openRecipe(context: PanelContext, recipe: WorkshopRecipeView): void {
  const details = element(
    'div',
    'item-card',
    element('div', 'item-name', craftedBaseName(recipe.mainMaterialId, recipe.baseId)),
    element('div', 'card-text small', recipe.isUnlocked ? t('workshop.unlocked') : t('workshop.needsLevel', { profession: t(`profession.${recipe.professionId}`), level: recipe.requiredCraftLevel })),
    element('div', 'card-text', t('workshop.preview', { stats: formatStatRanges(recipe.statRanges) })),
    element('div', 'card-text small', t('workshop.craftTime', { time: formatDuration(recipe.craftSeconds) })),
    element('div', 'card-text small', ...describeIngredients(recipe.ingredients)),
  );
  const modal = openModal(t('modal.recipeTitle'), element('div', 'modal-columns', createRecipePortrait(recipe.baseId, recipe.mainMaterialId), details));
  details.append(actionButton(t('workshop.craft'), () => {
    if (craft(context, recipe)) modal.close();
  }, { disabled: !recipe.isUnlocked || !recipe.hasMaterials || recipe.isCrafterBusy, className: 'action-button primary' }));
}

function renderRecipe(context: PanelContext, recipe: WorkshopRecipeView): HTMLElement {
  const base = requireById(BASE_ITEMS, recipe.baseId);
  const mainMaterial = requireById(MATERIALS, recipe.mainMaterialId);
  const art = recipe.isUnlocked ? createItemIcon(recipe.baseId, mainMaterial.id, base.mainCategory, 3) : createLockIcon(3);
  const info = recipe.isUnlocked
    ? element('div', 'card-text small', ...describeIngredients(recipe.ingredients))
    : element('div', 'card-text small locked-note', t('workshop.needsLevel', { profession: t(`profession.${recipe.professionId}`), level: recipe.requiredCraftLevel }));
  const row = createListRow({
    art,
    title: `${craftedBaseName(recipe.mainMaterialId, recipe.baseId)} (${recipe.sizeText})`,
    lines: [info],
    actions: [actionButton(t('workshop.craft'), () => craft(context, recipe), { disabled: !recipe.isUnlocked || !recipe.hasMaterials || recipe.isCrafterBusy })],
    className: `clickable${recipe.isUnlocked ? '' : ' locked'}`,
  });
  row.querySelector('.row-art')?.addEventListener('click', () => openRecipe(context, recipe));
  row.querySelector('.row-body')?.addEventListener('click', () => openRecipe(context, recipe));
  return row;
}

function renderCrafterHeader(context: PanelContext, crafter: CrafterView): HTMLElement {
  const job = crafterJob(context.store.getState(), crafter.professionId);
  const jobLine = job
    ? element('div', 'crafter-job', element('div', 'card-text small', t('workshop.crafting', { name: itemDisplayName(job.item) })), createJobBar(job, t('job.waitingForSpace')))
    : element('div', 'card-text small', t('workshop.crafterIdle'));
  return element(
    'div',
    'crafter-header',
    element('div', 'section-title', t('workshop.crafterLevel', { profession: t(`profession.${crafter.professionId}`), level: crafter.level })),
    percentBar(crafter.experience / crafter.experienceToNextLevel, 'bar-experience'),
    element('div', 'card-text small', t('workshop.crafterXp', { current: crafter.experience, next: crafter.experienceToNextLevel })),
    jobLine,
  );
}

export const renderWorkshopPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const catalystCount = countCatalysts(state);
  const recipes = listWorkshopRecipes(state);
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
  for (const crafter of listCrafters(state)) {
    const professionRecipes = recipes.filter((recipe) => recipe.professionId === crafter.professionId).sort((first, second) => first.requiredCraftLevel - second.requiredCraftLevel);
    if (professionRecipes.length === 0) continue;
    body.append(renderCrafterHeader(context, crafter), createList(...professionRecipes.map((recipe) => renderRecipe(context, recipe))));
  }
  body.append(actionButton(t('workshop.leave'), context.closePanel));
  return body;
};
