import { useState, useCallback } from 'react'
import type { Transaction } from '../stores/index'
import { useDashboardStore } from '../stores/dashboardStore'

interface RecentTransactionsProps {
  transactions: Transaction[]
  categories?: string[]
}

const categoryIcons: Record<string, string> = {
  food: '🍽️',
  transport: '🚌',
  entertainment: '🎬',
  shopping: '🛍️',
  daily: '🧴',
  medical: '🏥',
  education: '📚',
  other: '📦',
}

const categoryNames: Record<string, string> = {
  food: '飲食',
  transport: '交通',
  entertainment: '娛樂',
  shopping: '購物',
  daily: '日用品',
  medical: '醫療',
  education: '教育',
  other: '其他',
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const period = hours < 12 ? '上午' : '下午'
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${period}${displayHour.toString().padStart(2, '0')}:${minutes}`
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '--'
  // Handle both ISO and YYYY-MM-DD
  return dateStr.split('T')[0]
}

const defaultCategories = ['food', 'transport', 'entertainment', 'shopping', 'daily', 'medical', 'education', 'other']

function RecentTransactions({ transactions, categories = defaultCategories }: RecentTransactionsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ amount: '', category: '', merchant: '', date: '', note: '' })

  const updateTransaction = useDashboardStore((s) => s.updateTransaction)
  const deleteTransaction = useDashboardStore((s) => s.deleteTransaction)
  const fetchBudgetSummary = useDashboardStore((s) => s.fetchBudgetSummary)

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
    setEditingId(null)
    setDeleteConfirmId(null)
  }, [])

  const handleStartEdit = useCallback((tx: Transaction) => {
    setEditingId(tx.id)
    setEditForm({
      amount: tx.amount.toString(),
      category: tx.category,
      merchant: tx.merchant || '',
      date: formatDate(tx.transactionDate),
      note: tx.note || '',
    })
  }, [])

  const handleSaveEdit = useCallback(async (id: string) => {
    const parsedAmount = parseFloat(editForm.amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) return
    try {
      await updateTransaction(id, {
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

  return (
    <section className="px-2xl" aria-label="最近帳目">
      <h2 className="text-title font-semibold text-text-primary mb-md">
        🕐 最近帳目
      </h2>

      {transactions.length === 0 ? (
        <p className="text-body text-text-tertiary text-center py-3xl">
          還沒有記帳紀錄，開始記帳吧！
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
                  <div className="w-10 h-10 rounded-md bg-danger-light flex items-center justify-center text-lg shrink-0">
                    {categoryIcons[tx.category] ?? '📦'}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-body font-semibold text-text-primary truncate">
                      {tx.merchant || tx.category}
                    </p>
                    <div className="flex items-center gap-xs">
                      <span className="text-small text-text-secondary bg-[#F0F0F0] rounded-sm px-2 py-0.5">
                        {categoryNames[tx.category] ?? tx.category}
                      </span>
                      <span className="text-small text-text-secondary">
                        · {formatTime(tx.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-title font-semibold text-danger shrink-0">
                    -${tx.amount.toLocaleString()}
                  </p>
                  <span className={`text-text-tertiary text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="pb-md pl-14 pr-md animate-slide-down">
                    {isDeleting ? (
                      /* Delete confirmation */
                      <div className="bg-danger-light rounded-md p-lg text-center">
                        <p className="text-body text-danger font-semibold mb-md">
                          確定要刪除這筆帳目嗎？
                        </p>
                        <p className="text-caption text-text-secondary mb-lg">
                          {tx.merchant} -${tx.amount.toLocaleString()}
                        </p>
                        <div className="flex gap-sm">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="flex-1 h-9 rounded-sm border border-border text-text-secondary text-body"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(tx.id)}
                            className="flex-1 h-9 rounded-sm bg-danger text-surface font-semibold text-body"
                          >
                            確認刪除
                          </button>
                        </div>
                      </div>
                    ) : isEditing ? (
                      /* Edit mode */
                      <div className="space-y-sm">
                        <div className="flex items-center gap-md">
                          <span className="text-caption text-text-secondary w-[50px] shrink-0">金額</span>
                          <input
                            type="number"
                            value={editForm.amount}
                            onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
                            className="flex-1 h-9 rounded-md border border-border px-sm text-body text-danger font-semibold"
                            min="0.01"
                            step="1"
                          />
                        </div>
                        <div className="flex items-center gap-md">
                          <span className="text-caption text-text-secondary w-[50px] shrink-0">類別</span>
                          <select
                            value={editForm.category}
                            onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                            className="flex-1 h-9 rounded-md border border-border px-sm text-body"
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {categoryIcons[cat] ?? '📦'} {categoryNames[cat] ?? cat}
                              </option>
                            ))}
                            {/* 若目前類別不在列表中，也顯示 */}
                            {!categories.includes(editForm.category) && (
                              <option value={editForm.category}>
                                📦 {editForm.category}
                              </option>
                            )}
                          </select>
                        </div>
                        <div className="flex items-center gap-md">
                          <span className="text-caption text-text-secondary w-[50px] shrink-0">商家</span>
                          <input
                            type="text"
                            value={editForm.merchant}
                            onChange={(e) => setEditForm((f) => ({ ...f, merchant: e.target.value }))}
                            className="flex-1 h-9 rounded-md border border-border px-sm text-body"
                          />
                        </div>
                        <div className="flex items-center gap-md">
                          <span className="text-caption text-text-secondary w-[50px] shrink-0">日期</span>
                          <input
                            type="date"
                            value={editForm.date}
                            onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
                            className="flex-1 h-9 rounded-md border border-border px-sm text-body"
                          />
                        </div>
                        <div className="flex items-center gap-md">
                          <span className="text-caption text-text-secondary w-[50px] shrink-0">備註</span>
                          <input
                            type="text"
                            value={editForm.note}
                            onChange={(e) => setEditForm((f) => ({ ...f, note: e.target.value }))}
                            className="flex-1 h-9 rounded-md border border-border px-sm text-body"
                          />
                        </div>
                        <div className="flex gap-sm mt-md">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="flex-1 h-9 rounded-sm border border-border text-text-secondary text-body"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(tx.id)}
                            className="flex-1 h-9 rounded-sm bg-primary text-surface font-semibold text-body"
                          >
                            儲存
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View mode */
                      <>
                        <div className="space-y-sm mb-lg">
                          <div className="flex items-center gap-md">
                            <span className="text-caption text-text-secondary w-[50px] shrink-0">金額</span>
                            <span className="text-body text-danger font-semibold">${tx.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-md">
                            <span className="text-caption text-text-secondary w-[50px] shrink-0">類別</span>
                            <span className="text-body text-text-primary">
                              {categoryIcons[tx.category] ?? '📦'} {categoryNames[tx.category] ?? tx.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-md">
                            <span className="text-caption text-text-secondary w-[50px] shrink-0">商家</span>
                            <span className="text-body text-text-primary">{tx.merchant || '--'}</span>
                          </div>
                          <div className="flex items-center gap-md">
                            <span className="text-caption text-text-secondary w-[50px] shrink-0">日期</span>
                            <span className="text-body text-text-primary">{formatDate(tx.transactionDate)}</span>
                          </div>
                          {tx.note && (
                            <div className="flex items-start gap-md">
                              <span className="text-caption text-text-secondary w-[50px] shrink-0">備註</span>
                              <span className="text-caption text-text-secondary">{tx.note}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-sm">
                          <button
                            type="button"
                            onClick={() => handleToggle(tx.id)}
                            className="flex-1 h-9 rounded-sm border border-border text-text-secondary text-body"
                          >
                            確認
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(tx)}
                            className="flex-1 h-9 rounded-sm border border-primary text-primary text-body"
                          >
                            修改
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(tx.id)}
                            className="flex-1 h-9 rounded-sm border border-danger text-danger text-body"
                          >
                            刪除
                          </button>
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
