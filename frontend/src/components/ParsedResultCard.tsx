import { useState } from 'react'
import type { ParsedResult, TransactionType } from '../stores/dashboardStore'

interface ParsedResultCardProps {
  result: ParsedResult
  onConfirm: (data: {
    type: TransactionType
    amount: number
    category: string
    merchant: string
    date: string
  }) => void
  onCancel: () => void
  categories: string[]
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

const typeLabels: Record<TransactionType, string> = {
  income: '收入',
  expense: '消費',
}

function ParsedResultCard({
  result,
  onConfirm,
  onCancel,
  categories,
}: ParsedResultCardProps) {
  // Issue #59: default to edit mode
  const [type, setType] = useState<TransactionType>(result.type ?? 'expense')
  const [amount, setAmount] = useState(result.amount?.toString() ?? '')
  const [category, setCategory] = useState(result.category ?? 'other')
  const [merchant, setMerchant] = useState(result.merchant ?? '')
  const [date, setDate] = useState(result.date ?? new Date().toISOString().split('T')[0])

  const handleConfirm = () => {
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) return
    onConfirm({
      type,
      amount: parsedAmount,
      category,
      merchant,
      date,
    })
  }

  const isIncome = type === 'income'

  return (
    <div
      className={`bg-surface rounded-lg shadow-card border-l-4 ${isIncome ? 'border-l-success' : 'border-l-primary'} p-lg mx-2xl mb-md`}
      role="region"
      aria-label="AI 解析結果"
    >
      <h3 className="text-body font-semibold text-text-primary mb-md">
        AI 幫你整理好了
      </h3>

      <div className="space-y-sm mb-lg">
        {/* Issue #58: Transaction type selector */}
        <div className="flex items-center gap-md">
          <span className="text-caption text-text-secondary w-[60px] shrink-0">
            類型
          </span>
          <div className="flex gap-sm" role="radiogroup" aria-label="交易類型">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`px-md py-xs rounded-md text-caption font-semibold transition-colors ${
                type === 'expense'
                  ? 'bg-danger text-surface'
                  : 'bg-bg text-text-secondary border border-border'
              }`}
              role="radio"
              aria-checked={type === 'expense'}
              aria-label="消費"
            >
              {typeLabels.expense}
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`px-md py-xs rounded-md text-caption font-semibold transition-colors ${
                type === 'income'
                  ? 'bg-success text-surface'
                  : 'bg-bg text-text-secondary border border-border'
              }`}
              role="radio"
              aria-checked={type === 'income'}
              aria-label="收入"
            >
              {typeLabels.income}
            </button>
          </div>
        </div>

        {/* Issue #59: always editable (default edit mode) */}
        <div className="flex items-center gap-md">
          <span className="text-caption text-text-secondary w-[60px] shrink-0">
            金額
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
              aria-label="金額"
            />
          </div>
        </div>

        <div className="flex items-center gap-md">
          <span className="text-caption text-text-secondary w-[60px] shrink-0">
            類別
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 h-9 rounded-md border border-border px-sm text-body"
            aria-label="類別"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {categoryNames[cat] ?? cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-md">
          <span className="text-caption text-text-secondary w-[60px] shrink-0">
            商家
          </span>
          <input
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="flex-1 h-9 rounded-md border border-border px-sm text-body"
            aria-label="商家"
          />
        </div>

        <div className="flex items-center gap-md">
          <span className="text-caption text-text-secondary w-[60px] shrink-0">
            日期
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 h-9 rounded-md border border-border px-sm text-body"
            aria-label="日期"
          />
        </div>

        {result.note && (
          <div className="flex items-start gap-md">
            <span className="text-caption text-text-secondary w-[60px] shrink-0">
              備註
            </span>
            <span className="text-caption text-text-secondary">
              {result.note}
            </span>
          </div>
        )}
      </div>

      {/* Issue #59: buttons are "Cancel" + "Confirm" (no "Edit" button) */}
      <div className="flex gap-sm">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-10 rounded-sm border border-border text-text-secondary text-body transition-colors duration-[var(--transition-fast)] hover:bg-bg"
        >
          取消
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 h-10 rounded-sm bg-primary text-surface font-semibold text-body transition-opacity duration-[var(--transition-fast)] hover:opacity-90"
        >
          確認新增
        </button>
      </div>
    </div>
  )
}

export default ParsedResultCard
