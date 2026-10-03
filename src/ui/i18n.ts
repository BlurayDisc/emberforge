import { DEFAULT_LANGUAGE, TRANSLATIONS, type LanguageId } from '../content/translations';
import { loadLanguagePreference, saveLanguagePreference, type MessageParams, type Rejection } from '../game';

let currentLanguage: LanguageId = DEFAULT_LANGUAGE;
const languageListeners = new Set<() => void>();

function applyDocumentLanguage(): void {
  document.documentElement.lang = currentLanguage === 'zh' ? 'zh-Hans' : 'en';
}

export function initializeLanguage(): void {
  currentLanguage = loadLanguagePreference();
  applyDocumentLanguage();
}

export function currentLanguageId(): LanguageId {
  return currentLanguage;
}

export function setLanguage(language: LanguageId): void {
  currentLanguage = language;
  saveLanguagePreference(language);
  applyDocumentLanguage();
  languageListeners.forEach((listener) => listener());
}

export function onLanguageChange(listener: () => void): void {
  languageListeners.add(listener);
}

function fillPlaceholders(template: string, params: MessageParams): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => String(params[name] ?? placeholder));
}

function withDerivedParams(params: MessageParams): MessageParams {
  const derived = { ...params };
  if (typeof params.classId === 'string') derived.className = t(`class.${params.classId}.name`);
  if (typeof params.armourWeight === 'string') derived.armourWeightName = t(`armourweight.${params.armourWeight}`);
  return derived;
}

export function hasTranslation(key: string): boolean {
  return key in TRANSLATIONS[currentLanguage] || key in TRANSLATIONS[DEFAULT_LANGUAGE];
}

export function t(key: string, params: MessageParams = {}): string {
  const template = TRANSLATIONS[currentLanguage][key] ?? TRANSLATIONS[DEFAULT_LANGUAGE][key] ?? key;
  return fillPlaceholders(template, withDerivedParams(params));
}

export function describeRejection(rejection: Rejection | null): string {
  return rejection === null ? '' : t(rejection.key, rejection.params);
}
