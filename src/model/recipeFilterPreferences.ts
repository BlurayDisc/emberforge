export type RecipeSortDirection = 'up' | 'down';

export interface RecipeFilterPreferences {
  classId: string;
  slot: string;
  sortDirection: RecipeSortDirection;
  isCraftableOnly: boolean;
}
