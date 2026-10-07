import { CLASSES } from '../../../content/classes';
import { BASE_ITEMS } from '../../../content/baseItems';
import { MATERIALS } from '../../../content/materials';
import { loadRecipeFilterPreferences, saveRecipeFilterPreferences, type WorkshopRecipeView } from '../../../game';
import type { ClassId } from '../../../model/hero';
import type { ItemSlot } from '../../../model/item';
import type { RecipeFilterPreferences, RecipeSortDirection } from '../../../model/recipeFilterPreferences';
import { className } from '../../displayNames';
import { element } from '../../dom';
import { createThemedDropdown } from '../../themedDropdown';
import { t } from '../../i18n';

const ALL = 'all';

// Each crafter keeps its own filter, saved in the browser.
const preferencesByProfessionId = new Map<string, RecipeFilterPreferences>();

function preferencesOf(professionId: string): RecipeFilterPreferences {
  let preferences = preferencesByProfessionId.get(professionId);
  if (!preferences) {
    const saved = loadRecipeFilterPreferences(professionId);
    preferences = { classId: saved.classId, slot: saved.slot, sortDirection: saved.sortDirection };
    preferencesByProfessionId.set(professionId, preferences);
  }
  return preferences;
}

function rememberChoice(professionId: string, preferences: RecipeFilterPreferences): void {
  saveRecipeFilterPreferences(professionId, preferences);
}

// Inside one recipe level, the variants of a base item sit together: the basic recipe first, then the set recipes in dungeon order.
function setDungeonOrder(recipe: WorkshopRecipeView): number {
  return MATERIALS.find((material) => material.id === recipe.setMaterialId)?.setCraftLevelOffset ?? 0;
}

function baseItemOrder(recipe: WorkshopRecipeView): number {
  return BASE_ITEMS.findIndex((base) => base.id === recipe.baseId);
}

function classIdsOffered(recipes: readonly WorkshopRecipeView[]): ClassId[] {
  const offered = new Set(recipes.flatMap((recipe) => recipe.usableByClassIds));
  return CLASSES.map((definition) => definition.id).filter((classId) => offered.has(classId));
}

function slotsOffered(recipes: readonly WorkshopRecipeView[]): ItemSlot[] {
  return [...new Set(recipes.map((recipe) => recipe.slot))];
}

// The filter offers only what this crafter can make. A saved choice that this crafter does not offer counts as "all", and stays saved.
function chosenOrAll(chosen: string, offered: readonly string[]): string {
  return offered.includes(chosen) ? chosen : ALL;
}

export function applyRecipeFilter(professionId: string, recipes: readonly WorkshopRecipeView[]): WorkshopRecipeView[] {
  const preferences = preferencesOf(professionId);
  const classId = chosenOrAll(preferences.classId, classIdsOffered(recipes));
  const slot = chosenOrAll(preferences.slot, slotsOffered(recipes));
  const { sortDirection } = preferences;
  const direction = sortDirection === 'up' ? 1 : -1;
  return recipes
    .filter((recipe) => classId === ALL || recipe.usableByClassIds.includes(classId as ClassId))
    .filter((recipe) => slot === ALL || recipe.slot === slot)
    .sort((first, second) => direction * (
      first.requiredCraftLevel - second.requiredCraftLevel
      || baseItemOrder(first) - baseItemOrder(second)
      || setDungeonOrder(first) - setDungeonOrder(second)
    ));
}

function slotLabel(slot: ItemSlot): string {
  return t(slot === 'ring' ? 'slot.ringOne' : `slot.${slot}`);
}

export function createRecipeFilterBar(professionId: string, recipes: readonly WorkshopRecipeView[], requestRender: () => void): HTMLElement {
  const preferences = preferencesOf(professionId);
  const offeredClassIds = classIdsOffered(recipes);
  const offeredSlots = slotsOffered(recipes);
  const classOptions = [{ value: ALL, text: t('workshop.filterAllClasses') }, ...offeredClassIds.map((classId) => ({ value: classId, text: className(classId) }))];
  const slotOptions = [{ value: ALL, text: t('workshop.filterAllSlots') }, ...offeredSlots.map((slot) => ({ value: slot, text: slotLabel(slot) }))];
  const sortOptions = [
    { value: 'up', text: t('workshop.sortLevelUp') },
    { value: 'down', text: t('workshop.sortLevelDown') },
  ];
  const choose = (change: Partial<RecipeFilterPreferences>): void => {
    Object.assign(preferences, change);
    rememberChoice(professionId, preferences);
    requestRender();
  };
  return element(
    'div',
    'filter-bar',
    createThemedDropdown(t('workshop.filterClass'), classOptions, chosenOrAll(preferences.classId, offeredClassIds), (value) => choose({ classId: value })),
    createThemedDropdown(t('workshop.filterSlot'), slotOptions, chosenOrAll(preferences.slot, offeredSlots), (value) => choose({ slot: value })),
    createThemedDropdown(t('workshop.sortLevelUp'), sortOptions, preferences.sortDirection, (value) => choose({ sortDirection: value as RecipeSortDirection })),
  );
}
