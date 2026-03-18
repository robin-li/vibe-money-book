import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BudgetCard from '../components/BudgetCard'
import AIFeedbackCard from '../components/AIFeedbackCard'
import RecentTransactions from '../components/RecentTransactions'
import ParsedResultCard from '../components/ParsedResultCard'
import NewCategoryDialog from '../components/NewCategoryDialog'
import type { BudgetSummary } from '../stores/dashboardStore'
import type { Transaction } from '../stores/index'

describe('BudgetCard', () => {
  it('shows placeholder when summary is null', () => {
    render(<BudgetCard summary={null} />)
    expect(screen.getByText('--')).toBeInTheDocument()
    expect(screen.getByText('尚未設定預算')).toBeInTheDocument()
  })

  it('shows budget info when summary is provided', () => {
    const summary: BudgetSummary = {
      month: '2026-03',
      monthlyBudget: 20000,
      totalSpent: 5000,
      remaining: 15000,
      usedRatio: 0.25,
      transactionCount: 10,
    }
    render(<BudgetCard summary={summary} />)
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('$5,000')).toBeInTheDocument()
    expect(screen.getByText('目標：$20,000')).toBeInTheDocument()
  })

  it('shows danger styling when budget is low', () => {
    const summary: BudgetSummary = {
      month: '2026-03',
      monthlyBudget: 20000,
      totalSpent: 18000,
      remaining: 2000,
      usedRatio: 0.9,
      transactionCount: 30,
    }
    render(<BudgetCard summary={summary} />)
    expect(screen.getByText('10%')).toBeInTheDocument()
  })

  it('shows overbudget state', () => {
    const summary: BudgetSummary = {
      month: '2026-03',
      monthlyBudget: 20000,
      totalSpent: 22000,
      remaining: -2000,
      usedRatio: 1.1,
      transactionCount: 40,
    }
    render(<BudgetCard summary={summary} />)
    expect(screen.getByText('超支')).toBeInTheDocument()
  })
})

describe('AIFeedbackCard', () => {
  it('renders gentle persona feedback', () => {
    render(
      <AIFeedbackCard
        feedbackText="享受美味是很重要的"
        persona="gentle"
      />
    )
    expect(screen.getByText('溫柔管家 💖 的即時回饋')).toBeInTheDocument()
    expect(screen.getByText('「享受美味是很重要的」')).toBeInTheDocument()
  })

  it('renders sarcastic persona feedback', () => {
    render(
      <AIFeedbackCard
        feedbackText="又亂花錢了"
        persona="sarcastic"
      />
    )
    expect(screen.getByText('毒舌教練 🔥 的即時回饋')).toBeInTheDocument()
  })

  it('renders guilt_trip persona feedback', () => {
    render(
      <AIFeedbackCard
        feedbackText="我好擔心你"
        persona="guilt_trip"
      />
    )
    expect(screen.getByText('心疼天使 🥺 的即時回饋')).toBeInTheDocument()
  })
})

describe('RecentTransactions', () => {
  it('shows empty state when no transactions', () => {
    render(<RecentTransactions transactions={[]} />)
    expect(
      screen.getByText('還沒有記帳紀錄，開始記帳吧！')
    ).toBeInTheDocument()
  })

  it('renders transaction items', () => {
    const txs: Transaction[] = [
      {
        id: '1',
        amount: 250,
        category: 'food',
        merchant: '拉麵',
        rawText: '午餐吃拉麵 250',
        transactionDate: '2026-03-18',
        createdAt: '2026-03-18T01:07:00Z',
      },
    ]
    render(<RecentTransactions transactions={txs} />)
    expect(screen.getByText('拉麵')).toBeInTheDocument()
    expect(screen.getByText('-$250')).toBeInTheDocument()
    expect(screen.getByText('飲食')).toBeInTheDocument()
  })
})

describe('ParsedResultCard', () => {
  const defaultResult = {
    amount: 180,
    category: 'food',
    merchant: '拉麵店',
    date: '2026-03-18',
    confidence: 0.95,
    isNewCategory: false,
    suggestedCategory: null,
    note: null,
  }
  const categories = ['food', 'transport', 'entertainment', 'other']

  it('renders parsed result fields', () => {
    render(
      <ParsedResultCard
        result={defaultResult}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        categories={categories}
      />
    )
    expect(screen.getByText('✨ AI 幫你整理好了')).toBeInTheDocument()
    expect(screen.getByText('$180')).toBeInTheDocument()
    expect(screen.getByText('飲食')).toBeInTheDocument()
    expect(screen.getByText('拉麵店')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button clicked', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(
      <ParsedResultCard
        result={defaultResult}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        categories={categories}
      />
    )
    await user.click(screen.getByText('✓ 確認記帳'))
    expect(onConfirm).toHaveBeenCalledWith({
      amount: 180,
      category: 'food',
      merchant: '拉麵店',
      date: '2026-03-18',
    })
  })

  it('enters edit mode when modify button clicked', async () => {
    const user = userEvent.setup()
    render(
      <ParsedResultCard
        result={defaultResult}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        categories={categories}
      />
    )
    await user.click(screen.getByText('修改'))
    expect(screen.getByLabelText('金額')).toBeInTheDocument()
    expect(screen.getByLabelText('類別')).toBeInTheDocument()
    expect(screen.getByLabelText('商家')).toBeInTheDocument()
    expect(screen.getByText('取消')).toBeInTheDocument()
  })
})

describe('NewCategoryDialog', () => {
  const defaultProps = {
    suggestedCategory: '寵物',
    note: null,
    persona: 'gentle' as const,
    existingCategories: ['food', 'transport', 'other'],
    onConfirm: vi.fn(),
    onSelectExisting: vi.fn(),
    onCancel: vi.fn(),
  }

  it('renders category suggestion', () => {
    render(<NewCategoryDialog {...defaultProps} />)
    expect(screen.getAllByText(/寵物/).length).toBeGreaterThan(0)
    expect(screen.getByText('確認')).toBeInTheDocument()
    expect(screen.getByText('修改名稱')).toBeInTheDocument()
    expect(screen.getByText('選現有')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm is clicked', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<NewCategoryDialog {...defaultProps} onConfirm={onConfirm} />)
    await user.click(screen.getByText('確認'))
    expect(onConfirm).toHaveBeenCalledWith('寵物')
  })

  it('shows rename input when modify name clicked', async () => {
    const user = userEvent.setup()
    render(<NewCategoryDialog {...defaultProps} />)
    await user.click(screen.getByText('修改名稱'))
    expect(screen.getByLabelText('類別名稱')).toBeInTheDocument()
  })

  it('shows category selection when select existing clicked', async () => {
    const user = userEvent.setup()
    render(<NewCategoryDialog {...defaultProps} />)
    await user.click(screen.getByText('選現有'))
    expect(screen.getByText('選擇類別')).toBeInTheDocument()
  })
})
