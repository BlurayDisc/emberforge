import { CLASSES } from '../../../content/classes';
import { BASE_ITEMS } from '../../../content/baseItems';
import { MATERIALS } from '../../../content/materials';
import { WORKSHOP_SECTIONS } from '../../../content/workshopSections';
import { loadRecipeFilterPreferences, saveRecipeFilterPreferences, type WorkshopRecipeView } from '../../../game';
import type { ClassId } from '../../../model/hero';
import type { ItemSlot } from '../../../model/item';
import type { RecipeFilterPreferences, RecipeSortDirection } from '../../../model/recipeFilterPreferences';
import { className } from '../../displayNames';
import { element } from '../../dom';
import { createThemedDropdown } from '../../themedDropdown';
import { t } from '../../i18n';

const ALL = 'all';

const KNOWN_CLASS_IDS: readonly string[] = CLASSES.map((definition) => definition.id);
const SHOWN_PROFESSION_IDS = WORKSHOP_SECTIONS.flatMap((section) => section.professionIds);
// Every crafter offers the same slot list, so one choice means the same thing at every crafter. A crafter with no such recipe shows the empty message.
const SELECTABLE_SLOTS: readonly ItemSlot[] = [...new Set(BASE_ITEMS.filter((base) => SHOWN_PROFESSION_IDS.includes(base.profession)).map((base) => base.slot))];
const KNOWN_SLOTS: readonly string[] = SELECTABLE_SLOTS;

// Each crafter keeps its own filter, saved in the browser. A saved value that no longer exists in the game data falls back to "all".
const preferencesByProfessionId = new Map<string, RecipeFilterPreferences>();

function preferencesOf(professionId: string): RecipeFilterPreferences {
  let preferences = preferencesByProfessionId.get(professionId);
  if (!preferences) {
    const saved = loadRecipeFilterPreferences(professionId);
    preferences = {
      classId: KNOWN_CLASS_IDS.includes(saved.classId) ? saved.classId : ALL,
      slot: KNOWN_SLOTS.includes(saved.slot) ? saved.slot : ALL,
      sortDirection: saved.sortDirection,
    };
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

export function applyRecipeFilter(professionId: string, recipes: readonly WorkshopRecipeView[]): WorkshopRecipeView[] {
  const { classId, slot, sortDirection } = preferencesOf(professionId);
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

export function createRecipeFilterBar(professionId: string, requestRender: () => void): HTMLElement {
  const preferences = preferencesOf(professionId);
  const classOptions = [{ value: ALL, text: t('workshop.filterAllClasses') }, ...CLASSES.map((definition) => ({ value: definition.id, text: className(definition.id) }))];
  const slotOptions = [{ value: ALL, text: t('workshop.filterAllSlots') }, ...SELECTABLE_SLOTS.map((slot) => ({ value: slot, text: slotLabel(slot) }))];
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
    createThemedDropdown(t('workshop.filterClass'), classOptions, preferences.classId, (value) => choose({ classId: value })),
    createThemedDropdown(t('workshop.filterSlot'), slotOptions, preferences.slot, (value) => choose({ slot: value })),
    createThemedDropdown(t('workshop.sortLevelUp'), sortOptions, preferences.sortDirection, (value) => choose({ sortDirection: value as RecipeSortDirection })),
  );
}
