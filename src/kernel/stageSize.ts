export const LOGICAL_WIDTH = 480;
export const LOGICAL_HEIGHT = 270;

// The town has three pages. A page is narrow, so a tall phone can fill its screen with one page. The player moves between pages.
export const TOWN_PAGE_WIDTH = 180;
export const TOWN_SCREEN_COUNT = 3;
export const TOWN_WIDTH = TOWN_PAGE_WIDTH * TOWN_SCREEN_COUNT;

// The castle has two screens: the Throne Hall and the Ramparts. They use the same sliding view as the town.
export const CASTLE_SCREEN_COUNT = 2;
export const CASTLE_WIDTH = LOGICAL_WIDTH * CASTLE_SCREEN_COUNT;
