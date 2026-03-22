import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ParsedResult, TransactionType, CategoryInfo } from '../stores/dashboardStore'
import { getCategoryName, getCategoryTypeColorClass } from '../lib/categoryUtils'

interface ParsedResultCardProps {
  result: ParsedResult
  onConfirm: (data: {
    type: TransactionType
    amount: number
    category: string
    merchant: string
    date: string
    note?: string
  }) => void
  onCancel: () => void
  categories: string[]
  categoryInfoList?: CategoryInfo[]
}

function ParsedResultCard({
  result,
  onConfirm,
  onCancel,
  categories,
  categoryInfoList = [],
}: ParsedResultCardProps) {
  const { t } = useTranslation()
  const [type, setType] = useState<TransactionType>(result.type ?? 'expense')
  const [amount, setAmount] = useState(result.amount?.toString() ?? '')
  const [category, setCategory] = useState(result.category ?? 'other')
  const [merchant, setMerchant] = useState(result.merchant ?? '')
  const [date, setDate] = useState(result.date ?? new Date().toISOString().split('T')[0])
  const [note, setNote] = useState(result.note ?? '')

  const filteredCategories = categoryInfoList.length > 0
    ? categoryInfoList.filter((c) => c.type === type).map((c) => c.category)
    : categories

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType)
    const matchingCats = categoryInfoList.filter((c) => c.type === newType)
    if (matchingCats.length > 0 && !matchingCats.some((c) => c.category === category)) {
      setCategory(matchingCats[0].category)
    }
  }

  const handleConfirm = () => {
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) return
    onConfirm({
      type,
      amount: parsedAmount,
      category,
      merchant,
      date,
      note: note || undefined,
    })
  }

  const isIncome = type === 'income'

  return (
    <div
      className={`bg-surface rounded-lg shadow-card border-l-4 ${isIncome ? 'border-l-success' : 'border-l-primary'} p-lg mx-2xl mb-md`}
      role="region"
      aria-label={t('dashboard:parsedResult.label')}
    >
      <h3 className="text-body font-semibold text-text-primary mb-md">
        {t('dashboard:parsedResult.title')}
      </h3>

      <div className="flex border-b border-border mb-lg" role="tablist" aria-label={t('dashboard:parsedResult.transactionType')}>
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          className={`flex-1 py-2 text-body font-semibold transition-colors ${
            type === 'expense'
              ? 'border-b-2 border-danger text-danger'
              : 'text-text-secondary'
          }`}
          role="tab"
          aria-selected={type === 'expense'}
          aria-label={t('common:expense')}
        >
          {t('common:expense')}
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          className={`flex-1 py-2 text-body font-semibold transition-colors ${
            type === 'income'
              ? 'border-b-2 border-success text-success'
              : 'text-text-secondary'
          }`}
          role="tab"
          aria-selected={type === 'income'}
          aria-label={t('common:income')}
        >
          {t('common:income')}
        </button>
      </div>

      <div className="space-y-sm mb-lg">
        <div className="flex items-center gap-md">
          <span className="text-caption text-text-secondary w-[60px] shrink-0">
            {t('common:amount')}
          </span>
          <div className="flex items-center flex-1 gap-xs">
            <span className={`text-body font-semibold ${isIncome ? 'text-success' : 'text-danger'}`}>
              {isIncome ? '+' : '-'}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`flex-1 h-9 rounded-md border border-border px-sm text-body font-semibold ${isIncome ? 'text-success' : 'text-danger'}`}
              min="0.01"
              step="1"
              aria-label={t('common:amount')}
            />
          </div>
        </div>

        <div className="flex items-center gap-md">
          <span className="text-caption text-text-secondary w-[60px] shrink-0">
            {t('common:category')}
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`flex-1 h-9 rounded-md border border-border px-sm text-body ${getCategoryTypeColorClass(type)}`}
            aria-label={t('common:category')}
          >
            {filteredCategories.map((cat) => (
              <option key={cat} value={cat}>
                {getCategoryName(cat)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-md">
          <span className="text-caption text-text-secondary w-[60px] shrink-0">
            {t('common:merchant')}
          </span>
          <input
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="flex-1 h-9 rounded-md border border-border px-sm text-body"
            aria-label={t('common:merchant')}
          />
        </div>

        <div className="flex items-center gap-md">
          <span className="text-caption text-text-secondary w-[60px] shrink-0">
            {t('common:date')}
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 h-9 rounded-md border border-border px-sm text-body"
            aria-label={t('common:date')}
          />
        </div>

        <div className="flex items-start gap-md">
          <span className="text-caption text-text-secondary w-[60px] shrink-0 mt-xs">
            {t('common:note')}
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1 rounded-md border border-border px-sm py-xs text-body resize-none"
            placeholder={t('common:note')}
            rows={2}
            aria-label={t('common:note')}
          />
        </div>
      </div>

      <div className="flex gap-sm">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-10 rounded-sm border border-border text-text-secondary text-body transition-colors duration-[var(--transition-fast)] hover:bg-bg"
        >
          {t('common:cancel')}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 h-10 rounded-sm bg-primary text-surface font-semibold text-body transition-opacity duration-[var(--transition-fast)] hover:opacity-90"
        >
          {t('common:confirmAdd')}
        </button>
      </div>
    </div>
  )
}

export default ParsedResultCard
