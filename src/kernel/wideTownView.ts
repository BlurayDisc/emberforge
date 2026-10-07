const changeListeners: Array<() => void> = [];
let isWide = false;

// Wide view keeps two town pages on the glass, so one swipe goes from the left end of the town to the right end. The stage gets less tall on a narrow screen.
export function isWideTownView(): boolean {
  return isWide;
}

export function setWideTownView(enabled: boolean): void {
  if (enabled === isWide) return;
  isWide = enabled;
  changeListeners.forEach((listener) => listener());
}

export function onWideTownViewChange(listener: () => void): void {
  changeListeners.push(listener);
}
