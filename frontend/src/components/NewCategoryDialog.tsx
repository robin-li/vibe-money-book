import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  pets: '🐾',
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
  const { t } = useTranslation()
  const [mode, setMode] = useState<DialogMode>('main')
  const [customName, setCustomName] = useState(suggestedCategory)
  const config = personaConfig[persona]

  const filteredCategories = categoryInfoList.filter((c) => c.type === transactionType)

  const isNameValid = customName.trim().length >= 2 && customName.trim().length <= 50

  if (mode === 'rename') {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
        <div
          className="w-full max-w-[512px] bg-surface rounded-t-xl p-lg pb-[120px] animate-slide-up"
          role="dialog"
          aria-label={t('dashboard:newCategory.renameTitle')}
        >
          <h3 className="text-title font-semibold text-text-primary mb-md">
            {t('dashboard:newCategory.renameTitle')}
          </h3>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full h-[44px] rounded-md border border-border px-lg text-body mb-xs"
            maxLength={50}
            autoFocus
            aria-label={t('dashboard:newCategory.categoryNameLabel')}
          />
          <p className="text-small text-text-tertiary mb-lg">
            {t('dashboard:newCategory.nameHint')}
          </p>
          <div className="flex gap-sm">
            <button
              type="button"
              onClick={() => setMode('main')}
              className="flex-1 h-10 rounded-sm border border-border text-text-secondary"
            >
              {t('common:cancel')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (isNameValid) onConfirm(customName.trim())
              }}
              disabled={!isNameValid}
              className="flex-1 h-10 rounded-sm bg-primary text-surface font-semibold disabled:opacity-40"
            >
              {t('common:confirmAdd')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'select') {
    const typeLabel = transactionType === 'income' ? t('common:income') : t('common:expense')
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
        <div
          className="w-full max-w-[512px] bg-surface rounded-t-xl p-lg pb-[120px] animate-slide-up"
          role="dialog"
          aria-label={t('dashboard:newCategory.selectCategoryTitle', { type: typeLabel })}
        >
          <h3 className="text-title font-semibold text-text-primary mb-md">
            {t('dashboard:newCategory.selectCategoryTitle', { type: typeLabel })}
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
            {t('common:cancel')}
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
        aria-label={t('dashboard:newCategory.renameTitle')}
      >
        <div className="flex items-start gap-sm mb-md">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-surface text-sm shrink-0">
            {config.emoji}
          </div>
          <p className="text-body text-text-primary">
            {t('dashboard:newCategory.suggestion', { category: suggestedCategory })}
            <br />
            <br />
            {t('dashboard:newCategory.askAdd', { category: suggestedCategory })}
          </p>
        </div>

        <div className="flex gap-sm">
          <button
            type="button"
            onClick={() => onConfirm(suggestedCategory)}
            className="h-9 px-lg rounded-sm bg-primary text-surface text-body font-medium"
          >
            {t('common:confirm')}
          </button>
          <button
            type="button"
            onClick={() => setMode('rename')}
            className="h-9 px-lg rounded-sm border border-primary text-primary text-body"
          >
            {t('common:modifyName')}
          </button>
          <button
            type="button"
            onClick={() => setMode('select')}
            className="h-9 px-lg rounded-sm border border-border text-text-secondary text-body"
          >
            {t('common:selectExisting')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewCategoryDialog
