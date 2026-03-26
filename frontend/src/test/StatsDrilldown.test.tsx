import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import StatsPage from '../pages/StatsPage'

// Mock recharts
vi.mock('recharts', () => {
  const MockResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  )
  const MockPieChart = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  )
  const MockPie = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  )
  const MockCell = ({ fill }: { fill: string }) => (
    <div data-testid="cell" data-fill={fill} />
  )
  const MockTooltip = () => <div data-testid="tooltip" />

  return {
    ResponsiveContainer: MockResponsiveContainer,
    PieChart: MockPieChart,
    Pie: MockPie,
    Cell: MockCell,
    Tooltip: MockTooltip,
  }
})

// Mock api module
const mockGet = vi.fn()
vi.mock('../lib/api.ts', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    put: vi.fn(),
    post: vi.fn(),
  },
}))

function renderStatsPage() {
  return render(
    <MemoryRouter>
      <StatsPage />
    </MemoryRouter>,
  )
}

const mockDistributionResponse = (items: Array<{ category: string; amount: number; ratio: number }>) => ({
  data: {
    code: 200,
    data: {
      month: '2026-03',
      total: items.reduce((sum, i) => sum + i.amount, 0),
      distribution: items,
    },
  },
})

const mockBudgetResponse = (budget = 50000, spent = 30000) => ({
  data: {
    code: 200,
    data: {
      month: '2026-03',
      monthly_budget: budget,
      total_spent: spent,
      remaining: budget - spent,
      used_ratio: spent / budget,
    },
  },
})

const mockTransactionsResponse = (items: Array<Record<string, unknown>>) => ({
  data: {
    code: 200,
    data: {
      items,
      total: items.length,
    },
  },
})

const mockTransactionDetailResponse = (data: Record<string, unknown>) => ({
  data: {
    code: 200,
    data,
  },
})

describe('Stats Page Drilldown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows expand arrow on category bars and expands on click', async () => {
    const user = userEvent.setup()

    mockGet.mockImplementation((url: string) => {
      if (url === '/stats/distribution') {
        return Promise.resolve(mockDistributionResponse([
          { category: 'food', amount: 7000, ratio: 0.7 },
          { category: 'transport', amount: 3000, ratio: 0.3 },
        ]))
      }
      if (url === '/budget/summary') {
        return Promise.resolve(mockBudgetResponse())
      }
      if (url === '/transactions') {
        return Promise.resolve(mockTransactionsResponse([
          {
            id: 'tx-1',
            type: 'expense',
            amount: 500,
            category: 'food',
            merchant: '午餐店',
            raw_text: '午餐 500',
            transaction_date: '2026-03-20T00:00:00Z',
            created_at: '2026-03-20T12:00:00Z',
          },
        ]))
      }
      return Promise.resolve({ data: { data: {} } })
    })

    renderStatsPage()

    // Wait for stats to load
    await waitFor(() => {
      expect(screen.getByTestId('category-bar-food')).toBeInTheDocument()
    })

    // Category bar should exist and not be expanded
    const foodBar = screen.getByTestId('category-bar-food')
    expect(foodBar).toHaveAttribute('aria-expanded', 'false')

    // Click the food category bar
    await user.click(foodBar)

    // Should now be expanded
    expect(foodBar).toHaveAttribute('aria-expanded', 'true')

    // Should fetch transactions
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/transactions', expect.objectContaining({
        params: expect.objectContaining({ category: 'food' }),
      }))
    })

    // Transaction list should appear
    await waitFor(() => {
      expect(screen.getByTestId('category-tx-list')).toBeInTheDocument()
    })
  })

  it('collapses when clicking the same category again', async () => {
    const user = userEvent.setup()

    mockGet.mockImplementation((url: string) => {
      if (url === '/stats/distribution') {
        return Promise.resolve(mockDistributionResponse([
          { category: 'food', amount: 7000, ratio: 0.7 },
        ]))
      }
      if (url === '/budget/summary') {
        return Promise.resolve(mockBudgetResponse())
      }
      if (url === '/transactions') {
        return Promise.resolve(mockTransactionsResponse([]))
      }
      return Promise.resolve({ data: { data: {} } })
    })

    renderStatsPage()

    await waitFor(() => {
      expect(screen.getByTestId('category-bar-food')).toBeInTheDocument()
    })

    const foodBar = screen.getByTestId('category-bar-food')

    // Expand
    await user.click(foodBar)
    expect(foodBar).toHaveAttribute('aria-expanded', 'true')

    // Collapse
    await user.click(foodBar)
    expect(foodBar).toHaveAttribute('aria-expanded', 'false')
  })

  it('only one category expanded at a time', async () => {
    const user = userEvent.setup()

    mockGet.mockImplementation((url: string) => {
      if (url === '/stats/distribution') {
        return Promise.resolve(mockDistributionResponse([
          { category: 'food', amount: 7000, ratio: 0.7 },
          { category: 'transport', amount: 3000, ratio: 0.3 },
        ]))
      }
      if (url === '/budget/summary') {
        return Promise.resolve(mockBudgetResponse())
      }
      if (url === '/transactions') {
        return Promise.resolve(mockTransactionsResponse([]))
      }
      return Promise.resolve({ data: { data: {} } })
    })

    renderStatsPage()

    await waitFor(() => {
      expect(screen.getByTestId('category-bar-food')).toBeInTheDocument()
      expect(screen.getByTestId('category-bar-transport')).toBeInTheDocument()
    })

    const foodBar = screen.getByTestId('category-bar-food')
    const transportBar = screen.getByTestId('category-bar-transport')

    // Expand food
    await user.click(foodBar)
    expect(foodBar).toHaveAttribute('aria-expanded', 'true')
    expect(transportBar).toHaveAttribute('aria-expanded', 'false')

    // Click transport → food should collapse, transport should expand
    await user.click(transportBar)
    expect(foodBar).toHaveAttribute('aria-expanded', 'false')
    expect(transportBar).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders transaction detail inline when clicking a transaction', async () => {
    const user = userEvent.setup()

    mockGet.mockImplementation((url: string) => {
      if (url === '/stats/distribution') {
        return Promise.resolve(mockDistributionResponse([
          { category: 'food', amount: 7000, ratio: 1.0 },
        ]))
      }
      if (url === '/budget/summary') {
        return Promise.resolve(mockBudgetResponse())
      }
      if (url === '/transactions') {
        return Promise.resolve(mockTransactionsResponse([
          {
            id: 'tx-detail-1',
            type: 'expense',
            amount: 350,
            category: 'food',
            merchant: '便利商店',
            raw_text: '便利商店 350',
            note: '買水',
            transaction_date: '2026-03-22T00:00:00Z',
            created_at: '2026-03-22T10:00:00Z',
          },
        ]))
      }
      if (url === '/transactions/tx-detail-1') {
        return Promise.resolve(mockTransactionDetailResponse({
          id: 'tx-detail-1',
          type: 'expense',
          amount: 350,
          category: 'food',
          merchant: '便利商店',
          note: '買水',
          transaction_date: '2026-03-22T00:00:00Z',
          created_at: '2026-03-22T10:00:00Z',
        }))
      }
      return Promise.resolve({ data: { data: {} } })
    })

    renderStatsPage()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('category-bar-food')).toBeInTheDocument()
    })

    // Expand the food category
    await user.click(screen.getByTestId('category-bar-food'))

    // Wait for transaction list to appear
    await waitFor(() => {
      expect(screen.getByTestId('category-tx-list')).toBeInTheDocument()
    })

    // Click the transaction to expand inline detail
    const txToggle = screen.getByTestId('drilldown-tx-toggle-tx-detail-1')
    await user.click(txToggle)

    // Should show note in expanded detail
    await waitFor(() => {
      expect(screen.getByText('買水')).toBeInTheDocument()
    })
  })

  it('shows empty message when category has no transactions', async () => {
    const user = userEvent.setup()

    mockGet.mockImplementation((url: string) => {
      if (url === '/stats/distribution') {
        return Promise.resolve(mockDistributionResponse([
          { category: 'food', amount: 7000, ratio: 1.0 },
        ]))
      }
      if (url === '/budget/summary') {
        return Promise.resolve(mockBudgetResponse())
      }
      if (url === '/transactions') {
        return Promise.resolve(mockTransactionsResponse([]))
      }
      return Promise.resolve({ data: { data: {} } })
    })

    renderStatsPage()

    await waitFor(() => {
      expect(screen.getByTestId('category-bar-food')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('category-bar-food'))

    await waitFor(() => {
      expect(screen.getByTestId('category-tx-empty')).toBeInTheDocument()
    })

    expect(screen.getByText('此類別無交易記錄')).toBeInTheDocument()
  })
})
