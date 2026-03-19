import { useState, useCallback } from 'react'
import type { Transaction } from '../stores/index'
import { getCategoryName, getCategoryTypeColorClass } from '../lib/categoryUtils'

interface TransactionItemProps {
  transaction: Transaction
  isExpanded: boolean
  onToggle: () => void
  onDelete: (id: string) => Promise<void>
  isDeleting: boolean
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
  salary: '💰',
  investment: '📈',
  pension: '🏦',
  insurance: '🛡️',
  other_income: '💵',
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
  return dateStr.split('T')[0]
}

function TransactionItem({
  transaction: tx,
  isExpanded,
  onToggle,
  onDelete,
  isDeleting,
}: TransactionItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  return (
    <div className="border-b border-border last:border-b-0" data-testid={`transaction-item-${tx.id}`}>
      {/* Summary row */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-md py-md hover:bg-bg transition-colors"
        aria-expanded={isExpanded}
      >
        <div className={`w-10 h-10 rounded-md ${tx.type === 'income' ? 'bg-success-light' : 'bg-danger-light'} flex items-center justify-center text-lg shrink-0`}>
          {categoryIcons[tx.category] ?? '📦'}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-body font-semibold text-text-primary truncate">
            {tx.merchant || tx.category}
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
          {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
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
                {tx.merchant} -${tx.amount.toLocaleString()}
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
          ) : (
            <>
              <div className="space-y-sm mb-lg">
                <div className="flex items-center gap-md">
                  <span className="text-caption text-text-secondary w-[50px] shrink-0">金額</span>
                  <span className={`text-body font-semibold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>${tx.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-md">
                  <span className="text-caption text-text-secondary w-[50px] shrink-0">類別</span>
                  <span className={`text-body ${getCategoryTypeColorClass(tx.type ?? 'expense')}`}>
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
