const CURRENT_SAVE_KEY = 'emberforge.save';
const PREVIOUS_SAVE_KEY = 'emberforge.save.previous';
const UNREADABLE_SAVE_KEY = 'emberforge.save.unreadable';

export interface SaveStorage {
  read(): string | null;
  write(serializedState: string): void;
  clear(): void;
  // Optional: keeps a save that this game version cannot read, so a new game never destroys it.
  keepUnreadable?(serializedState: string): void;
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
    keepUnreadable: (serializedState) => {
      try {
        localStorage.setItem(UNREADABLE_SAVE_KEY, serializedState);
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
