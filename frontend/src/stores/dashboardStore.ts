import { create } from 'zustand'
import api from '../lib/api'
import type { Transaction } from '../stores/index'
import { useSettingsStore } from './settingsStore'

/** 讀取當前引擎對應的 API Key */
function getActiveApiKey(): string {
  const engine = useSettingsStore.getState().aiEngine
  try {
    const stored = localStorage.getItem('llm_api_keys')
    if (stored) {
      const keys = JSON.parse(stored)
      return keys[engine] ?? ''
    }
  } catch { /* ignore */ }
  // Fallback to legacy key
  return localStorage.getItem('llm_api_key') ?? ''
}

export type TransactionType = 'income' | 'expense'

export interface ParsedResult {
  type: TransactionType
  amount: number | null
  category: string | null
  merchant: string
  date: string
  confidence: number
  isNewCategory: boolean
  suggestedCategory: string | null
  note: string | null
}

export interface AIFeedbackContent {
  text: string
  emotionTag: string
}

export interface BudgetContext {
  monthlyBudget: number
  spentThisMonth: number
  remaining: number
  usedRatio: number
  categorySpent: number
  categoryLimit: number
}

export interface BudgetSummary {
  month: string
  monthlyBudget: number
  totalSpent: number
  remaining: number
  usedRatio: number
  totalIncome: number
  totalAsset: number
  allTimeIncome: number
  allTimeSpent: number
  transactionCount: number
}

export type Intent = 'transaction' | 'chat'

export type DashboardStatus =
  | 'idle'
  | 'parsing'
  | 'parsed'
  | 'chat_reply'
  | 'confirming'
  | 'saving'
  | 'error'

export interface CategoryInfo {
  category: string
  type: 'income' | 'expense'
  isCustom?: boolean
}

interface DashboardState {
  status: DashboardStatus
  parsedResult: ParsedResult | null
  lastRawText: string
  aiFeedback: AIFeedbackContent | null
  budgetContext: BudgetContext | null
  budgetSummary: BudgetSummary | null
  recentTransactions: Transaction[]
  categories: string[]
  categoryInfoList: CategoryInfo[]
  errorMessage: string
  lastFeedbackText: string
  lastPersona: string

  // Actions
  fetchCategories: () => Promise<void>
  parseInput: (rawText: string) => Promise<void>
  confirmTransaction: (data: {
    type: TransactionType
    amount: number
    category: string
    merchant: string
    date: string
    rawText: string
    note?: string | null
    feedback?: AIFeedbackContent
  }) => Promise<void>
  createCategory: (category: string, type?: 'income' | 'expense') => Promise<void>
  deleteCategory: (category: string) => Promise<void>
  updateTransaction: (id: string, data: { type?: 'income' | 'expense'; amount: number; category: string; merchant: string; date: string; note?: string }) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  fetchBudgetSummary: () => Promise<void>
  fetchRecentTransactions: () => Promise<void>
  resetParsedResult: () => void
  setError: (message: string) => void
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  status: 'idle',
  parsedResult: null,
  lastRawText: '',
  aiFeedback: null,
  budgetContext: null,
  budgetSummary: null,
  recentTransactions: [],
  categories: ['entertainment', 'food', 'daily', 'education', 'medical', 'transport', 'other'],
  categoryInfoList: [
    { category: 'entertainment', type: 'expense' },
    { category: 'food', type: 'expense' },
    { category: 'daily', type: 'expense' },
    { category: 'education', type: 'expense' },
    { category: 'medical', type: 'expense' },
    { category: 'transport', type: 'expense' },
    { category: 'other', type: 'expense' },
  ],
  errorMessage: '',
  lastFeedbackText: '',
  lastPersona: useSettingsStore.getState().persona || 'gentle',

  fetchCategories: async () => {
    try {
      const res = await api.get('/budget/categories')
      const rawCats = res.data.data as Array<{ category: string; type?: string; isCustom?: boolean }>
      const cats = rawCats.map((c) => c.category)
      const infoList: CategoryInfo[] = rawCats.map((c) => ({
        category: c.category,
        type: (c.type as 'income' | 'expense') || 'expense',
        isCustom: c.isCustom ?? false,
      }))
      if (cats.length > 0) set({ categories: cats, categoryInfoList: infoList })
    } catch {
      // Keep default categories
    }
  },

  parseInput: async (rawText: string) => {
    set({ status: 'parsing', errorMessage: '', lastRawText: rawText })
    try {
      const llmApiKey = getActiveApiKey()
      const res = await api.post(
        '/ai/parse',
        { raw_text: rawText },
        { headers: { 'X-LLM-API-Key': llmApiKey } }
      )
      const data = res.data.data
      const intent: Intent = data.intent ?? 'transaction'

      if (intent === 'chat') {
        // Chat intent: show AI coach reply, no parsed result card
        const reply = data.reply
        set({
          status: 'chat_reply',
          parsedResult: null,
          aiFeedback: reply
            ? { text: reply.text, emotionTag: reply.emotion_tag }
            : null,
          lastFeedbackText: reply?.text ?? '',
        })
        return
      }

      // Transaction intent: existing flow
      const { parsed, feedback, budget_context: bc } = data

      // If LLM suggests a "new" category that already exists, use it directly
      let isNewCategory = parsed.is_new_category ?? false
      let category = parsed.category
      const suggested = parsed.suggested_category
      if (isNewCategory && suggested) {
        const existing = get().categoryInfoList.find(
          (c) => c.category === suggested || c.category.toLowerCase() === suggested.toLowerCase()
        )
        if (existing) {
          category = existing.category
          isNewCategory = false
        }
      }

      set({
        status: 'parsed',
        parsedResult: {
          type: parsed.type ?? 'expense',
          amount: parsed.amount,
          category,
          merchant: parsed.merchant,
          date: parsed.date,
          confidence: parsed.confidence,
          isNewCategory,
          suggestedCategory: isNewCategory ? suggested : null,
          note: parsed.note ?? null,
        },
        aiFeedback: feedback
          ? { text: feedback.text, emotionTag: feedback.emotion_tag }
          : null,
        budgetContext: bc
          ? {
              monthlyBudget: bc.monthly_budget,
              spentThisMonth: bc.spent_this_month,
              remaining: bc.remaining,
              usedRatio: bc.used_ratio,
              categorySpent: bc.category_spent,
              categoryLimit: bc.category_limit,
            }
          : null,
        lastFeedbackText: feedback?.text ?? '',
      })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? '記帳失敗，請稍後重試'
      set({ status: 'error', errorMessage: message })
    }
  },

  confirmTransaction: async (data) => {
    set({ status: 'saving', errorMessage: '' })
    try {
      const res = await api.post('/transactions', {
        type: data.type,
        amount: data.amount,
        category: data.category,
        merchant: data.merchant,
        raw_text: data.rawText,
        transaction_date: data.date,
        note: data.note ?? undefined,
        feedback: data.feedback
          ? {
              text: data.feedback.text,
              emotion_tag: data.feedback.emotionTag,
              persona_used: get().lastPersona,
            }
          : undefined,
      })
      const tx = res.data.data.transaction
      const newTransaction: Transaction = {
        id: tx.id,
        type: tx.type ?? 'expense',
        amount: tx.amount,
        category: tx.category,
        merchant: tx.merchant,
        rawText: tx.raw_text,
        note: tx.note,
        transactionDate: tx.transaction_date,
        createdAt: tx.created_at,
      }

      const feedback = res.data.data.feedback
      set((state) => ({
        status: 'idle',
        parsedResult: null,
        recentTransactions: [newTransaction, ...state.recentTransactions].slice(
          0,
          5
        ),
        lastFeedbackText: feedback?.feedback_text ?? state.lastFeedbackText,
        lastPersona: feedback?.persona_used ?? state.lastPersona,
      }))
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? '儲存失敗，請稍後重試'
      set({ status: 'error', errorMessage: message })
    }
  },

  createCategory: async (category: string, type?: 'income' | 'expense') => {
    try {
      await api.post('/budget/categories', { category, type: type || 'expense' })
      await get().fetchCategories()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      // 409 = category already exists, treat as success
      if (status === 409) {
        await get().fetchCategories()
        return
      }
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? '新增類別失敗'
      set({ status: 'error', errorMessage: message })
      throw err
    }
  },

  deleteCategory: async (category: string) => {
    try {
      await api.delete(`/budget/categories/${encodeURIComponent(category)}`)
      await get().fetchCategories()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? '刪除類別失敗'
      set({ status: 'error', errorMessage: message })
      throw err
    }
  },

  fetchBudgetSummary: async () => {
    try {
      const res = await api.get('/budget/summary')
      const d = res.data.data
      set({
        budgetSummary: {
          month: d.month,
          monthlyBudget: d.monthly_budget,
          totalSpent: d.total_spent,
          remaining: d.remaining,
          usedRatio: d.used_ratio,
          totalIncome: d.total_income ?? 0,
          totalAsset: d.total_asset ?? 0,
          allTimeIncome: d.all_time_income ?? 0,
          allTimeSpent: d.all_time_spent ?? 0,
          transactionCount: d.transaction_count,
        },
      })
    } catch {
      // Silently fail - budget card will show default state
    }
  },

  fetchRecentTransactions: async () => {
    try {
      const res = await api.get('/transactions', {
        params: { limit: 5, sort: 'desc' },
      })
      const items = res.data.data.items.map(
        (t: Record<string, unknown>) =>
          ({
            id: t.id as string,
            type: (t.type as 'income' | 'expense') ?? 'expense',
            amount: t.amount as number,
            category: t.category as string,
            merchant: t.merchant as string,
            rawText: '',
            note: (t.note as string) ?? undefined,
            transactionDate: t.transaction_date as string,
            createdAt: t.created_at as string,
          }) satisfies Transaction
      )
      set({ recentTransactions: items })
    } catch {
      // Silently fail
    }
  },

  updateTransaction: async (id: string, data) => {
    try {
      await api.put(`/transactions/${id}`, {
        ...(data.type ? { type: data.type } : {}),
        amount: data.amount,
        category: data.category,
        merchant: data.merchant,
        transaction_date: data.date,
        note: data.note ?? undefined,
      })
      set((state) => ({
        recentTransactions: state.recentTransactions.map((tx) =>
          tx.id === id
            ? { ...tx, ...(data.type ? { type: data.type } : {}), amount: data.amount, category: data.category, merchant: data.merchant, transactionDate: data.date, note: data.note }
            : tx
        ),
      }))
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? '更新失敗，請稍後重試'
      set({ status: 'error', errorMessage: message })
      throw err
    }
  },

  deleteTransaction: async (id: string) => {
    try {
      await api.delete(`/transactions/${id}`)
      set((state) => ({
        recentTransactions: state.recentTransactions.filter((tx) => tx.id !== id),
      }))
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? '刪除失敗，請稍後重試'
      set({ status: 'error', errorMessage: message })
      throw err
    }
  },

  resetParsedResult: () => {
    set({ status: 'idle', parsedResult: null, lastRawText: '', errorMessage: '' })
  },

  setError: (message: string) => {
    set({ status: 'error', errorMessage: message })
  },
}))
