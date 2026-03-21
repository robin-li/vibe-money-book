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

describe('StatsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders expense tab as default with budget bar', async () => {
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
      return Promise.resolve({ data: { data: {} } })
    })

    renderStatsPage()

    await waitFor(() => {
      expect(screen.getByText('本月總支出')).toBeInTheDocument()
    })

    // Expense tab should be selected
    const expenseTab = screen.getByTestId('tab-expense')
    expect(expenseTab).toHaveAttribute('aria-selected', 'true')

    // Budget bar should be present
    expect(screen.getByTestId('budget-bar')).toBeInTheDocument()

    // Distribution chart should render
    expect(screen.getByTestId('distribution-chart')).toBeInTheDocument()

    // API should be called with type=expense
    expect(mockGet).toHaveBeenCalledWith('/stats/distribution', expect.objectContaining({
      params: expect.objectContaining({ type: 'expense' }),
    }))
  })

  it('switches to income tab and hides budget bar', async () => {
    const user = userEvent.setup()

    mockGet.mockImplementation((url: string, config?: { params?: { type?: string } }) => {
      const type = config?.params?.type
      if (url === '/stats/distribution' && type === 'expense') {
        return Promise.resolve(mockDistributionResponse([
          { category: 'food', amount: 7000, ratio: 1.0 },
        ]))
      }
      if (url === '/stats/distribution' && type === 'income') {
        return Promise.resolve(mockDistributionResponse([
          { category: 'salary', amount: 50000, ratio: 0.9 },
          { category: 'investment', amount: 5000, ratio: 0.1 },
        ]))
      }
      if (url === '/budget/summary') {
        return Promise.resolve(mockBudgetResponse())
      }
      return Promise.resolve({ data: { data: {} } })
    })

    renderStatsPage()

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('本月總支出')).toBeInTheDocument()
    })

    // Click income tab
    const incomeTab = screen.getByTestId('tab-income')
    await user.click(incomeTab)

    await waitFor(() => {
      expect(screen.getByText('本月總收入')).toBeInTheDocument()
    })

    // Income tab should be selected
    expect(incomeTab).toHaveAttribute('aria-selected', 'true')

    // Budget bar should NOT be present
    expect(screen.queryByTestId('budget-bar')).not.toBeInTheDocument()

    // Budget summary should NOT have been requested for income tab
    const incomeCalls = mockGet.mock.calls.filter(
      (call) => call[0] === '/budget/summary' && call[1]?.params?.type === 'income',
    )
    expect(incomeCalls).toHaveLength(0)
  })

  it('shows empty state message for income tab when no data', async () => {
    mockGet.mockImplementation((url: string, config?: { params?: { type?: string } }) => {
      const type = config?.params?.type
      if (url === '/stats/distribution' && type === 'expense') {
        return Promise.resolve(mockDistributionResponse([]))
      }
      if (url === '/stats/distribution' && type === 'income') {
        return Promise.resolve(mockDistributionResponse([]))
      }
      if (url === '/budget/summary') {
        return Promise.resolve(mockBudgetResponse(0, 0))
      }
      return Promise.resolve({ data: { data: {} } })
    })

    const user = userEvent.setup()
    renderStatsPage()

    await waitFor(() => {
      expect(screen.getByText('本月尚無支出記錄')).toBeInTheDocument()
    })

    // Switch to income
    await user.click(screen.getByTestId('tab-income'))

    await waitFor(() => {
      expect(screen.getByText('本月尚無收入記錄')).toBeInTheDocument()
    })
  })

  it('displays income total in green and expense total in red', async () => {
    mockGet.mockImplementation((url: string, config?: { params?: { type?: string } }) => {
      const type = config?.params?.type
      if (url === '/stats/distribution' && type === 'expense') {
        return Promise.resolve(mockDistributionResponse([
          { category: 'food', amount: 5000, ratio: 1.0 },
        ]))
      }
      if (url === '/stats/distribution' && type === 'income') {
        return Promise.resolve(mockDistributionResponse([
          { category: 'salary', amount: 50000, ratio: 1.0 },
        ]))
      }
      if (url === '/budget/summary') {
        return Promise.resolve(mockBudgetResponse(50000, 5000))
      }
      return Promise.resolve({ data: { data: {} } })
    })

    const user = userEvent.setup()
    renderStatsPage()

    // Expense tab - red headline
    await waitFor(() => {
      const section = screen.getByLabelText('總支出')
      const headline = section.querySelector('.text-headline')
      expect(headline).not.toBeNull()
      expect(headline!.className).toContain('text-danger')
      expect(headline!.textContent).toBe('$5,000')
    })

    // Switch to income tab - green headline
    await user.click(screen.getByTestId('tab-income'))

    await waitFor(() => {
      const section = screen.getByLabelText('本月總收入')
      const headline = section.querySelector('.text-headline')
      expect(headline).not.toBeNull()
      expect(headline!.className).toContain('text-success')
      expect(headline!.textContent).toBe('$50,000')
    })
  })
})
