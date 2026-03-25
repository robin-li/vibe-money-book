import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../lib/api'
import type { Transaction } from '../stores/index'
import TransactionDetailInline from './TransactionDetailInline'

interface CategoryTransactionListProps {
  category: string
  startDate: string
  endDate: string
  type: 'expense' | 'income'
}

function CategoryTransactionList({
  category,
  startDate,
  endDate,
  type,
}: CategoryTransactionListProps) {
  const { t } = useTranslation('stats')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/transactions', {
        params: {
          category,
          start_date: startDate,
          end_date: endDate,
          type,
          sort: 'desc',
          limit: 50,
        },
      })
      const items: Transaction[] = (res.data.data.items ?? []).map(
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
      setTransactions(items)
    } catch {
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [category, startDate, endDate, type])

  useEffect(() => {
    void fetchTransactions()
  }, [fetchTransactions])

  const handleToggleTx = useCallback((txId: string) => {
    setExpandedTxId((prev) => (prev === txId ? null : txId))
  }, [])

  if (loading) {
    return (
      <div className="py-md px-lg" data-testid="category-tx-loading">
        <div className="animate-pulse space-y-sm">
          <div className="h-3 bg-border rounded w-3/4" />
          <div className="h-3 bg-border rounded w-1/2" />
          <div className="h-3 bg-border rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="py-md px-lg" data-testid="category-tx-empty">
        <p className="text-caption text-text-tertiary text-center">
          {t('noTransactionsInCategory')}
        </p>
      </div>
    )
  }

  return (
    <div className="py-xs" data-testid="category-tx-list">
      {transactions.map((tx) => (
        <TransactionDetailInline
          key={tx.id}
          transaction={tx}
          isExpanded={expandedTxId === tx.id}
          onToggle={() => handleToggleTx(tx.id)}
        />
      ))}
    </div>
  )
}

export default CategoryTransactionList
