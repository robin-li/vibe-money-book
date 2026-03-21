import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';

export const SUPPORTED_LANGUAGES = ['zh-TW', 'en', 'zh-CN', 'vi'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'zh-TW';

export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);
}

let initialized = false;

export async function initI18n(): Promise<typeof i18next> {
  if (initialized) return i18next;

  await i18next.use(Backend).init({
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    ns: ['errors'],
    defaultNS: 'errors',
    backend: {
      loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json'),
    },
    interpolation: {
      escapeValue: false,
    },
    preload: [...SUPPORTED_LANGUAGES],
  });

  initialized = true;
  return i18next;
}

/**
 * Get a translation for the given key and language.
 */
export function t(key: string, lng?: string): string {
  return i18next.t(key, { lng: lng || DEFAULT_LANGUAGE });
}

export default i18next;
