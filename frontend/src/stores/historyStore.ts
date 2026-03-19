import { create } from 'zustand'
import api from '../lib/api'
import type { Transaction } from '../stores/index'

export interface HistoryFilters {
  category: string
  startDate: string
  endDate: string
}

interface HistoryState {
  transactions: Transaction[]
  filters: HistoryFilters
  page: number
  hasMore: boolean
  isLoading: boolean
  isDeleting: string | null
  errorMessage: string

  // Actions
  fetchTransactions: (reset?: boolean) => Promise<void>
  loadMore: () => Promise<void>
  setFilters: (filters: Partial<HistoryFilters>) => void
  resetFilters: () => void
  deleteTransaction: (id: string) => Promise<void>
}

const PAGE_SIZE = 20

const defaultFilters: HistoryFilters = {
  category: '',
  startDate: '',
  endDate: '',
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  transactions: [],
  filters: { ...defaultFilters },
  page: 1,
  hasMore: true,
  isLoading: false,
  isDeleting: null,
  errorMessage: '',

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
      if (state.filters.startDate) params.start_date = state.filters.startDate
      if (state.filters.endDate) params.end_date = state.filters.endDate

      const res = await api.get('/transactions', { params })
      const items: Transaction[] = res.data.data.items.map(
        (t: Record<string, unknown>) => ({
          id: t.id as string,
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
}))
