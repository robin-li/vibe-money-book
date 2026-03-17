import { useState } from 'react'
import type { ParsedResult } from '../stores/dashboardStore'

interface ParsedResultCardProps {
  result: ParsedResult
  onConfirm: (data: {
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

function ParsedResultCard({
  result,
  onConfirm,
  onCancel,
  categories,
}: ParsedResultCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [amount, setAmount] = useState(result.amount?.toString() ?? '')
  const [category, setCategory] = useState(result.category ?? 'other')
  const [merchant, setMerchant] = useState(result.merchant ?? '')
  const [date, setDate] = useState(result.date ?? new Date().toISOString().split('T')[0])

  const handleConfirm = () => {
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) return
    onConfirm({
      amount: parsedAmount,
      category,
      merchant,
      date,
    })
  }

  return (
    <div
      className="bg-surface rounded-lg shadow-card border-l-4 border-l-primary p-lg mx-2xl mb-md"
      role="region"
      aria-label="AI 解析結果"
    >
      <h3 className="text-[var(--font-size-body)] font-semibold text-text-primary mb-md">
        ✨ AI 幫你整理好了
      </h3>

      <div className="space-y-sm mb-lg">
        <div className="flex items-center gap-md">
          <span className="text-[var(--font-size-caption)] text-text-secondary w-[60px] shrink-0">
            金額
          </span>
          {isEditing ? (
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 h-9 rounded-md border border-border px-sm text-[var(--font-size-body)] text-danger font-semibold"
              min="0.01"
              step="1"
              aria-label="金額"
            />
          ) : (
            <span className="text-[var(--font-size-body)] text-danger font-semibold">
              ${result.amount?.toLocaleString() ?? '--'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-md">
          <span className="text-[var(--font-size-caption)] text-text-secondary w-[60px] shrink-0">
            類別
          </span>
          {isEditing ? (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 h-9 rounded-md border border-border px-sm text-[var(--font-size-body)]"
              aria-label="類別"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryNames[cat] ?? cat}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-[var(--font-size-body)] text-text-primary">
              {categoryNames[result.category ?? ''] ?? result.category ?? '--'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-md">
          <span className="text-[var(--font-size-caption)] text-text-secondary w-[60px] shrink-0">
            商家
          </span>
          {isEditing ? (
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="flex-1 h-9 rounded-md border border-border px-sm text-[var(--font-size-body)]"
              aria-label="商家"
            />
          ) : (
            <span className="text-[var(--font-size-body)] text-text-primary">
              {result.merchant || '--'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-md">
          <span className="text-[var(--font-size-caption)] text-text-secondary w-[60px] shrink-0">
            日期
          </span>
          {isEditing ? (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 h-9 rounded-md border border-border px-sm text-[var(--font-size-body)]"
              aria-label="日期"
            />
          ) : (
            <span className="text-[var(--font-size-body)] text-text-primary">
              {result.date ?? '--'}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-sm">
        <button
          type="button"
          onClick={() => {
            if (isEditing) {
              onCancel()
              setIsEditing(false)
            } else {
              setIsEditing(true)
            }
          }}
          className="flex-1 h-10 rounded-sm border border-border text-text-secondary text-[var(--font-size-body)] transition-colors duration-[var(--transition-fast)] hover:bg-bg"
        >
          {isEditing ? '取消' : '修改'}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 h-10 rounded-sm bg-primary text-surface font-semibold text-[var(--font-size-body)] transition-opacity duration-[var(--transition-fast)] hover:opacity-90"
        >
          ✓ 確認記帳
        </button>
      </div>
    </div>
  )
}

export default ParsedResultCard
