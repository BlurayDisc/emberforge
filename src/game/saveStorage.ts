const CURRENT_SAVE_KEY = 'emberforge.save';
const PREVIOUS_SAVE_KEY = 'emberforge.save.previous';

export interface SaveStorage {
  read(): string | null;
  write(serializedState: string): void;
  clear(): void;
}

export function createBrowserSaveStorage(): SaveStorage {
  return {
    read: () => {
      try {
        return localStorage.getItem(CURRENT_SAVE_KEY);
      } catch {
        return null;
      }
    },
    write: (serializedState) => {
      try {
        const currentSave = localStorage.getItem(CURRENT_SAVE_KEY);
        if (currentSave !== null) localStorage.setItem(PREVIOUS_SAVE_KEY, currentSave);
        localStorage.setItem(CURRENT_SAVE_KEY, serializedState);
      } catch {
        return;
      }
    },
    clear: () => {
      try {
        localStorage.removeItem(CURRENT_SAVE_KEY);
        localStorage.removeItem(PREVIOUS_SAVE_KEY);
      } catch {
        return;
      }
    },
  };
}
