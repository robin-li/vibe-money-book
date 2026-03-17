/** 使用者 */
export interface User {
  id: string
  name: string
  email: string
  persona: 'sarcastic' | 'gentle' | 'guilt_trip'
  aiEngine: 'gemini' | 'openai'
  monthlyBudget: number
  currency: string
  createdAt: string
  updatedAt: string
}

/** 類別預算 */
export interface CategoryBudget {
  id: string
  userId: string
  category: string
  budgetLimit: number
  isCustom: boolean
  createdAt: string
  updatedAt: string
}

/** 交易記錄 */
export interface Transaction {
  id: string
  userId: string
  amount: number
  category: string
  merchant: string
  rawText: string
  note?: string
  transactionDate: string
  createdAt: string
  updatedAt: string
}

/** AI 回饋 */
export interface AIFeedback {
  id: string
  transactionId: string
  userId: string
  feedbackText: string
  emotionTag: string
  personaUsed: 'sarcastic' | 'gentle' | 'guilt_trip'
  createdAt: string
}

/** API 錯誤回應 */
export interface ApiError {
  message: string
  code: string
  details?: Record<string, string[]>
}
