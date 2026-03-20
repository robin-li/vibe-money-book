import type { BudgetSummary } from '../stores/dashboardStore'
import BudgetBar from './BudgetBar'

interface BudgetCardProps {
  summary: BudgetSummary | null
  compact?: boolean
}

function BudgetCard({ summary, compact }: BudgetCardProps) {
  const baseClass = compact
    ? 'bg-surface rounded-lg shadow-card p-lg flex-1 min-w-0'
    : 'bg-surface rounded-lg shadow-card p-lg mx-2xl mb-xl'

  if (!summary || summary.monthlyBudget <= 0) {
    return (
      <section
        className={baseClass}
        aria-label="預算概覽"
      >
        <h2 className="text-caption text-text-secondary mb-sm">
          預算剩餘
        </h2>
        <p className="text-display font-bold text-text-primary">
          --
        </p>
        <p className="text-caption text-text-secondary mt-sm">
          尚未設定預算
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

  const formatMoney = (n: number) =>
    `$${n.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}`

  if (compact) {
    return (
      <section
        className={baseClass}
        aria-label="預算概覽"
      >
        <p className="text-caption text-text-secondary mb-xs">
          預算剩餘
        </p>
        <p
          className={`text-display font-bold ${getPercentColor()}`}
          aria-live="polite"
        >
          {isOverBudget ? '超支' : `${remainingPercent}%`}
        </p>

        {/* Progress bar */}
        <div className="my-sm">
          <BudgetBar usedRatio={usedRatio} />
        </div>

        <div className="flex justify-between">
          <span className="text-small text-text-secondary">
            支出 {formatMoney(totalSpent)}
          </span>
          <span className="text-small text-text-secondary">
            目標 {formatMoney(monthlyBudget)}
          </span>
        </div>
      </section>
    )
  }

  return (
    <section
      className={baseClass}
      aria-label="預算概覽"
    >
      <div className="flex justify-between items-start mb-sm">
        <div>
          <p className="text-caption text-text-secondary">
            預算剩餘
          </p>
          <p
            className={`text-display font-bold ${getPercentColor()}`}
            aria-live="polite"
          >
            {isOverBudget ? '超支' : `${remainingPercent}%`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-caption text-text-secondary">
            本月支出
          </p>
          <p
            className="text-headline font-bold text-danger"
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

      <div className="flex justify-between">
        <span className="text-small text-text-secondary">
          $0
        </span>
        <span className="text-small text-text-secondary">
          目標：{formatMoney(monthlyBudget)}
        </span>
      </div>
    </section>
  )
}

export default BudgetCard
