import { BASE_ITEMS, type ProfessionId } from '../../../content/baseItems';
import { requireById } from '../../../content/lookup';
import { MATERIALS } from '../../../content/materials';
import { playSound } from '../../../audio';
import {
  collectWaitingCraftCommand,
  craftItemCommand,
  crafterJob,
  listCrafters,
  listWorkshopRecipes,
  type CrafterView,
  type IngredientView,
  type WorkshopRecipeView,
} from '../../../game';
import { actionButton, element, percentBar } from '../../dom';
import { craftedBaseName, itemBaseDisplayName, itemDisplayName, materialName } from '../../displayNames';
import { describeRejection, t } from '../../i18n';
import { createItemIcon } from '../../iconArt';
import { createRecipePortrait } from '../../itemPortrait';
import { createClassTags } from '../../classTags';
import { createCrafterPortrait } from '../../crafterPortraitArt';
import { createRecipeStatTable, createSetBonusLine } from '../../itemStatTable';
import { formatDuration } from '../../liveUpdate';
import { createJobBar } from '../../liveBars';
import { createList, createListRow } from '../../listRow';
import { createMoneyDisplay } from '../../moneyDisplay';
import { openModal } from '../../modal';
import type { PanelContext, PanelRenderer } from '../panelContext';

let selectedProfessionId: ProfessionId | null = null;

export function resetWorkshopSelection(): void {
  selectedProfessionId = null;
}

function describeIngredients(ingredients: readonly IngredientView[]): HTMLElement[] {
  return ingredients.map((ingredient) =>
    element('span', ingredient.owned >= ingredient.needed ? 'ingredient' : 'ingredient missing', `${materialName(ingredient.materialId)} ${ingredient.owned}/${ingredient.needed}`),
  );
}

function craft(context: PanelContext, recipe: WorkshopRecipeView): boolean {
  const result = context.store.execute(craftItemCommand(recipe.baseId, recipe.tier, recipe.setMaterialId, Date.now()));
  if (!result.accepted) {
    context.notify(describeRejection(result.rejection));
    return false;
  }
  context.notify(t('workshop.started', { name: craftedBaseName(recipe.resultMaterialId, recipe.baseId) }));
  selectedProfessionId = null;
  context.requestRender();
  return true;
}

function openRecipe(context: PanelContext, recipe: WorkshopRecipeView): void {
  const details = element(
    'div',
    'item-card',
    element('div', 'item-name', `${craftedBaseName(recipe.resultMaterialId, recipe.baseId)} (${recipeLevelText(recipe)})`),
    itemLevelLine(recipe),
    createClassTags(recipe.usableByClassIds),
    createRecipeStatTable(recipe.baseId, recipe.statRanges),
    ...(recipe.setMaterialId === null ? [] : createSetBonusLine(recipe.setMaterialId)),
    element('div', 'card-text small', t('workshop.craftTime', { time: formatDuration(recipe.craftSeconds) })),
    element('div', 'card-text small', ...describeIngredients(recipe.ingredients)),
    element('div', 'card-row', t('workshop.fee'), createMoneyDisplay(recipe.feeCopper)),
    element('div', 'card-text small', t('workshop.upgradeChance', { percent: Math.round(recipe.upgradeChance * 100) })),
  );
  const modal = openModal(t('modal.recipeTitle'), element('div', 'modal-columns', createRecipePortrait(recipe.baseId, recipe.resultMaterialId), details));
  details.append(actionButton(t('workshop.craft'), () => {
    if (craft(context, recipe)) modal.close();
  }, { disabled: !recipe.hasMaterials || !recipe.canAffordFee || recipe.isCrafterBusy, className: 'action-button primary' }));
}

// The recipe level is the crafter level that opens the recipe. It differs from recipe to recipe, so a later recipe shows a higher number.
function recipeLevelText({ requiredCraftLevel }: WorkshopRecipeView): string {
  return t('workshop.recipeLevel', { level: requiredCraftLevel });
}

function itemLevelLine({ itemLevel }: WorkshopRecipeView): HTMLElement {
  return element('div', 'card-text small', t('workshop.itemLevel', { level: itemLevel }));
}

function renderRecipe(context: PanelContext, recipe: WorkshopRecipeView): HTMLElement {
  const base = requireById(BASE_ITEMS, recipe.baseId);
  const resultMaterial = requireById(MATERIALS, recipe.resultMaterialId);
  const art = createItemIcon(recipe.baseId, resultMaterial.id, base.mainCategory, 3);
  const info = element('div', 'card-text small', ...describeIngredients(recipe.ingredients));
  const classes = createClassTags(recipe.usableByClassIds);
  const fee = element('div', 'card-row', t('workshop.fee'), createMoneyDisplay(recipe.feeCopper));
  const row = createListRow({
    art,
    title: `${craftedBaseName(recipe.resultMaterialId, recipe.baseId)} (${recipeLevelText(recipe)})`,
    lines: [info, itemLevelLine(recipe), fee, classes],
    actions: [actionButton(t('workshop.craft'), () => craft(context, recipe), { disabled: !recipe.hasMaterials || !recipe.canAffordFee || recipe.isCrafterBusy })],
    className: 'clickable',
  });
  row.querySelector('.row-art')?.addEventListener('click', () => openRecipe(context, recipe));
  row.querySelector('.row-body')?.addEventListener('click', () => openRecipe(context, recipe));
  return row;
}

function collectWaitingItem(context: PanelContext, crafter: CrafterView): void {
  const levelBefore = context.store.getState().crafters[crafter.professionId]?.level ?? 1;
  const result = context.store.execute(collectWaitingCraftCommand(crafter.professionId));
  if (!result.accepted) {
    context.notify(describeRejection(result.rejection));
    return;
  }
  const levelAfter = context.store.getState().crafters[crafter.professionId]?.level ?? 1;
  if (levelAfter > levelBefore) {
    playSound('crafter-level-up');
    context.notify(t('workshop.levelUp', { profession: t(`profession.${crafter.professionId}`), level: levelAfter }));
  }
}

function renderCrafterStatus(context: PanelContext, crafter: CrafterView): HTMLElement {
  const job = crafterJob(context.store.getState(), crafter.professionId);
  if (job?.isWaitingForCollection) {
    return element(
      'div',
      'crafter-job',
      element('div', 'card-text small danger-text', t('workshop.waitingForCollection', { name: itemDisplayName(job.item) })),
      actionButton(t('workshop.collect'), (event) => {
        event.stopPropagation();
        collectWaitingItem(context, crafter);
      }, { className: 'action-button primary small-button' }),
    );
  }
  return job
    ? element('div', 'crafter-job', element('div', 'card-text small', t('workshop.crafting', { name: itemBaseDisplayName(job.item) })), createJobBar(job, t('job.waitingForSpace')))
    : element('div', 'card-text small', t('workshop.crafterIdle'));
}

function renderCrafterHeader(context: PanelContext, crafter: CrafterView): HTMLElement {
  return element(
    'div',
    'crafter-header',
    element('div', 'section-title', t('workshop.crafterLevel', { profession: t(`profession.${crafter.professionId}`), level: crafter.level })),
    percentBar(crafter.experience / crafter.experienceToNextLevel, 'bar-experience'),
    element('div', 'card-text small', t('workshop.crafterXp', { current: crafter.experience, next: crafter.experienceToNextLevel })),
    renderCrafterStatus(context, crafter),
  );
}

function renderCrafterRow(context: PanelContext, crafter: CrafterView): HTMLElement {
  const row = createListRow({
    art: createCrafterPortrait(crafter.professionId, 4),
    title: t(`profession.${crafter.professionId}`),
    lines: [
      element('div', 'card-text small', t('workshop.crafterLevelShort', { level: crafter.level })),
      percentBar(crafter.experience / crafter.experienceToNextLevel, 'bar-experience'),
      renderCrafterStatus(context, crafter),
    ],
    className: 'clickable crafter-tile',
  });
  row.addEventListener('click', () => {
    selectedProfessionId = crafter.professionId;
    context.requestRender();
  });
  return row;
}

function renderCrafterList(context: PanelContext, crafters: readonly CrafterView[]): HTMLElement {
  return element(
    'div',
    'panel-body',
    element('p', 'hint', t('workshop.chooseCrafter')),
    element('div', 'tile-grid', ...crafters.map((crafter) => renderCrafterRow(context, crafter))),
    actionButton(t('workshop.leave'), context.closePanel),
  );
}

// Recipes above the crafter level stay hidden, so the player sees only what the crafter can make now.
function renderCrafterScreen(context: PanelContext, crafter: CrafterView, recipes: readonly WorkshopRecipeView[]): HTMLElement {
  const craftableRecipes = recipes.filter((recipe) => recipe.professionId === crafter.professionId && recipe.isUnlocked).sort((first, second) => first.requiredCraftLevel - second.requiredCraftLevel);
  const nextRecipeLevel = recipes.filter((recipe) => recipe.professionId === crafter.professionId && !recipe.isUnlocked).reduce((lowest, recipe) => Math.min(lowest, recipe.requiredCraftLevel), Infinity);
  const body = element(
    'div',
    'panel-body',
    element('div', 'crafter-intro', createCrafterPortrait(crafter.professionId, 4), renderCrafterHeader(context, crafter)),
    createList(...craftableRecipes.map((recipe) => renderRecipe(context, recipe))),
  );
  if (nextRecipeLevel !== Infinity) body.append(element('p', 'hint', t('workshop.nextRecipeAt', { level: nextRecipeLevel })));
  body.append(actionButton(t('workshop.back'), () => {
    selectedProfessionId = null;
    context.requestRender();
  }));
  return body;
}

export const renderWorkshopPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const recipes = listWorkshopRecipes(state);
  const crafters = listCrafters(state).filter((crafter) => recipes.some((recipe) => recipe.professionId === crafter.professionId));
  const selectedCrafter = crafters.find((crafter) => crafter.professionId === selectedProfessionId);
  return selectedCrafter ? renderCrafterScreen(context, selectedCrafter, recipes) : renderCrafterList(context, crafters);
};
