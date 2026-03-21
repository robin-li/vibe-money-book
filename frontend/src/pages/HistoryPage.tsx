import { useEffect, useState, useCallback, useMemo } from 'react'
import { useHistoryStore } from '../stores/historyStore'
import { useDashboardStore } from '../stores/dashboardStore'
import { useSettingsStore } from '../stores/settingsStore'
import TransactionItem from '../components/TransactionItem'
import AIFeedbackCard from '../components/AIFeedbackCard'
import VoiceInput from '../components/VoiceInput'
import type { Transaction } from '../stores/index'
import { getCategoryName } from '../lib/categoryUtils'

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍽️', transport: '🚌', entertainment: '🎬',
  daily: '🧴', medical: '🏥', education: '📚', pets: '🐾', other: '📦',
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
    aiQueryResult,
    isQuerying,
    fetchTransactions,
    loadMore,
    setFilters,
    deleteTransaction,
    updateTransaction,
    queryTransactions,
    clearAIQuery,
    clearAllFilters,
  } = useHistoryStore()

  const categoryInfoList = useDashboardStore((s) => s.categoryInfoList)
  const fetchCategories = useDashboardStore((s) => s.fetchCategories)
  const persona = useSettingsStore((s) => s.persona)
  const aiEngine = useSettingsStore((s) => s.aiEngine)

  const expenseCategories = useMemo(
    () => categoryInfoList.filter((c) => c.type === 'expense'),
    [categoryInfoList]
  )
  const incomeCategories = useMemo(
    () => categoryInfoList.filter((c) => c.type === 'income'),
    [categoryInfoList]
  )

  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
    fetchTransactions(true)
  }, [fetchCategories, fetchTransactions])

  // 手動篩選器變更 → 清除 AI 查詢（互斥）
  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      clearAIQuery()
      setFilters({ category: e.target.value })
      setTimeout(() => useHistoryStore.getState().fetchTransactions(true), 0)
    },
    [setFilters, clearAIQuery]
  )

  const handleStartDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      clearAIQuery()
      setFilters({ startDate: e.target.value })
      setTimeout(() => useHistoryStore.getState().fetchTransactions(true), 0)
    },
    [setFilters, clearAIQuery]
  )

  const handleEndDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      clearAIQuery()
      setFilters({ endDate: e.target.value })
      setTimeout(() => useHistoryStore.getState().fetchTransactions(true), 0)
    },
    [setFilters, clearAIQuery]
  )

  // 清除所有篩選（手動 + AI 查詢）
  const handleResetFilters = useCallback(() => {
    clearAllFilters()
  }, [clearAllFilters])

  // AI 語義查詢
  const handleAIQuery = useCallback(
    (text: string) => {
      queryTransactions(text)
    },
    [queryTransactions]
  )

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

  const hasActiveFilters = filters.category || filters.startDate || filters.endDate || aiQueryResult

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
          <div className="relative">
            <input
              type="date"
              value={filters.startDate}
              onChange={handleStartDateChange}
              className={`px-lg py-sm bg-bg rounded-xl text-caption border-0 outline-none ${filters.startDate ? 'text-text-secondary' : 'text-transparent'}`}
              aria-label="開始日期"
              data-testid="start-date-filter"
            />
            {!filters.startDate && (
              <span className="absolute inset-0 flex items-center px-lg text-caption text-text-tertiary pointer-events-none">開始日期</span>
            )}
          </div>
          <span className="text-text-tertiary text-caption">至</span>
          <div className="relative">
            <input
              type="date"
              value={filters.endDate}
              onChange={handleEndDateChange}
              className={`px-lg py-sm bg-bg rounded-xl text-caption border-0 outline-none ${filters.endDate ? 'text-text-secondary' : 'text-transparent'}`}
              aria-label="結束日期"
              data-testid="end-date-filter"
            />
            {!filters.endDate && (
              <span className="absolute inset-0 flex items-center px-lg text-caption text-text-tertiary pointer-events-none">結束日期</span>
            )}
          </div>

          <select
            value={filters.category}
            onChange={handleCategoryChange}
            className="px-lg py-sm bg-bg rounded-xl text-caption text-text-secondary border-0 outline-none cursor-pointer"
            aria-label="類別篩選"
            data-testid="category-filter"
          >
            <option value="">全部類別</option>
            {expenseCategories.length > 0 && (
              <optgroup label="支出">
                {expenseCategories.map((c) => (
                  <option key={c.category} value={c.category}>
                    {(CATEGORY_ICONS[c.category] ?? '📦') + ' ' + getCategoryName(c.category)}
                  </option>
                ))}
              </optgroup>
            )}
            {incomeCategories.length > 0 && (
              <optgroup label="收入">
                {incomeCategories.map((c) => (
                  <option key={c.category} value={c.category}>
                    {(CATEGORY_ICONS[c.category] ?? '📦') + ' ' + getCategoryName(c.category)}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

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

      {/* AI Query Feedback Card — only shown when there's a query result */}
      {aiQueryResult && (
        <div data-testid="ai-query-feedback">
          <AIFeedbackCard
            feedbackText={aiQueryResult.summary.text}
            persona={persona}
            aiEngine={aiEngine}
          />
          <div className="mx-2xl mb-lg text-small text-text-tertiary">
            共 {aiQueryResult.summary.match_count} 筆匹配，合計 ${aiQueryResult.summary.total_amount.toLocaleString()}
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="mb-lg p-md bg-danger-light rounded-md text-danger text-body text-center" data-testid="error-message">
          {errorMessage}
        </div>
      )}

      {/* Querying indicator */}
      {isQuerying && (
        <div className="text-center py-3xl" data-testid="querying-state">
          <p className="text-body text-text-secondary">AI 正在分析您的查詢...</p>
        </div>
      )}

      {/* Transaction list */}
      {!isQuerying && transactions.length === 0 && !isLoading ? (
        <div className="text-center py-3xl" data-testid="empty-state">
          <p className="text-body text-text-tertiary">
            {aiQueryResult ? '找不到符合條件的記錄' : '還沒有記帳紀錄，開始記帳吧！'}
          </p>
        </div>
      ) : !isQuerying ? (
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
                    categoryInfoList={categoryInfoList}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Load more — hidden during AI query mode */}
          {hasMore && !aiQueryResult && (
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
      ) : null}

      {/* Loading indicator for initial load */}
      {isLoading && transactions.length === 0 && !isQuerying && (
        <div className="text-center py-3xl" data-testid="loading-state">
          <p className="text-body text-text-secondary">載入中...</p>
        </div>
      )}

      {/* AI Query Voice Input — fixed at bottom */}
      <VoiceInput
        onSubmit={handleAIQuery}
        disabled={isQuerying}
        placeholder="問問 AI 教練..."
      />
    </div>
  )
}

export default HistoryPage
