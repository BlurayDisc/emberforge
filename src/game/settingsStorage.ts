import { DEFAULT_LANGUAGE, LANGUAGES, type LanguageId } from '../content/translations';

const SETTINGS_KEY = 'emberforge.settings';

interface StoredSettings {
  language?: string;
}

function readSettings(): StoredSettings {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') as StoredSettings;
  } catch {
    return {};
  }
}

function isKnownLanguage(value: string | undefined): value is LanguageId {
  return LANGUAGES.some((language) => language.id === value);
}

export function loadLanguagePreference(): LanguageId {
  const saved = readSettings().language;
  if (isKnownLanguage(saved)) return saved;
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : DEFAULT_LANGUAGE;
}

export function saveLanguagePreference(language: LanguageId): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...readSettings(), language }));
  } catch {
    return;
  }
}
