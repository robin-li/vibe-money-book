import { create } from 'zustand'

/** AI 人設類型 */
export type Persona = 'sarcastic' | 'gentle' | 'guilt_trip'

/** AI 引擎類型 */
export type AIEngine = 'gemini' | 'openai' | 'anthropic' | 'xai'

/** 使用者設定 */
export interface UserSettings {
  persona: Persona
  aiEngine: AIEngine
  monthlyBudget: number
  currency: string
}

/** 交易記錄 */
export interface Transaction {
  id: string
  type?: 'income' | 'expense'
  amount: number
  category: string
  merchant: string
  rawText: string
  note?: string
  transactionDate: string
  createdAt: string
}

/** App Store 狀態 */
interface AppState {
  /** 使用者是否已登入 */
  isAuthenticated: boolean
  setAuthenticated: (value: boolean) => void

  /** 使用者設定 */
  settings: UserSettings
  updateSettings: (partial: Partial<UserSettings>) => void

  /** 交易記錄列表 */
  transactions: Transaction[]
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  removeTransaction: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (value) => set({ isAuthenticated: value }),

  settings: {
    persona: 'gentle',
    aiEngine: 'openai',
    monthlyBudget: 0,
    currency: 'TWD',
  },
  updateSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial },
    })),

  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),
  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
}))
