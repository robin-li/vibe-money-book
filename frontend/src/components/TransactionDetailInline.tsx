import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocaleFormatter } from '../hooks/useLocaleFormatter'
import { getCategoryName } from '../lib/categoryUtils'
import type { Transaction } from '../stores/index'

interface TransactionDetailInlineProps {
  transaction: Transaction
  isExpanded: boolean
  onToggle: () => void
}

function TransactionDetailInline({
  transaction: tx,
  isExpanded,
  onToggle,
}: TransactionDetailInlineProps) {
  const { t } = useTranslation('stats')
  const { formatCurrency, formatDate: fmtDate } = useLocaleFormatter()

  const txType = tx.type ?? 'expense'

  const formatDateStr = (dateStr: string): string => {
    if (!dateStr) return '--'
    return dateStr.split('T')[0]
  }

  const handleToggle = useCallback(() => {
    onToggle()
  }, [onToggle])

  return (
    <div data-testid={`drilldown-tx-${tx.id}`}>
      {/* Summary row */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-md py-sm px-md hover:bg-bg transition-colors rounded-md"
        aria-expanded={isExpanded}
        data-testid={`drilldown-tx-toggle-${tx.id}`}
      >
        <div className="flex-1 min-w-0 text-left">
          <div className="flex justify-between items-center">
            <span className="text-caption text-text-secondary">
              {formatDateStr(tx.transactionDate)}
            </span>
            <span
              className={`text-body font-semibold ${txType === 'income' ? 'text-success' : 'text-danger'}`}
            >
              {txType === 'income' ? '+' : '-'}
              {formatCurrency(tx.amount)}
            </span>
          </div>
          <p className="text-body text-text-primary truncate">
            {tx.merchant || getCategoryName(tx.category)}
          </p>
        </div>
        <span
          className={`text-text-tertiary text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {/* Expanded detail */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pl-md pr-md pb-sm pt-xs space-y-xs border-l-2 border-primary ml-md">
          <div className="flex items-center gap-sm">
            <span className="text-small text-text-secondary w-[50px] shrink-0">
              {t('detail.amount')}
            </span>
            <span
              className={`text-body font-semibold ${txType === 'income' ? 'text-success' : 'text-danger'}`}
            >
              {txType === 'income' ? '+' : '-'}
              {formatCurrency(tx.amount)}
            </span>
          </div>
          <div className="flex items-center gap-sm">
            <span className="text-small text-text-secondary w-[50px] shrink-0">
              {t('detail.merchant')}
            </span>
            <span className="text-body text-text-primary">
              {tx.merchant || '--'}
            </span>
          </div>
          <div className="flex items-center gap-sm">
            <span className="text-small text-text-secondary w-[50px] shrink-0">
              {t('detail.date')}
            </span>
            <span className="text-body text-text-primary">
              {fmtDate(new Date(tx.transactionDate), {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </span>
          </div>
          {tx.note && (
            <div className="flex items-start gap-sm">
              <span className="text-small text-text-secondary w-[50px] shrink-0">
                {t('detail.note')}
              </span>
              <span className="text-caption text-text-secondary">
                {tx.note}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionDetailInline
