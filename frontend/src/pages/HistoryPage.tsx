import { useEffect, useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  const formatGroupDate = useCallback((dateStr: string): string => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const d = dateStr.split('T')[0]
    if (d === todayStr) return `${d}（${t('common:today')}）`
    if (d === yesterdayStr) return `${d}（${t('common:yesterday')}）`
    return d
  }, [t])

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
  const fetchAIConfig = useSettingsStore((s) => s.fetchAIConfig)

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
    fetchAIConfig()
    fetchTransactions(true)
  }, [fetchCategories, fetchAIConfig, fetchTransactions])

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

  const handleResetFilters = useCallback(() => {
    clearAllFilters()
  }, [clearAllFilters])

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
          📋 {t('history:title')}
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
              aria-label={t('history:filter.startDate')}
              data-testid="start-date-filter"
            />
            {!filters.startDate && (
              <span className="absolute inset-0 flex items-center px-lg text-caption text-text-tertiary pointer-events-none">{t('history:filter.startDate')}</span>
            )}
          </div>
          <span className="text-text-tertiary text-caption">{t('common:to')}</span>
          <div className="relative">
            <input
              type="date"
              value={filters.endDate}
              onChange={handleEndDateChange}
              className={`px-lg py-sm bg-bg rounded-xl text-caption border-0 outline-none ${filters.endDate ? 'text-text-secondary' : 'text-transparent'}`}
              aria-label={t('history:filter.endDate')}
              data-testid="end-date-filter"
            />
            {!filters.endDate && (
              <span className="absolute inset-0 flex items-center px-lg text-caption text-text-tertiary pointer-events-none">{t('history:filter.endDate')}</span>
            )}
          </div>

          <select
            value={filters.category}
            onChange={handleCategoryChange}
            className="px-lg py-sm bg-bg rounded-xl text-caption text-text-secondary border-0 outline-none cursor-pointer"
            aria-label={t('history:filter.categoryFilter')}
            data-testid="category-filter"
          >
            <option value="">{t('common:allCategories')}</option>
            {expenseCategories.length > 0 && (
              <optgroup label={t('common:expense')}>
                {expenseCategories.map((c) => (
                  <option key={c.category} value={c.category}>
                    {(CATEGORY_ICONS[c.category] ?? '📦') + ' ' + getCategoryName(c.category)}
                  </option>
                ))}
              </optgroup>
            )}
            {incomeCategories.length > 0 && (
              <optgroup label={t('common:income')}>
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
              {t('common:clearFilters')}
            </button>
          )}
        </div>
      </div>

      {/* AI Query Feedback Card */}
      {aiQueryResult && (
        <div data-testid="ai-query-feedback">
          <AIFeedbackCard
            feedbackText={aiQueryResult.summary.text}
            persona={persona}
            aiEngine={aiEngine}
          />
          <div className="mx-2xl mb-lg text-small text-text-tertiary">
            {t('history:aiQuery.matchCount', { count: aiQueryResult.summary.match_count, total: aiQueryResult.summary.total_amount.toLocaleString() })}
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
          <p className="text-body text-text-secondary">{t('history:aiQuery.analyzing')}</p>
        </div>
      )}

      {/* Transaction list */}
      {!isQuerying && transactions.length === 0 && !isLoading ? (
        <div className="text-center py-3xl" data-testid="empty-state">
          <p className="text-body text-text-tertiary">
            {aiQueryResult ? t('history:aiQuery.noResults') : t('history:empty')}
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

          {hasMore && !aiQueryResult && (
            <div className="text-center py-lg">
              <button
                type="button"
                onClick={loadMore}
                disabled={isLoading}
                className="px-xl py-sm bg-primary text-surface rounded-lg text-body font-semibold disabled:opacity-50"
                data-testid="load-more-btn"
              >
                {isLoading ? t('common:loading') : t('common:loadMore')}
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Loading indicator for initial load */}
      {isLoading && transactions.length === 0 && !isQuerying && (
        <div className="text-center py-3xl" data-testid="loading-state">
          <p className="text-body text-text-secondary">{t('common:loading')}</p>
        </div>
      )}

      {/* AI Query Voice Input */}
      <VoiceInput
        onSubmit={handleAIQuery}
        disabled={isQuerying}
        placeholder={t('history:aiQuery.placeholder')}
      />
    </div>
  )
}

export default HistoryPage
