import { useTranslation } from 'react-i18next'
import { useLocaleFormatter } from '../hooks/useLocaleFormatter'
import type { BudgetSummary } from '../stores/dashboardStore'
import BudgetBar from './BudgetBar'

interface BudgetCardProps {
  summary: BudgetSummary | null
  compact?: boolean
}

function BudgetCard({ summary, compact }: BudgetCardProps) {
  const { t } = useTranslation('dashboard')
  const { formatCurrency } = useLocaleFormatter()

  const formatMoney = (n: number) => formatCurrency(n)

  const baseClass = compact
    ? 'bg-surface rounded-lg shadow-card p-lg flex-1 min-w-0'
    : 'bg-surface rounded-lg shadow-card p-lg mx-2xl mb-xl'

  if (!summary || summary.monthlyBudget <= 0) {
    return (
      <section
        className={baseClass}
        aria-label={t('budgetCard.budgetRemaining')}
      >
        <h2 className="text-caption text-text-secondary mb-sm">
          {t('budgetCard.budgetRemaining')}
        </h2>
        <p className="text-headline font-bold text-text-primary truncate">
          --
        </p>
        <p className="text-caption text-text-secondary mt-sm">
          {t('budgetCard.noBudgetSet')}
        </p>
      </section>
    )
  }

  const { monthlyBudget, totalSpent, remaining, usedRatio } = summary
  const remainingRatio = Math.max(0, 1 - usedRatio)
  const remainingPercent = Math.round(remainingRatio * 100)

  const isOverBudget = remaining <= 0
  const isLow = remainingRatio < 0.2
  const isMedium = remainingRatio >= 0.2 && remainingRatio < 0.5

  const getPercentColor = () => {
    if (isLow) return 'text-danger'
    if (isMedium) return 'text-warning'
    return 'text-text-primary'
  }

  if (compact) {
    return (
      <section
        className={baseClass}
        aria-label={t('budgetCard.budgetRemaining')}
      >
        <p className="text-caption text-text-secondary mb-xs">
          {t('budgetCard.budgetRemaining')}
        </p>
        <p
          className={`text-headline font-bold truncate ${getPercentColor()}`}
          aria-live="polite"
        >
          {isOverBudget ? t('budgetCard.overBudget') : `${remainingPercent}%`}
        </p>

        {/* Progress bar */}
        <div className="my-sm">
          <BudgetBar usedRatio={usedRatio} />
        </div>

        <div className="space-y-xs text-caption">
          <div className="flex justify-between">
            <span className="text-text-secondary">{t('common:expense')}</span>
            <span className="text-danger">-{formatMoney(totalSpent)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">{t('budgetCard.target')}</span>
            <span className="text-text-primary">{formatMoney(monthlyBudget)}</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className={baseClass}
      aria-label={t('budgetCard.budgetRemaining')}
    >
      <div className="flex justify-between items-start mb-sm">
        <div>
          <p className="text-caption text-text-secondary">
            {t('budgetCard.budgetRemaining')}
          </p>
          <p
            className={`text-headline font-bold truncate ${getPercentColor()}`}
            aria-live="polite"
          >
            {isOverBudget ? t('budgetCard.overBudget') : `${remainingPercent}%`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-caption text-text-secondary">
            {t('budgetCard.monthlySpent')}
          </p>
          <p
            className="text-headline font-bold text-danger truncate"
            aria-live="polite"
          >
            {formatMoney(totalSpent)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-xs">
        <BudgetBar usedRatio={usedRatio} />
      </div>

      <div className="flex justify-between gap-sm">
        <span className="text-small text-text-secondary">
          $0
        </span>
        <span className="text-small text-text-secondary truncate min-w-0 text-right">
          {t('budgetCard.target')}：{formatMoney(monthlyBudget)}
        </span>
      </div>
    </section>
  )
}

export default BudgetCard
