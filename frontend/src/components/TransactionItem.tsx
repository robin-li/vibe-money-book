import { useState, useCallback } from 'react'
import type { Transaction } from '../stores/index'
import { getCategoryName, getCategoryTypeColorClass, CATEGORY_NAMES, INCOME_CATEGORIES } from '../lib/categoryUtils'
import type { UpdateTransactionInput } from '../stores/historyStore'

interface TransactionItemProps {
  transaction: Transaction
  isExpanded: boolean
  onToggle: () => void
  onDelete: (id: string) => Promise<void>
  onUpdate: (id: string, input: UpdateTransactionInput) => Promise<void>
  isDeleting: boolean
  isUpdating: boolean
}

const categoryIcons: Record<string, string> = {
  food: '🍽️',
  transport: '🚌',
  entertainment: '🎬',
  daily: '🧴',
  medical: '🏥',
  education: '📚',
  other: '📦',
  salary: '💰',
  investment: '📈',
  pension: '🏦',
  insurance: '🛡️',
  other_income: '💵',
  adjustment_expense: '🔧',
  adjustment_income: '🔧',
}

const EXPENSE_CATEGORIES = Object.keys(CATEGORY_NAMES).filter((c) => !INCOME_CATEGORIES.has(c))
const INCOME_CATEGORY_LIST = Object.keys(CATEGORY_NAMES).filter((c) => INCOME_CATEGORIES.has(c))

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
  return dateStr.split('T')[0]
}

function TransactionItem({
  transaction: tx,
  isExpanded,
  onToggle,
  onDelete,
  onUpdate,
  isDeleting,
  isUpdating,
}: TransactionItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    type: tx.type ?? 'expense',
    amount: tx.amount,
    category: tx.category,
    merchant: tx.merchant,
    transactionDate: formatDate(tx.transactionDate),
    note: tx.note ?? '',
  })

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true)
  }, [])

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    try {
      await onDelete(tx.id)
      setShowDeleteConfirm(false)
    } catch {
      // Error handled by store
    }
  }, [onDelete, tx.id])

  const handleEditClick = useCallback(() => {
    setEditForm({
      type: tx.type ?? 'expense',
      amount: tx.amount,
      category: tx.category,
      merchant: tx.merchant,
      transactionDate: formatDate(tx.transactionDate),
      note: tx.note ?? '',
    })
    setIsEditing(true)
  }, [tx])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleSaveEdit = useCallback(async () => {
    try {
      const input: UpdateTransactionInput = {
        type: editForm.type as 'income' | 'expense',
        amount: Number(editForm.amount),
        category: editForm.category,
        merchant: editForm.merchant,
        transaction_date: editForm.transactionDate,
        note: editForm.note || undefined,
      }
      await onUpdate(tx.id, input)
      setIsEditing(false)
    } catch {
      // Error handled by store
    }
  }, [onUpdate, tx.id, editForm])

  const handleTypeChange = useCallback((newType: string) => {
    setEditForm((prev) => {
      const categoryList = newType === 'income' ? INCOME_CATEGORY_LIST : EXPENSE_CATEGORIES
      const categoryStillValid = categoryList.includes(prev.category)
      return {
        ...prev,
        type: newType as 'income' | 'expense',
        category: categoryStillValid ? prev.category : categoryList[0],
      }
    })
  }, [])

  const txType = tx.type ?? 'expense'

  return (
    <div className="border-b border-border last:border-b-0" data-testid={`transaction-item-${tx.id}`}>
      {/* Summary row */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-md py-md hover:bg-bg transition-colors"
        aria-expanded={isExpanded}
      >
        <div className={`w-10 h-10 rounded-md ${txType === 'income' ? 'bg-success-light' : 'bg-danger-light'} flex items-center justify-center text-lg shrink-0`}>
          {categoryIcons[tx.category] ?? '📦'}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-body font-semibold text-text-primary truncate">
            {tx.merchant || tx.category}
          </p>
          <div className="flex items-center gap-xs">
            <span className={`text-small ${getCategoryTypeColorClass(txType)} bg-[#F0F0F0] rounded-sm px-2 py-0.5`}>
              {getCategoryName(tx.category)}
            </span>
            <span className="text-small text-text-secondary">
              · {formatTime(tx.createdAt)}
            </span>
          </div>
        </div>
        <p className={`text-title font-semibold shrink-0 ${txType === 'income' ? 'text-success' : 'text-danger'}`}>
          {txType === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
        </p>
        <span className={`text-text-tertiary text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="pb-md pl-14 pr-md animate-slide-down">
          {showDeleteConfirm ? (
            <div className="bg-danger-light rounded-md p-lg text-center" data-testid="delete-confirm-dialog">
              <p className="text-body text-danger font-semibold mb-md">
                確定要刪除這筆帳目嗎？
              </p>
              <p className="text-caption text-text-secondary mb-lg">
                {tx.merchant} {txType === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
              </p>
              <div className="flex gap-sm">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="flex-1 h-9 rounded-sm border border-border text-text-secondary text-body"
                  disabled={isDeleting}
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 h-9 rounded-sm bg-danger text-surface font-semibold text-body"
                  disabled={isDeleting}
                  data-testid="confirm-delete-btn"
                >
                  {isDeleting ? '刪除中...' : '確認刪除'}
                </button>
              </div>
            </div>
          ) : isEditing ? (
            <div data-testid="edit-form">
              <div className="space-y-sm mb-lg">
                <div className="flex items-center gap-md">
                  <span className="text-caption text-text-secondary w-[50px] shrink-0">類型</span>
                  <div className="flex gap-sm">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('expense')}
                      className={`px-lg py-xs rounded-sm text-small font-semibold ${editForm.type === 'expense' ? 'bg-danger text-surface' : 'border border-border text-text-secondary'}`}
                      data-testid="edit-type-expense"
                    >
                      支出
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('income')}
                      className={`px-lg py-xs rounded-sm text-small font-semibold ${editForm.type === 'income' ? 'bg-success text-surface' : 'border border-border text-text-secondary'}`}
                      data-testid="edit-type-income"
                    >
                      收入
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <span className="text-caption text-text-secondary w-[50px] shrink-0">金額</span>
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                    className="flex-1 px-lg py-xs bg-bg rounded-sm text-body border border-border outline-none"
                    min="0"
                    step="1"
                    data-testid="edit-amount"
                  />
                </div>
                <div className="flex items-center gap-md">
                  <span className="text-caption text-text-secondary w-[50px] shrink-0">類別</span>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                    className="flex-1 px-lg py-xs bg-bg rounded-sm text-body border border-border outline-none"
                    data-testid="edit-category"
                  >
                    {(editForm.type === 'income' ? INCOME_CATEGORY_LIST : EXPENSE_CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryIcons[cat] ?? '📦'} {getCategoryName(cat)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-md">
                  <span className="text-caption text-text-secondary w-[50px] shrink-0">商家</span>
                  <input
                    type="text"
                    value={editForm.merchant}
                    onChange={(e) => setEditForm((f) => ({ ...f, merchant: e.target.value }))}
                    className="flex-1 px-lg py-xs bg-bg rounded-sm text-body border border-border outline-none"
                    placeholder="商家名稱"
                    data-testid="edit-merchant"
                  />
                </div>
                <div className="flex items-center gap-md">
                  <span className="text-caption text-text-secondary w-[50px] shrink-0">日期</span>
                  <input
                    type="date"
                    value={editForm.transactionDate}
                    onChange={(e) => setEditForm((f) => ({ ...f, transactionDate: e.target.value }))}
                    className="flex-1 px-lg py-xs bg-bg rounded-sm text-body border border-border outline-none"
                    data-testid="edit-date"
                  />
                </div>
                <div className="flex items-start gap-md">
                  <span className="text-caption text-text-secondary w-[50px] shrink-0 mt-xs">備註</span>
                  <textarea
                    value={editForm.note}
                    onChange={(e) => setEditForm((f) => ({ ...f, note: e.target.value }))}
                    className="flex-1 px-lg py-xs bg-bg rounded-sm text-body border border-border outline-none resize-none"
                    placeholder="備註"
                    rows={2}
                    data-testid="edit-note"
                  />
                </div>
              </div>
              <div className="flex gap-sm">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 h-9 rounded-sm border border-border text-text-secondary text-body"
                  disabled={isUpdating}
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 h-9 rounded-sm bg-primary text-surface font-semibold text-body"
                  disabled={isUpdating}
                  data-testid="save-edit-btn"
                >
                  {isUpdating ? '儲存中...' : '儲存'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-sm mb-lg">
                <div className="flex items-center gap-md">
                  <span className="text-caption text-text-secondary w-[50px] shrink-0">金額</span>
                  <span className={`text-body font-semibold ${txType === 'income' ? 'text-success' : 'text-danger'}`}>{txType === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-md">
                  <span className="text-caption text-text-secondary w-[50px] shrink-0">類別</span>
                  <span className={`text-body ${getCategoryTypeColorClass(txType)}`}>
                    {categoryIcons[tx.category] ?? '📦'} {getCategoryName(tx.category)}
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
                {tx.rawText && (
                  <div className="flex items-start gap-md">
                    <span className="text-caption text-text-secondary w-[50px] shrink-0">原始輸入</span>
                    <span className="text-caption text-text-secondary">{tx.rawText}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-sm">
                <button
                  type="button"
                  onClick={onToggle}
                  className="flex-1 h-9 rounded-sm border border-border text-text-secondary text-body"
                >
                  收合
                </button>
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="flex-1 h-9 rounded-sm border border-primary text-primary text-body"
                  data-testid="edit-btn"
                >
                  修改
                </button>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="flex-1 h-9 rounded-sm border border-danger text-danger text-body"
                  data-testid="delete-btn"
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
}

export default TransactionItem
