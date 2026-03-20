import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HistoryPage from '../pages/HistoryPage'
import { useHistoryStore } from '../stores/historyStore'

// Mock api module
vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { data: { items: [] } } }),
    delete: vi.fn().mockResolvedValue({}),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

const mockTransactions = [
  {
    id: 'tx-1',
    amount: 250,
    category: 'food',
    merchant: '拉麵店',
    rawText: '午餐吃拉麵 250',
    note: '很好吃',
    transactionDate: '2026-03-19',
    createdAt: '2026-03-19T13:07:00Z',
  },
  {
    id: 'tx-2',
    amount: 35,
    category: 'transport',
    merchant: '捷運',
    rawText: '搭捷運 35',
    transactionDate: '2026-03-19',
    createdAt: '2026-03-19T08:30:00Z',
  },
  {
    id: 'tx-3',
    amount: 500,
    category: 'shopping',
    merchant: '百貨公司',
    rawText: '買衣服 500',
    transactionDate: '2026-03-18',
    createdAt: '2026-03-18T14:00:00Z',
  },
]

// Override fetchTransactions to be a no-op in tests (we set state directly)
function setStoreState(overrides: Partial<ReturnType<typeof useHistoryStore.getState>>) {
  useHistoryStore.setState({
    ...overrides,
    // Override fetchTransactions to avoid API calls during render
    fetchTransactions: vi.fn(),
    loadMore: vi.fn(),
    deleteTransaction: vi.fn().mockResolvedValue(undefined),
  })
}

describe('HistoryPage', () => {
  beforeEach(() => {
    setStoreState({
      transactions: [],
      filters: { category: '', startDate: '', endDate: '' },
      page: 1,
      hasMore: true,
      isLoading: false,
      isDeleting: null,
      errorMessage: '',
    })
  })

  it('renders empty state when no transactions', () => {
    setStoreState({
      transactions: [],
      hasMore: false,
      isLoading: false,
    })
    render(<HistoryPage />)
    expect(screen.getByText('還沒有記帳紀錄，開始記帳吧！')).toBeInTheDocument()
  })

  it('renders transaction list with correct data', () => {
    setStoreState({
      transactions: mockTransactions,
      hasMore: false,
      isLoading: false,
    })
    render(<HistoryPage />)

    expect(screen.getByText('拉麵店')).toBeInTheDocument()
    expect(screen.getByText('捷運')).toBeInTheDocument()
    expect(screen.getByText('百貨公司')).toBeInTheDocument()
    expect(screen.getByText('-$250')).toBeInTheDocument()
    expect(screen.getByText('-$35')).toBeInTheDocument()
    expect(screen.getByText('-$500')).toBeInTheDocument()
  })

  it('renders filter controls', () => {
    setStoreState({ transactions: [], hasMore: false, isLoading: false })
    render(<HistoryPage />)

    expect(screen.getByLabelText('類別篩選')).toBeInTheDocument()
    expect(screen.getByLabelText('開始日期')).toBeInTheDocument()
    expect(screen.getByLabelText('結束日期')).toBeInTheDocument()
  })

  it('shows category filter options', () => {
    setStoreState({ transactions: [], hasMore: false, isLoading: false })
    render(<HistoryPage />)

    const select = screen.getByLabelText('類別篩選') as HTMLSelectElement
    const options = select.querySelectorAll('option')
    expect(options.length).toBe(8) // 全部 + 7 categories
  })

  it('shows load more button when hasMore is true', () => {
    setStoreState({
      transactions: mockTransactions,
      hasMore: true,
      isLoading: false,
    })
    render(<HistoryPage />)
    expect(screen.getByTestId('load-more-btn')).toBeInTheDocument()
    expect(screen.getByText('載入更多')).toBeInTheDocument()
  })

  it('hides load more button when hasMore is false', () => {
    setStoreState({
      transactions: mockTransactions,
      hasMore: false,
      isLoading: false,
    })
    render(<HistoryPage />)
    expect(screen.queryByTestId('load-more-btn')).not.toBeInTheDocument()
  })

  it('shows error message when errorMessage is set', () => {
    setStoreState({
      transactions: [],
      hasMore: false,
      isLoading: false,
      errorMessage: '載入失敗',
    })
    render(<HistoryPage />)
    expect(screen.getByTestId('error-message')).toBeInTheDocument()
    expect(screen.getByText('載入失敗')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    setStoreState({
      transactions: [],
      hasMore: true,
      isLoading: true,
    })
    render(<HistoryPage />)
    expect(screen.getByTestId('loading-state')).toBeInTheDocument()
  })

  it('shows reset filters button when filters are active', () => {
    setStoreState({
      transactions: [],
      hasMore: false,
      isLoading: false,
      filters: { category: 'food', startDate: '', endDate: '' },
    })
    render(<HistoryPage />)
    expect(screen.getByTestId('reset-filters-btn')).toBeInTheDocument()
  })

  it('does not show reset filters button when no filters active', () => {
    setStoreState({
      transactions: [],
      hasMore: false,
      isLoading: false,
      filters: { category: '', startDate: '', endDate: '' },
    })
    render(<HistoryPage />)
    expect(screen.queryByTestId('reset-filters-btn')).not.toBeInTheDocument()
  })
})

describe('TransactionItem interactions', () => {
  beforeEach(() => {
    setStoreState({
      transactions: mockTransactions,
      filters: { category: '', startDate: '', endDate: '' },
      page: 1,
      hasMore: false,
      isLoading: false,
      isDeleting: null,
      errorMessage: '',
    })
  })

  it('expands transaction details on click', async () => {
    const user = userEvent.setup()
    render(<HistoryPage />)

    const txButton = screen.getByText('拉麵店').closest('button')!
    await user.click(txButton)

    // Should show expanded details (amount shows with sign prefix based on type)
    expect(screen.getByText('很好吃')).toBeInTheDocument()
    expect(screen.getByText('午餐吃拉麵 250')).toBeInTheDocument()
  })

  it('collapses on second click (accordion)', async () => {
    const user = userEvent.setup()
    render(<HistoryPage />)

    const txButton = screen.getByText('拉麵店').closest('button')!
    await user.click(txButton)
    expect(screen.getByText('很好吃')).toBeInTheDocument()

    await user.click(txButton)
    expect(screen.queryByText('午餐吃拉麵 250')).not.toBeInTheDocument()
  })

  it('shows delete confirmation dialog', async () => {
    const user = userEvent.setup()
    render(<HistoryPage />)

    const txButton = screen.getByText('拉麵店').closest('button')!
    await user.click(txButton)

    const deleteBtn = screen.getByTestId('delete-btn')
    await user.click(deleteBtn)

    expect(screen.getByTestId('delete-confirm-dialog')).toBeInTheDocument()
    expect(screen.getByText('確定要刪除這筆帳目嗎？')).toBeInTheDocument()
  })

  it('cancels delete confirmation', async () => {
    const user = userEvent.setup()
    render(<HistoryPage />)

    const txButton = screen.getByText('拉麵店').closest('button')!
    await user.click(txButton)

    const deleteBtn = screen.getByTestId('delete-btn')
    await user.click(deleteBtn)

    const cancelBtn = screen.getByText('取消')
    await user.click(cancelBtn)

    expect(screen.queryByTestId('delete-confirm-dialog')).not.toBeInTheDocument()
  })
})
