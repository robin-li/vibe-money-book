import { create } from 'zustand'
import api from '../lib/api'
import type { Transaction } from '../stores/index'
import { useSettingsStore } from './settingsStore'

export interface HistoryFilters {
  category: string
  type: string
  startDate: string
  endDate: string
}

export interface UpdateTransactionInput {
  type?: 'income' | 'expense'
  amount?: number
  category?: string
  merchant?: string
  transaction_date?: string
  note?: string
}

/** AI 語義查詢結果 */
export interface AIQueryResult {
  summary: {
    text: string
    emotion_tag: string
    total_amount: number
    match_count: number
  }
  matched_transaction_ids: string[]
  time_range: {
    start_date: string
    end_date: string
  }
}

interface HistoryState {
  transactions: Transaction[]
  filters: HistoryFilters
  page: number
  hasMore: boolean
  isLoading: boolean
  isDeleting: string | null
  isUpdating: string | null
  errorMessage: string

  // AI Query state
  aiQueryResult: AIQueryResult | null
  aiQueryText: string
  isQuerying: boolean

  // Actions
  fetchTransactions: (reset?: boolean) => Promise<void>
  loadMore: () => Promise<void>
  setFilters: (filters: Partial<HistoryFilters>) => void
  resetFilters: () => void
  deleteTransaction: (id: string) => Promise<void>
  updateTransaction: (id: string, input: UpdateTransactionInput) => Promise<void>
  queryTransactions: (queryText: string) => Promise<void>
  clearAIQuery: () => void
  clearAllFilters: () => void
}

const PAGE_SIZE = 20

const defaultFilters: HistoryFilters = {
  category: '',
  type: '',
  startDate: '',
  endDate: '',
}

/** 讀取當前引擎對應的 API Key（空字串表示未設定） */
function getActiveApiKey(): string {
  const engine = useSettingsStore.getState().aiEngine
  try {
    const stored = localStorage.getItem('llm_api_keys')
    if (stored) {
      const keys = JSON.parse(stored)
      return keys[engine] ?? ''
    }
  } catch { /* ignore */ }
  return localStorage.getItem('llm_api_key') ?? ''
}

/** 建構 LLM 請求 headers */
function llmHeaders(): Record<string, string> {
  const key = getActiveApiKey()
  return key ? { 'X-LLM-API-Key': key } : {}
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  transactions: [],
  filters: { ...defaultFilters },
  page: 1,
  hasMore: true,
  isLoading: false,
  isDeleting: null,
  isUpdating: null,
  errorMessage: '',

  // AI Query state
  aiQueryResult: null,
  aiQueryText: '',
  isQuerying: false,

  fetchTransactions: async (reset = true) => {
    const state = get()
    if (state.isLoading) return

    const page = reset ? 1 : state.page
    set({ isLoading: true, errorMessage: '' })

    try {
      const params: Record<string, string | number> = {
        page,
        limit: PAGE_SIZE,
        sort: 'desc',
      }
      if (state.filters.category) params.category = state.filters.category
      if (state.filters.type) params.type = state.filters.type
      if (state.filters.startDate) params.start_date = state.filters.startDate
      if (state.filters.endDate) params.end_date = state.filters.endDate

      const res = await api.get('/transactions', { params })
      const items: Transaction[] = res.data.data.items.map(
        (t: Record<string, unknown>) => ({
          id: t.id as string,
          type: (t.type as 'income' | 'expense') ?? 'expense',
          amount: t.amount as number,
          category: t.category as string,
          merchant: t.merchant as string,
          rawText: (t.raw_text as string) ?? '',
          note: (t.note as string) ?? undefined,
          transactionDate: t.transaction_date as string,
          createdAt: t.created_at as string,
        })
      )

      const hasMore = items.length >= PAGE_SIZE

      if (reset) {
        set({ transactions: items, page: 2, hasMore, isLoading: false })
      } else {
        set((s) => ({
          transactions: [...s.transactions, ...items],
          page: s.page + 1,
          hasMore,
          isLoading: false,
        }))
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? '載入交易記錄失敗'
      set({ isLoading: false, errorMessage: message })
    }
  },

  loadMore: async () => {
    const state = get()
    if (state.isLoading || !state.hasMore) return
    await get().fetchTransactions(false)
  },

  setFilters: (filters) => {
    set((s) => ({ filters: { ...s.filters, ...filters } }))
  },

  resetFilters: () => {
    set({ filters: { ...defaultFilters } })
  },

  deleteTransaction: async (id: string) => {
    set({ isDeleting: id, errorMessage: '' })
    try {
      await api.delete(`/transactions/${id}`)
      set((s) => ({
        transactions: s.transactions.filter((tx) => tx.id !== id),
        isDeleting: null,
      }))
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? '刪除失敗，請稍後重試'
      set({ isDeleting: null, errorMessage: message })
      throw err
    }
  },

  updateTransaction: async (id: string, input: UpdateTransactionInput) => {
    set({ isUpdating: id, errorMessage: '' })
    try {
      const res = await api.put(`/transactions/${id}`, input)
      const t = res.data.data.transaction as Record<string, unknown>
      const updated: Transaction = {
        id: t.id as string,
        type: (t.type as 'income' | 'expense') ?? 'expense',
        amount: t.amount as number,
        category: t.category as string,
        merchant: (t.merchant as string) ?? '',
        rawText: (t.raw_text as string) ?? '',
        note: (t.note as string) ?? undefined,
        transactionDate: t.transaction_date as string,
        createdAt: t.created_at as string,
      }
      set((s) => ({
        transactions: s.transactions.map((tx) => (tx.id === id ? updated : tx)),
        isUpdating: null,
      }))
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? '更新失敗，請稍後重試'
      set({ isUpdating: null, errorMessage: message })
      throw err
    }
  },

  queryTransactions: async (queryText: string) => {
    const state = get()
    if (state.isQuerying) return

    // 互斥：清除手動篩選器
    set({
      isQuerying: true,
      errorMessage: '',
      aiQueryText: queryText,
      filters: { ...defaultFilters },
    })

    try {
      const llmApiKey = getActiveApiKey()
      const { hasDefaultKey } = useSettingsStore.getState()
      const engine = useSettingsStore.getState().aiEngine
      if (!llmApiKey && !hasDefaultKey[engine]) {
        set({ isQuerying: false, errorMessage: '請先在設定頁面輸入 AI API Key' })
        return
      }

      const res = await api.post(
        '/ai/query',
        { query_text: queryText },
        { headers: llmHeaders(), timeout: 60000 }
      )

      const result = res.data.data as AIQueryResult

      // 載入匹配時間範圍內的交易記錄
      // 後端 limit 上限為 100，分頁載入所有匹配時間範圍的交易
      const allItems: Transaction[] = []
      let txPage = 1
      let txHasMore = true
      while (txHasMore) {
        const params: Record<string, string | number> = {
          page: txPage,
          limit: 100,
          sort: 'desc',
          start_date: result.time_range.start_date,
          end_date: result.time_range.end_date,
        }
        const txRes = await api.get('/transactions', { params })
        const items: Transaction[] = txRes.data.data.items.map(
          (t: Record<string, unknown>) => ({
            id: t.id as string,
            type: (t.type as 'income' | 'expense') ?? 'expense',
            amount: t.amount as number,
            category: t.category as string,
            merchant: t.merchant as string,
            rawText: (t.raw_text as string) ?? '',
            note: (t.note as string) ?? undefined,
            transactionDate: t.transaction_date as string,
            createdAt: t.created_at as string,
          })
        )
        allItems.push(...items)
        txHasMore = items.length >= 100
        txPage++
      }

      // 篩選出匹配的交易
      const matchedIds = new Set(result.matched_transaction_ids)
      const matched = allItems.filter((tx) => matchedIds.has(tx.id))

      set({
        aiQueryResult: result,
        transactions: matched,
        hasMore: false,
        page: 1,
        isQuerying: false,
      })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'AI 查詢失敗，請稍後重試'
      set({ isQuerying: false, errorMessage: message })
    }
  },

  clearAIQuery: () => {
    set({ aiQueryResult: null, aiQueryText: '' })
  },

  clearAllFilters: () => {
    set({
      filters: { ...defaultFilters },
      aiQueryResult: null,
      aiQueryText: '',
    })
    setTimeout(() => useHistoryStore.getState().fetchTransactions(true), 0)
  },
}))
