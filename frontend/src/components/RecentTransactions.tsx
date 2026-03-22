import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocaleFormatter } from '../hooks/useLocaleFormatter'
import type { Transaction } from '../stores/index'
import { useDashboardStore } from '../stores/dashboardStore'
import { getCategoryName, getCategoryTypeColorClass } from '../lib/categoryUtils'

interface RecentTransactionsProps {
  transactions: Transaction[]
  categories?: string[]
}

const categoryIcons: Record<string, string> = {
  food: '🍽️',
  transport: '🚌',
  entertainment: '🎬',
  daily: '🧴',
  medical: '🏥',
  education: '📚',
  pets: '🐾',
  other: '📦',
  salary: '💰',
  investment: '📈',
  pension: '🏦',
  insurance: '🛡️',
  other_income: '💵',
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '--'
  return dateStr.split('T')[0]
}

function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { t } = useTranslation()
  const { formatCurrency, formatDate: fmtDate } = useLocaleFormatter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ type: 'expense' as 'income' | 'expense', amount: '', category: '', merchant: '', date: '', note: '' })

  const updateTransaction = useDashboardStore((s) => s.updateTransaction)
  const deleteTransaction = useDashboardStore((s) => s.deleteTransaction)
  const fetchBudgetSummary = useDashboardStore((s) => s.fetchBudgetSummary)
  const categoryInfoList = useDashboardStore((s) => s.categoryInfoList)

  const expenseCategoryList = useMemo(
    () => categoryInfoList.filter((c) => c.type === 'expense').map((c) => c.category),
    [categoryInfoList]
  )
  const incomeCategoryList = useMemo(
    () => categoryInfoList.filter((c) => c.type === 'income').map((c) => c.category),
    [categoryInfoList]
  )

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
    setEditingId(null)
    setDeleteConfirmId(null)
  }, [])

  const handleStartEdit = useCallback((tx: Transaction) => {
    setEditingId(tx.id)
    setEditForm({
      type: (tx.type ?? 'expense') as 'income' | 'expense',
      amount: tx.amount.toString(),
      category: tx.category,
      merchant: tx.merchant || '',
      date: formatDate(tx.transactionDate),
      note: tx.note || '',
    })
  }, [])

  const handleEditTypeChange = useCallback((newType: 'income' | 'expense') => {
    setEditForm((prev) => {
      const categoryList = newType === 'income' ? incomeCategoryList : expenseCategoryList
      const categoryStillValid = categoryList.includes(prev.category)
      return {
        ...prev,
        type: newType,
        category: categoryStillValid ? prev.category : categoryList[0],
      }
    })
  }, [incomeCategoryList, expenseCategoryList])

  const handleSaveEdit = useCallback(async (id: string) => {
    const parsedAmount = parseFloat(editForm.amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) return
    try {
      await updateTransaction(id, {
        type: editForm.type,
        amount: parsedAmount,
        category: editForm.category,
        merchant: editForm.merchant,
        date: editForm.date,
        note: editForm.note || undefined,
      })
      fetchBudgetSummary()
      setEditingId(null)
    } catch {
      // Error handled by store
    }
  }, [editForm, updateTransaction, fetchBudgetSummary])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteTransaction(id)
      fetchBudgetSummary()
      setExpandedId(null)
      setDeleteConfirmId(null)
    } catch {
      // Error handled by store
    }
  }, [deleteTransaction, fetchBudgetSummary])

  const formatTime = useCallback((dateStr: string) => {
    const date = new Date(dateStr)
    return fmtDate(date, { hour: '2-digit', minute: '2-digit' })
  }, [fmtDate])

  return (
    <section className="px-2xl" aria-label={t('dashboard:recentTransactions')}>
      <h2 className="text-title font-semibold text-text-primary mb-md">
        🕐 {t('dashboard:recentTransactions')}
      </h2>

      {transactions.length === 0 ? (
        <p className="text-body text-text-tertiary text-center py-3xl">
          {t('dashboard:noTransactions')}
        </p>
      ) : (
        <div>
          {transactions.map((tx) => {
            const isExpanded = expandedId === tx.id
            const isEditing = editingId === tx.id
            const isDeleting = deleteConfirmId === tx.id

            return (
              <div key={tx.id} className="border-b border-border last:border-b-0">
                {/* Summary row */}
                <button
                  type="button"
                  onClick={() => handleToggle(tx.id)}
                  className="w-full flex items-center gap-md py-md hover:bg-bg transition-colors"
                >
                  <div className={`w-10 h-10 rounded-md ${tx.type === 'income' ? 'bg-success-light' : 'bg-danger-light'} flex items-center justify-center text-lg shrink-0`}>
                    {categoryIcons[tx.category] ?? '📦'}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-body font-semibold text-text-primary truncate">
                      {tx.merchant || getCategoryName(tx.category)}
                    </p>
                    <div className="flex items-center gap-xs">
                      <span className={`text-small ${getCategoryTypeColorClass(tx.type ?? 'expense')} bg-[#F0F0F0] rounded-sm px-2 py-0.5`}>
                        {getCategoryName(tx.category)}
                      </span>
                      <span className="text-small text-text-secondary">
                        · {formatTime(tx.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className={`text-title font-semibold shrink-0 ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <span className={`text-text-tertiary text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="pb-md pl-14 pr-md animate-slide-down">
                    {isDeleting ? (
                      <div className="bg-danger-light rounded-md p-lg text-center">
                        <p className="text-body text-danger font-semibold mb-md">
                          {t('dashboard:deleteConfirm')}
                        </p>
                        <p className="text-caption text-text-secondary mb-lg">
                          {tx.merchant} {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <div className="flex gap-sm">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="flex-1 h-9 rounded-sm border border-border text-text-secondary text-body"
                          >
                            {t('common:cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(tx.id)}
                            className="flex-1 h-9 rounded-sm bg-danger text-surface font-semibold text-body"
                          >
                            {t('common:confirmDelete')}
                          </button>
                        </div>
                      </div>
                    ) : isEditing ? (
                      <div className="space-y-sm">
                        <div className="flex items-center gap-md">
                          <span className="text-caption text-text-secondary w-[50px] shrink-0">{t('common:type')}</span>
                          <div className="flex gap-sm">
                            <button type="button" onClick={() => handleEditTypeChange('expense')}
                              className={`px-lg py-xs rounded-sm text-small font-semibold ${editForm.type === 'expense' ? 'bg-danger text-surface' : 'border border-border text-text-secondary'}`}>
                              {t('common:expense')}
                            </button>
                            <button type="button" onClick={() => handleEditTypeChange('income')}
                              className={`px-lg py-xs rounded-sm text-small font-semibold ${editForm.type === 'income' ? 'bg-success text-surface' : 'border border-border text-text-secondary'}`}>
                              {t('common:income')}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-md">
                          <span className="text-caption text-text-secondary w-[50px] shrink-0">{t('common:amount')}</span>
                          <input type="number" value={editForm.amount} onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
                            className={`flex-1 h-9 rounded-md border border-border px-sm text-body font-semibold ${editForm.type === 'income' ? 'text-success' : 'text-danger'}`} min="0.01" step="1" />
                        </div>
                        <div className="flex items-center gap-md">
                          <span className="text-caption text-text-secondary w-[50px] shrink-0">{t('common:category')}</span>
                          <select value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                            className={`flex-1 h-9 rounded-md border border-border px-sm text-body ${getCategoryTypeColorClass(editForm.type)}`}>
                            {(editForm.type === 'income' ? incomeCategoryList : expenseCategoryList).map((cat) => (
                              <option key={cat} value={cat}>{categoryIcons[cat] ?? '📦'} {getCategoryName(cat)}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-md">
                          <span className="text-caption text-text-secondary w-[50px] shrink-0">{t('common:merchant')}</span>
                          <input type="text" value={editForm.merchant} onChange={(e) => setEditForm((f) => ({ ...f, merchant: e.target.value }))} className="flex-1 h-9 rounded-md border border-border px-sm text-body" />
                        </div>
                        <div className="flex items-center gap-md">
                          <span className="text-caption text-text-secondary w-[50px] shrink-0">{t('common:date')}</span>
                          <input type="date" value={editForm.date} onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))} className="flex-1 h-9 rounded-md border border-border px-sm text-body" />
                        </div>
                        <div className="flex items-start gap-md">
                          <span className="text-caption text-text-secondary w-[50px] shrink-0 mt-xs">{t('common:note')}</span>
                          <textarea value={editForm.note} onChange={(e) => setEditForm((f) => ({ ...f, note: e.target.value }))} className="flex-1 rounded-md border border-border px-sm py-xs text-body resize-none" placeholder={t('common:note')} rows={2} />
                        </div>
                        <div className="flex gap-sm mt-md">
                          <button type="button" onClick={() => setEditingId(null)} className="flex-1 h-9 rounded-sm border border-border text-text-secondary text-body">{t('common:cancel')}</button>
                          <button type="button" onClick={() => handleSaveEdit(tx.id)} className="flex-1 h-9 rounded-sm bg-primary text-surface font-semibold text-body">{t('common:save')}</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-sm mb-lg">
                          <div className="flex items-center gap-md">
                            <span className="text-caption text-text-secondary w-[50px] shrink-0">{t('common:amount')}</span>
                            <span className={`text-body font-semibold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}</span>
                          </div>
                          <div className="flex items-center gap-md">
                            <span className="text-caption text-text-secondary w-[50px] shrink-0">{t('common:category')}</span>
                            <span className={`text-body ${getCategoryTypeColorClass(tx.type ?? 'expense')}`}>
                              {categoryIcons[tx.category] ?? '📦'} {getCategoryName(tx.category)}
                            </span>
                          </div>
                          <div className="flex items-center gap-md">
                            <span className="text-caption text-text-secondary w-[50px] shrink-0">{t('common:merchant')}</span>
                            <span className="text-body text-text-primary">{tx.merchant || '--'}</span>
                          </div>
                          <div className="flex items-center gap-md">
                            <span className="text-caption text-text-secondary w-[50px] shrink-0">{t('common:date')}</span>
                            <span className="text-body text-text-primary">{formatDate(tx.transactionDate)}</span>
                          </div>
                          {tx.note && (
                            <div className="flex items-start gap-md">
                              <span className="text-caption text-text-secondary w-[50px] shrink-0">{t('common:note')}</span>
                              <span className="text-caption text-text-secondary">{tx.note}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-sm">
                          <button type="button" onClick={() => handleToggle(tx.id)} className="flex-1 h-9 rounded-sm border border-border text-text-secondary text-body">{t('common:confirm')}</button>
                          <button type="button" onClick={() => handleStartEdit(tx)} className="flex-1 h-9 rounded-sm border border-primary text-primary text-body">{t('common:modify')}</button>
                          <button type="button" onClick={() => setDeleteConfirmId(tx.id)} className="flex-1 h-9 rounded-sm border border-danger text-danger text-body">{t('common:delete')}</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default RecentTransactions
