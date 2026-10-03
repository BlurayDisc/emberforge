import englishData from '../../data/i18n/en.json';
import languagesData from '../../data/i18n/languages.json';
import chineseData from '../../data/i18n/zh.json';

export type LanguageId = 'en' | 'zh';

export interface LanguageDefinition {
  id: LanguageId;
  nativeName: string;
}

export const DEFAULT_LANGUAGE: LanguageId = 'en';

export const LANGUAGES = languagesData as unknown as readonly LanguageDefinition[];

export const TRANSLATIONS: Record<LanguageId, Readonly<Record<string, string>>> = {
  en: englishData,
  zh: chineseData,
};
