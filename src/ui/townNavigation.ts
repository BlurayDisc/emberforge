// What an overlay needs from a sliding scene, the town or the castle. The app layer connects the two, because ui may not import render.
export interface TownNavigation {
  screenCount: number;
  currentScreen(): number;
  goToScreen(screenIndex: number): void;
  // Called with the world pixel at the left edge of the view, whenever the view moves.
  onScroll(listener: (scrollLeft: number) => void): void;
}
