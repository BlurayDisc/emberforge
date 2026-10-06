// A scene that is several stage screens wide, such as the town or the castle. The player slides between the screens.
export interface SlidingView {
  setVisible(isVisible: boolean): void;
  goToScreen(screenIndex: number): void;
  currentScreen(): number;
  // Called with the world pixel at the left edge of the view, whenever the view moves.
  onScroll(listener: (scrollLeft: number) => void): void;
}

// A scene that the app can show or hide.
export interface SceneToggle {
  setVisible(isVisible: boolean): void;
}
