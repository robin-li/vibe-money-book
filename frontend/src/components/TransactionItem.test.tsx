import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TransactionItem from './TransactionItem'
import type { Transaction } from '../stores/index'

// @vitest-environment jsdom

const baseTransaction: Transaction = {
  id: 'tx-1',
  amount: 500,
  category: 'food',
  merchant: '午餐店',
  rawText: '午餐 500',
  transactionDate: '2026-03-20T12:00:00Z',
  createdAt: '2026-03-20T12:00:00Z',
}

describe('TransactionItem', () => {
  it('should show expense amount in red with minus sign in summary row', () => {
    const tx: Transaction = { ...baseTransaction, type: 'expense' }
    render(
      <TransactionItem
        transaction={tx}
        isExpanded={false}
        onToggle={() => {}}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
        isDeleting={false}
        isUpdating={false}
      />
    )
    const amountEl = screen.getByText(/-\$500/)
    expect(amountEl.className).toContain('text-danger')
  })

  it('should show income amount in green with plus sign in summary row', () => {
    const tx: Transaction = { ...baseTransaction, type: 'income' }
    render(
      <TransactionItem
        transaction={tx}
        isExpanded={false}
        onToggle={() => {}}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
        isDeleting={false}
        isUpdating={false}
      />
    )
    const amountEl = screen.getByText(/\+\$500/)
    expect(amountEl.className).toContain('text-success')
  })

  it('should show expense amount in red in expanded detail', () => {
    const tx: Transaction = { ...baseTransaction, type: 'expense' }
    render(
      <TransactionItem
        transaction={tx}
        isExpanded={true}
        onToggle={() => {}}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
        isDeleting={false}
        isUpdating={false}
      />
    )
    // There are two: summary row and detail. Check that the detail one has the correct color.
    const allAmounts = screen.getAllByText(/-\$500/)
    expect(allAmounts.length).toBeGreaterThanOrEqual(2)
    for (const el of allAmounts) {
      expect(el.className).toContain('text-danger')
    }
  })

  it('should show income amount in green in expanded detail', () => {
    const tx: Transaction = { ...baseTransaction, type: 'income' }
    render(
      <TransactionItem
        transaction={tx}
        isExpanded={true}
        onToggle={() => {}}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
        isDeleting={false}
        isUpdating={false}
      />
    )
    const allAmounts = screen.getAllByText(/\+\$500/)
    expect(allAmounts.length).toBeGreaterThanOrEqual(2)
    for (const el of allAmounts) {
      expect(el.className).toContain('text-success')
    }
  })
})
