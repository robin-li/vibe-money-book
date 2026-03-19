/** Category color mapping per UI spec */
export const CATEGORY_COLORS: Record<string, string> = {
  food: '#FF6B6B',
  transport: '#4ECDC4',
  entertainment: '#45B7D1',
  shopping: '#F9CA24',
  daily: '#A29BFE',
  medical: '#FD79A8',
  education: '#6C5CE7',
  other: '#B2BEC3',
}

/** Fallback colors for custom categories */
const CUSTOM_COLORS = ['#E17055', '#00B894', '#FDCB6E', '#E84393', '#0984E3']

/** Category display name mapping */
export const CATEGORY_NAMES: Record<string, string> = {
  food: '飲食',
  transport: '交通',
  entertainment: '娛樂',
  shopping: '購物',
  daily: '日用品',
  medical: '醫療',
  education: '教育',
  other: '其他',
}

export function getCategoryColor(category: string, index: number): string {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category]
  const customIndex = index % CUSTOM_COLORS.length
  return CUSTOM_COLORS[customIndex]
}

export function getCategoryName(category: string): string {
  return CATEGORY_NAMES[category] ?? category
}
