import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DistributionChart from '../components/DistributionChart'
import type { DistributionItem } from '../components/DistributionChart'

// Mock recharts to avoid rendering issues in test environment
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

describe('DistributionChart', () => {
  it('shows empty state when no data', () => {
    render(<DistributionChart data={[]} totalSpent={0} />)
    expect(screen.getByText('本月尚無消費記錄')).toBeInTheDocument()
    expect(screen.getByTestId('distribution-chart-empty')).toBeInTheDocument()
  })

  it('renders chart when data is provided', () => {
    const data: DistributionItem[] = [
      { category: 'food', amount: 5000, percentage: 50 },
      { category: 'transport', amount: 3000, percentage: 30 },
      { category: 'entertainment', amount: 2000, percentage: 20 },
    ]
    render(<DistributionChart data={data} totalSpent={10000} />)
    expect(screen.getByTestId('distribution-chart')).toBeInTheDocument()
    expect(screen.getByText(/飲食 50%/)).toBeInTheDocument()
    expect(screen.getByText(/交通 30%/)).toBeInTheDocument()
    expect(screen.getByText(/娛樂 20%/)).toBeInTheDocument()
  })

  it('displays total spent in center', () => {
    const data: DistributionItem[] = [
      { category: 'food', amount: 12580, percentage: 100 },
    ]
    render(<DistributionChart data={data} totalSpent={12580} />)
    expect(screen.getByText('$12,580')).toBeInTheDocument()
  })

  it('handles custom category names', () => {
    const data: DistributionItem[] = [
      { category: 'pet', amount: 1000, percentage: 100 },
    ]
    render(<DistributionChart data={data} totalSpent={1000} />)
    // Custom category should show the raw name
    expect(screen.getByText(/pet 100%/)).toBeInTheDocument()
  })
})
