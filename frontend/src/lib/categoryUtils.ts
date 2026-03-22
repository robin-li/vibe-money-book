import i18n from '../i18n/index'

/** Category color mapping per UI spec */
export const CATEGORY_COLORS: Record<string, string> = {
  entertainment: '#45B7D1',
  food: '#FF6B6B',
  daily: '#A29BFE',
  education: '#6C5CE7',
  medical: '#FD79A8',
  transport: '#4ECDC4',
  pets: '#F8B400',
  other: '#B2BEC3',
  adjustment_expense: '#95A5A6',
  // 收入類別
  salary: '#22C55E',
  investment: '#10B981',
  pension: '#059669',
  insurance: '#047857',
  other_income: '#6EE7B7',
  adjustment_income: '#86EFAC',
}

/** Fallback colors for custom categories */
const CUSTOM_COLORS = ['#E17055', '#00B894', '#FDCB6E', '#E84393', '#0984E3']

/** 收入類別集合 */
export const INCOME_CATEGORIES = new Set(['salary', 'investment', 'pension', 'insurance', 'other_income', 'adjustment_income'])

/** 根據類別判斷是否為收入類別 */
export function isIncomeCategory(category: string): boolean {
  return INCOME_CATEGORIES.has(category)
}

/** 根據類別類型回傳對應的 CSS 顏色 class (#67) */
export function getCategoryTypeColorClass(categoryType: 'income' | 'expense' | string): string {
  return categoryType === 'income' ? 'text-success' : 'text-danger'
}

export function getCategoryColor(category: string, index: number): string {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category]
  const customIndex = index % CUSTOM_COLORS.length
  return CUSTOM_COLORS[customIndex]
}

export function getCategoryName(category: string): string {
  const key = `categories:${category}`
  const translated = i18n.t(key)
  // If translation key is not found, i18n returns the key itself — fallback to raw category name
  if (translated === key || translated === category) {
    return category
  }
  return translated
}
