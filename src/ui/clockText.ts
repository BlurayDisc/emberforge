import { currentLanguageId } from './i18n';

const LOCALE_BY_LANGUAGE: Readonly<Record<string, string>> = { en: 'en-AU', zh: 'zh-CN' };

export function formatNow(): string {
  return new Date().toLocaleString(LOCALE_BY_LANGUAGE[currentLanguageId()] ?? 'en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
