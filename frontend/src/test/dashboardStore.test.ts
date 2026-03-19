import { describe, it, expect, beforeEach } from 'vitest'
import { useDashboardStore } from '../stores/dashboardStore'

describe('dashboardStore', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      status: 'idle',
      parsedResult: null,
      aiFeedback: null,
      budgetContext: null,
      budgetSummary: null,
      recentTransactions: [],
      errorMessage: '',
      lastFeedbackText: '',
      lastPersona: 'gentle',
    })
  })

  describe('state management', () => {
    it('starts with idle status', () => {
      const state = useDashboardStore.getState()
      expect(state.status).toBe('idle')
      expect(state.parsedResult).toBeNull()
      expect(state.recentTransactions).toEqual([])
    })

    it('resetParsedResult clears to idle', () => {
      useDashboardStore.setState({
        status: 'parsed',
        parsedResult: {
          type: 'expense' as const,
          amount: 100,
          category: 'food',
          merchant: 'test',
          date: '2026-03-18',
          confidence: 0.9,
          isNewCategory: false,
          suggestedCategory: null,
    note: null,
        },
        errorMessage: 'some error',
      })

      useDashboardStore.getState().resetParsedResult()

      const state = useDashboardStore.getState()
      expect(state.status).toBe('idle')
      expect(state.parsedResult).toBeNull()
      expect(state.errorMessage).toBe('')
    })

    it('setError sets error status', () => {
      useDashboardStore.getState().setError('test error')

      const state = useDashboardStore.getState()
      expect(state.status).toBe('error')
      expect(state.errorMessage).toBe('test error')
    })

    it('can store parsed result via setState', () => {
      useDashboardStore.setState({
        status: 'parsed',
        parsedResult: {
          type: 'expense',
          amount: 180,
          category: 'food',
          merchant: '拉麵店',
          date: '2026-03-18',
          confidence: 0.95,
          isNewCategory: false,
          suggestedCategory: null,
    note: null,
        },
        aiFeedback: {
          text: '享受美味',
          emotionTag: '鼓勵',
        },
      })

      const state = useDashboardStore.getState()
      expect(state.status).toBe('parsed')
      expect(state.parsedResult?.amount).toBe(180)
      expect(state.parsedResult?.category).toBe('food')
      expect(state.aiFeedback?.text).toBe('享受美味')
    })

    it('can store new category parse result', () => {
      useDashboardStore.setState({
        status: 'parsed',
        parsedResult: {
          type: 'expense',
          amount: 1200,
          category: null,
          merchant: '獸醫',
          date: '2026-03-18',
          confidence: 0.9,
          isNewCategory: true,
          suggestedCategory: '寵物',
    note: null,
        },
      })

      const state = useDashboardStore.getState()
      expect(state.parsedResult?.isNewCategory).toBe(true)
      expect(state.parsedResult?.suggestedCategory).toBe('寵物')
    })

    it('can store budget summary', () => {
      useDashboardStore.setState({
        budgetSummary: {
          month: '2026-03',
          monthlyBudget: 20000,
          totalSpent: 5000,
          remaining: 15000,
          usedRatio: 0.25,
          transactionCount: 10,
        },
      })

      const state = useDashboardStore.getState()
      expect(state.budgetSummary?.monthlyBudget).toBe(20000)
      expect(state.budgetSummary?.totalSpent).toBe(5000)
      expect(state.budgetSummary?.usedRatio).toBe(0.25)
    })

    it('can store recent transactions', () => {
      useDashboardStore.setState({
        recentTransactions: [
          {
            id: 'tx-1',
            amount: 180,
            category: 'food',
            merchant: '拉麵店',
            rawText: '拉麵 180',
            transactionDate: '2026-03-18',
            createdAt: '2026-03-18T12:00:00Z',
          },
          {
            id: 'tx-2',
            amount: 35,
            category: 'transport',
            merchant: '捷運',
            rawText: '搭捷運 35',
            transactionDate: '2026-03-18',
            createdAt: '2026-03-18T08:30:00Z',
          },
        ],
      })

      const state = useDashboardStore.getState()
      expect(state.recentTransactions).toHaveLength(2)
      expect(state.recentTransactions[0].merchant).toBe('拉麵店')
    })

    it('stores feedback text', () => {
      useDashboardStore.setState({
        lastFeedbackText: '享受美味是很重要的',
        lastPersona: 'gentle',
      })

      const state = useDashboardStore.getState()
      expect(state.lastFeedbackText).toBe('享受美味是很重要的')
      expect(state.lastPersona).toBe('gentle')
    })
  })
})
