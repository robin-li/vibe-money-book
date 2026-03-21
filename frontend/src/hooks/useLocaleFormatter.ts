import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/** UI 語言 → Intl locale 對應（用於數字/日期格式化） */
const intlLocaleMap: Record<string, string> = {
  'zh-TW': 'zh-TW',
  en: 'en-US',
  'zh-CN': 'zh-CN',
  vi: 'vi-VN',
}

function getIntlLocale(language: string): string {
  return intlLocaleMap[language] ?? 'zh-TW'
}

/**
 * 依當前 i18n 語言提供 Intl 格式化工具。
 *
 * - `formatNumber(value)` — 使用 Intl.NumberFormat 格式化數字
 * - `formatCurrency(value, currency?)` — 使用 Intl.NumberFormat currency 模式
 * - `formatDate(date, options?)` — 使用 Intl.DateTimeFormat 格式化日期
 */
export function useLocaleFormatter() {
  const { i18n } = useTranslation()
  const language = i18n.language

  const intlLocale = useMemo(() => getIntlLocale(language), [language])

  const formatNumber = useMemo(() => {
    const formatter = new Intl.NumberFormat(intlLocale)
    return (value: number): string => formatter.format(value)
  }, [intlLocale])

  const formatCurrency = useMemo(() => {
    return (value: number, currency = 'TWD'): string => {
      const formatter = new Intl.NumberFormat(intlLocale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      return formatter.format(value)
    }
  }, [intlLocale])

  const formatDate = useMemo(() => {
    return (
      date: Date | string | number,
      options?: Intl.DateTimeFormatOptions,
    ): string => {
      const d = date instanceof Date ? date : new Date(date)
      const formatter = new Intl.DateTimeFormat(intlLocale, options)
      return formatter.format(d)
    }
  }, [intlLocale])

  return { formatNumber, formatCurrency, formatDate, intlLocale }
}
