import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// zh-TW translations
import zhTWCommon from './locales/zh-TW/common.json'
import zhTWDashboard from './locales/zh-TW/dashboard.json'
import zhTWStats from './locales/zh-TW/stats.json'
import zhTWHistory from './locales/zh-TW/history.json'
import zhTWSettings from './locales/zh-TW/settings.json'
import zhTWAuth from './locales/zh-TW/auth.json'
import zhTWCategories from './locales/zh-TW/categories.json'
import zhTWValidation from './locales/zh-TW/validation.json'

// en translations
import enCommon from './locales/en/common.json'
import enDashboard from './locales/en/dashboard.json'
import enStats from './locales/en/stats.json'
import enHistory from './locales/en/history.json'
import enSettings from './locales/en/settings.json'
import enAuth from './locales/en/auth.json'
import enCategories from './locales/en/categories.json'
import enValidation from './locales/en/validation.json'

// zh-CN translations
import zhCNCommon from './locales/zh-CN/common.json'
import zhCNDashboard from './locales/zh-CN/dashboard.json'
import zhCNStats from './locales/zh-CN/stats.json'
import zhCNHistory from './locales/zh-CN/history.json'
import zhCNSettings from './locales/zh-CN/settings.json'
import zhCNAuth from './locales/zh-CN/auth.json'
import zhCNCategories from './locales/zh-CN/categories.json'
import zhCNValidation from './locales/zh-CN/validation.json'

// vi translations
import viCommon from './locales/vi/common.json'
import viDashboard from './locales/vi/dashboard.json'
import viStats from './locales/vi/stats.json'
import viHistory from './locales/vi/history.json'
import viSettings from './locales/vi/settings.json'
import viAuth from './locales/vi/auth.json'
import viCategories from './locales/vi/categories.json'
import viValidation from './locales/vi/validation.json'

/** 支援的語言清單 */
export const supportedLngs = ['zh-TW', 'en', 'zh-CN', 'vi'] as const
export type SupportedLanguage = (typeof supportedLngs)[number]

/** 翻譯 namespace 清單 */
export const namespaces = [
  'common',
  'dashboard',
  'stats',
  'history',
  'settings',
  'auth',
  'categories',
  'validation',
] as const

/** 語言代碼 → 語音辨識語言代碼對應 */
export const voiceLangMap: Record<SupportedLanguage, string> = {
  'zh-TW': 'zh-TW',
  en: 'en-US',
  'zh-CN': 'zh-CN',
  vi: 'vi-VN',
}

/** 根據 UI 語言取得語音辨識語言代碼 */
export function getVoiceLang(locale: string): string {
  return voiceLangMap[locale as SupportedLanguage] ?? 'zh-TW'
}

const resources = {
  'zh-TW': {
    common: zhTWCommon,
    dashboard: zhTWDashboard,
    stats: zhTWStats,
    history: zhTWHistory,
    settings: zhTWSettings,
    auth: zhTWAuth,
    categories: zhTWCategories,
    validation: zhTWValidation,
  },
  en: {
    common: enCommon,
    dashboard: enDashboard,
    stats: enStats,
    history: enHistory,
    settings: enSettings,
    auth: enAuth,
    categories: enCategories,
    validation: enValidation,
  },
  'zh-CN': {
    common: zhCNCommon,
    dashboard: zhCNDashboard,
    stats: zhCNStats,
    history: zhCNHistory,
    settings: zhCNSettings,
    auth: zhCNAuth,
    categories: zhCNCategories,
    validation: zhCNValidation,
  },
  vi: {
    common: viCommon,
    dashboard: viDashboard,
    stats: viStats,
    history: viHistory,
    settings: viSettings,
    auth: viAuth,
    categories: viCategories,
    validation: viValidation,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-TW',
    supportedLngs: [...supportedLngs],
    ns: [...namespaces],
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React 已自動處理 XSS 防護
    },
  })

export default i18n
