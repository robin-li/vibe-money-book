/** Category color mapping per UI spec */
export const CATEGORY_COLORS: Record<string, string> = {
  entertainment: '#45B7D1',
  food: '#FF6B6B',
  daily: '#A29BFE',
  education: '#6C5CE7',
  medical: '#FD79A8',
  transport: '#4ECDC4',
  other: '#B2BEC3',
  // 收入類別
  salary: '#22C55E',
  investment: '#10B981',
  pension: '#059669',
  insurance: '#047857',
  other_income: '#6EE7B7',
}

/** Fallback colors for custom categories */
const CUSTOM_COLORS = ['#E17055', '#00B894', '#FDCB6E', '#E84393', '#0984E3']

/** Category display name mapping */
export const CATEGORY_NAMES: Record<string, string> = {
  entertainment: '娛樂',
  food: '飲食',
  daily: '日用品',
  education: '教育',
  medical: '醫療',
  transport: '交通',
  other: '其它',
  // 收入類別
  salary: '薪資收入',
  investment: '投資收益',
  pension: '退休金',
  insurance: '保險理賠',
  other_income: '其它',
}

/** 收入類別集合 */
export const INCOME_CATEGORIES = new Set(['salary', 'investment', 'pension', 'insurance', 'other_income'])

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
  return CATEGORY_NAMES[category] ?? category
}
