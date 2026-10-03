// The run whose battle is shown on the stage. null means the town screen.
// Runs keep going in the background when they are not in focus.
let focusedRun: number | null = null;
const focusListeners = new Set<() => void>();

export function focusedRunNumber(): number | null {
  return focusedRun;
}

export function focusRun(runNumber: number | null): void {
  if (focusedRun === runNumber) return;
  focusedRun = runNumber;
  focusListeners.forEach((listener) => listener());
}

export function onRunFocusChange(listener: () => void): void {
  focusListeners.add(listener);
}
