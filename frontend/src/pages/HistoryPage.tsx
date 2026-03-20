import { useEffect, useState, useCallback, useMemo } from 'react'
import { useHistoryStore } from '../stores/historyStore'
import { useDashboardStore } from '../stores/dashboardStore'
import TransactionItem from '../components/TransactionItem'
import type { Transaction } from '../stores/index'
import { getCategoryName } from '../lib/categoryUtils'

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍽️', transport: '🚌', entertainment: '🎬',
  daily: '🧴', medical: '🏥', education: '📚', other: '📦',
  salary: '💰', investment: '📈', pension: '🏦', insurance: '🛡️', other_income: '💵',
}

function formatGroupDate(dateStr: string): string {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const d = dateStr.split('T')[0]
  if (d === todayStr) return `${d}（今天）`
  if (d === yesterdayStr) return `${d}（昨天）`
  return d
}

function groupByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>()
  for (const tx of transactions) {
    const dateKey = tx.transactionDate.split('T')[0]
    const existing = groups.get(dateKey)
    if (existing) {
      existing.push(tx)
    } else {
      groups.set(dateKey, [tx])
    }
  }
  return groups
}

function HistoryPage() {
  const {
    transactions,
    filters,
    hasMore,
    isLoading,
    isDeleting,
    isUpdating,
    errorMessage,
    fetchTransactions,
    loadMore,
    setFilters,
    resetFilters,
    deleteTransaction,
    updateTransaction,
  } = useHistoryStore()

  const storeCategories = useDashboardStore((s) => s.categories)
  const fetchCategories = useDashboardStore((s) => s.fetchCategories)

  const categoryOptions = useMemo(() => {
    const opts = [{ value: '', label: '全部類別' }]
    for (const cat of storeCategories) {
      const icon = CATEGORY_ICONS[cat] ?? '📦'
      opts.push({ value: cat, label: `${icon} ${getCategoryName(cat)}` })
    }
    return opts
  }, [storeCategories])

  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
    fetchTransactions(true)
  }, [fetchCategories, fetchTransactions])

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters({ category: e.target.value })
      // Trigger re-fetch after state update
      setTimeout(() => useHistoryStore.getState().fetchTransactions(true), 0)
    },
    [setFilters]
  )

  const handleStartDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters({ startDate: e.target.value })
      setTimeout(() => useHistoryStore.getState().fetchTransactions(true), 0)
    },
    [setFilters]
  )

  const handleEndDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters({ endDate: e.target.value })
      setTimeout(() => useHistoryStore.getState().fetchTransactions(true), 0)
    },
    [setFilters]
  )

  const handleResetFilters = useCallback(() => {
    resetFilters()
    setTimeout(() => useHistoryStore.getState().fetchTransactions(true), 0)
  }, [resetFilters])

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTransaction(id)
      setExpandedId(null)
    },
    [deleteTransaction]
  )

  const handleUpdate = useCallback(
    async (id: string, input: Parameters<typeof updateTransaction>[1]) => {
      await updateTransaction(id, input)
    },
    [updateTransaction]
  )

  const grouped = useMemo(() => groupByDate(transactions), [transactions])

  const hasActiveFilters = filters.category || filters.startDate || filters.endDate

  return (
    <div className="p-2xl pb-32">
      <header className="h-14 flex items-center justify-between mb-lg">
        <h1 className="text-title font-semibold text-text-primary">
          📋 記錄
        </h1>
      </header>

      {/* Filter section */}
      <div className="space-y-sm mb-xl" data-testid="filter-section">
        <div className="flex gap-sm items-center flex-wrap">
          <select
            value={filters.category}
            onChange={handleCategoryChange}
            className="px-lg py-sm bg-bg rounded-xl text-caption text-text-secondary border-0 outline-none cursor-pointer"
            aria-label="類別篩選"
            data-testid="category-filter"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={handleStartDateChange}
            className="px-lg py-sm bg-bg rounded-xl text-caption text-text-secondary border-0 outline-none"
            aria-label="開始日期"
            data-testid="start-date-filter"
          />
          <span className="text-text-tertiary text-caption">至</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={handleEndDateChange}
            className="px-lg py-sm bg-bg rounded-xl text-caption text-text-secondary border-0 outline-none"
            aria-label="結束日期"
            data-testid="end-date-filter"
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-lg py-sm bg-danger-light rounded-xl text-caption text-danger"
              data-testid="reset-filters-btn"
            >
              清除篩選
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mb-lg p-md bg-danger-light rounded-md text-danger text-body text-center" data-testid="error-message">
          {errorMessage}
        </div>
      )}

      {/* Transaction list */}
      {transactions.length === 0 && !isLoading ? (
        <div className="text-center py-3xl" data-testid="empty-state">
          <p className="text-body text-text-tertiary">
            還沒有記帳紀錄，開始記帳吧！
          </p>
        </div>
      ) : (
        <div data-testid="transaction-list">
          {Array.from(grouped.entries()).map(([dateKey, txList]) => (
            <div key={dateKey} className="mb-lg">
              <div className="sticky top-0 bg-bg py-sm px-2xl -mx-2xl text-caption text-text-secondary z-10">
                {formatGroupDate(dateKey)}
              </div>
              <div className="bg-surface rounded-lg shadow-card">
                {txList.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    isExpanded={expandedId === tx.id}
                    onToggle={() => handleToggle(tx.id)}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    isDeleting={isDeleting === tx.id}
                    isUpdating={isUpdating === tx.id}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="text-center py-lg">
              <button
                type="button"
                onClick={loadMore}
                disabled={isLoading}
                className="px-xl py-sm bg-primary text-surface rounded-lg text-body font-semibold disabled:opacity-50"
                data-testid="load-more-btn"
              >
                {isLoading ? '載入中...' : '載入更多'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading indicator for initial load */}
      {isLoading && transactions.length === 0 && (
        <div className="text-center py-3xl" data-testid="loading-state">
          <p className="text-body text-text-secondary">載入中...</p>
        </div>
      )}
    </div>
  )
}

export default HistoryPage
