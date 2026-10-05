import { CLASSES } from '../../../content/classes';
import { BASE_ITEMS } from '../../../content/baseItems';
import { WORKSHOP_SECTIONS } from '../../../content/workshopSections';
import { loadRecipeFilterPreferences, saveRecipeFilterPreferences, type WorkshopRecipeView } from '../../../game';
import type { ClassId } from '../../../model/hero';
import type { ItemSlot } from '../../../model/item';
import type { RecipeSortDirection } from '../../../model/recipeFilterPreferences';
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

// The filter stays when the player moves between crafters, and it is saved in the browser, so one choice applies to every visit.
// A saved value that no longer exists in the game data falls back to "all".
const savedPreferences = loadRecipeFilterPreferences();
let selectedClassId: ClassId | typeof ALL = KNOWN_CLASS_IDS.includes(savedPreferences.classId) ? (savedPreferences.classId as ClassId) : ALL;
let selectedSlot: ItemSlot | typeof ALL = KNOWN_SLOTS.includes(savedPreferences.slot) ? (savedPreferences.slot as ItemSlot) : ALL;
let sortDirection: RecipeSortDirection = savedPreferences.sortDirection;

function rememberChoice(): void {
  saveRecipeFilterPreferences({ classId: selectedClassId, slot: selectedSlot, sortDirection });
}

export function applyRecipeFilter(recipes: readonly WorkshopRecipeView[]): WorkshopRecipeView[] {
  const direction = sortDirection === 'up' ? 1 : -1;
  return recipes
    .filter((recipe) => selectedClassId === ALL || recipe.usableByClassIds.includes(selectedClassId))
    .filter((recipe) => selectedSlot === ALL || recipe.slot === selectedSlot)
    .sort((first, second) => direction * (first.requiredCraftLevel - second.requiredCraftLevel));
}

function slotLabel(slot: ItemSlot): string {
  return t(slot === 'ring' ? 'slot.ringOne' : `slot.${slot}`);
}

export function createRecipeFilterBar(requestRender: () => void): HTMLElement {
  const classOptions = [{ value: ALL, text: t('workshop.filterAllClasses') }, ...CLASSES.map((definition) => ({ value: definition.id, text: className(definition.id) }))];
  const slotOptions = [{ value: ALL, text: t('workshop.filterAllSlots') }, ...SELECTABLE_SLOTS.map((slot) => ({ value: slot, text: slotLabel(slot) }))];
  const sortOptions = [
    { value: 'up', text: t('workshop.sortLevelUp') },
    { value: 'down', text: t('workshop.sortLevelDown') },
  ];
  return element(
    'div',
    'filter-bar',
    createThemedDropdown(t('workshop.filterClass'), classOptions, selectedClassId, (value) => {
      selectedClassId = value as ClassId | typeof ALL;
      rememberChoice();
      requestRender();
    }),
    createThemedDropdown(t('workshop.filterSlot'), slotOptions, selectedSlot, (value) => {
      selectedSlot = value as ItemSlot | typeof ALL;
      rememberChoice();
      requestRender();
    }),
    createThemedDropdown(t('workshop.sortLevelUp'), sortOptions, sortDirection, (value) => {
      sortDirection = value as RecipeSortDirection;
      rememberChoice();
      requestRender();
    }),
  );
}
