import { useState } from 'react'
import type { Persona } from '../stores/index'
import { getCategoryName } from '../lib/categoryUtils'

interface CategoryInfo {
  category: string
  type: 'income' | 'expense'
}

interface NewCategoryDialogProps {
  suggestedCategory: string
  persona: Persona
  transactionType: 'income' | 'expense'
  categoryInfoList: CategoryInfo[]
  onConfirm: (categoryName: string) => void
  onSelectExisting: (category: string) => void
}

const personaConfig: Record<Persona, { emoji: string }> = {
  gentle: { emoji: '💖' },
  sarcastic: { emoji: '🔥' },
  guilt_trip: { emoji: '🥺' },
}

const categoryIcons: Record<string, string> = {
  entertainment: '🎬',
  food: '🍽️',
  daily: '🧴',
  education: '📚',
  medical: '🏥',
  transport: '🚌',
  other: '📦',
  adjustment_expense: '📋',
  adjustment_income: '📋',
  salary: '💰',
  investment: '📈',
  pension: '🏦',
  insurance: '🛡️',
  other_income: '📦',
}

type DialogMode = 'main' | 'rename' | 'select'

function NewCategoryDialog({
  suggestedCategory,
  persona,
  transactionType,
  categoryInfoList,
  onConfirm,
  onSelectExisting,
}: NewCategoryDialogProps) {
  const [mode, setMode] = useState<DialogMode>('main')
  const [customName, setCustomName] = useState(suggestedCategory)
  const config = personaConfig[persona]

  // Filter categories by transaction type
  const filteredCategories = categoryInfoList.filter((c) => c.type === transactionType)

  const isNameValid = customName.trim().length >= 2 && customName.trim().length <= 50

  if (mode === 'rename') {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
        <div
          className="w-full max-w-[512px] bg-surface rounded-t-xl p-lg pb-[120px] animate-slide-up"
          role="dialog"
          aria-label="修改類別名稱"
        >
          <h3 className="text-title font-semibold text-text-primary mb-md">
            修改類別名稱
          </h3>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full h-[44px] rounded-md border border-border px-lg text-body mb-xs"
            maxLength={50}
            autoFocus
            aria-label="類別名稱"
          />
          <p className="text-small text-text-tertiary mb-lg">
            ⚠️ 類別名稱 2–50 字元
          </p>
          <div className="flex gap-sm">
            <button
              type="button"
              onClick={() => setMode('main')}
              className="flex-1 h-10 rounded-sm border border-border text-text-secondary"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => {
                if (isNameValid) onConfirm(customName.trim())
              }}
              disabled={!isNameValid}
              className="flex-1 h-10 rounded-sm bg-primary text-surface font-semibold disabled:opacity-40"
            >
              確認新增
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'select') {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
        <div
          className="w-full max-w-[512px] bg-surface rounded-t-xl p-lg pb-[120px] animate-slide-up"
          role="dialog"
          aria-label="選擇類別"
        >
          <h3 className="text-title font-semibold text-text-primary mb-md">
            選擇{transactionType === 'income' ? '收入' : '支出'}類別
          </h3>
          <div className="flex flex-wrap gap-sm mb-lg">
            {filteredCategories.map((c) => (
              <button
                key={c.category}
                type="button"
                onClick={() => onSelectExisting(c.category)}
                className="px-lg py-sm rounded-sm bg-bg text-body text-text-primary hover:bg-border transition-colors"
              >
                {categoryIcons[c.category] ?? '📦'}{' '}
                {getCategoryName(c.category)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMode('main')}
            className="w-full h-10 rounded-sm border border-border text-text-secondary"
          >
            取消
          </button>
        </div>
      </div>
    )
  }

  // Main mode - AI suggestion bubble
  return (
    <div className="mx-2xl mb-md">
      <div
        className="max-w-[85%] bg-primary-light rounded-xl p-lg"
        role="dialog"
        aria-label="新類別建議"
      >
        <div className="flex items-start gap-sm mb-md">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-surface text-sm shrink-0">
            {config.emoji}
          </div>
          <p className="text-body text-text-primary">
            我覺得這筆消費屬於「
            <span className="font-semibold bg-primary/20 rounded-sm px-1.5 py-0.5">
              {suggestedCategory}
            </span>
            」，但你的類別中沒有這項。
            <br />
            <br />
            要新增「{suggestedCategory}」類別嗎？
          </p>
        </div>

        <div className="flex gap-sm">
          <button
            type="button"
            onClick={() => onConfirm(suggestedCategory)}
            className="h-9 px-lg rounded-sm bg-primary text-surface text-body font-medium"
          >
            確認
          </button>
          <button
            type="button"
            onClick={() => setMode('rename')}
            className="h-9 px-lg rounded-sm border border-primary text-primary text-body"
          >
            修改名稱
          </button>
          <button
            type="button"
            onClick={() => setMode('select')}
            className="h-9 px-lg rounded-sm border border-border text-text-secondary text-body"
          >
            選現有
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewCategoryDialog
