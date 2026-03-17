import type { BudgetSummary } from '../stores/dashboardStore'

interface BudgetCardProps {
  summary: BudgetSummary | null
}

function BudgetCard({ summary }: BudgetCardProps) {
  if (!summary || summary.monthlyBudget <= 0) {
    return (
      <section
        className="bg-surface rounded-lg shadow-card p-lg mx-2xl mb-xl"
        aria-label="預算概覽"
      >
        <h2 className="text-[var(--font-size-caption)] text-text-secondary mb-sm">
          預算剩餘
        </h2>
        <p className="text-[var(--font-size-display)] font-bold text-text-primary">
          --
        </p>
        <p className="text-[var(--font-size-caption)] text-text-secondary mt-sm">
          尚未設定預算
        </p>
      </section>
    )
  }

  const { monthlyBudget, totalSpent, remaining, usedRatio } = summary
  const remainingRatio = Math.max(0, 1 - usedRatio)
  const remainingPercent = Math.round(remainingRatio * 100)
  const progressPercent = Math.min(usedRatio * 100, 100)

  const isOverBudget = remaining <= 0
  const isLow = remainingRatio < 0.2
  const isMedium = remainingRatio >= 0.2 && remainingRatio < 0.5

  const getProgressColor = () => {
    if (isLow) return 'bg-danger'
    if (isMedium) return 'bg-warning'
    return 'bg-success'
  }

  const getPercentColor = () => {
    if (isLow) return 'text-danger'
    if (isMedium) return 'text-warning'
    return 'text-text-primary'
  }

  const formatMoney = (n: number) =>
    `$${n.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}`

  return (
    <section
      className="bg-surface rounded-lg shadow-card p-lg mx-2xl mb-xl"
      aria-label="預算概覽"
    >
      <div className="flex justify-between items-start mb-sm">
        <div>
          <p className="text-[var(--font-size-caption)] text-text-secondary">
            預算剩餘
          </p>
          <p
            className={`text-[var(--font-size-display)] font-bold ${getPercentColor()}`}
            aria-live="polite"
          >
            {isOverBudget ? '超支' : `${remainingPercent}%`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[var(--font-size-caption)] text-text-secondary">
            本月支出
          </p>
          <p
            className="text-[var(--font-size-headline)] font-bold text-danger"
            aria-live="polite"
          >
            {formatMoney(totalSpent)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-border overflow-hidden mb-xs">
        <div
          className={`h-full rounded-full transition-all duration-[var(--transition-normal)] ${getProgressColor()} ${
            isLow ? 'animate-budget-pulse' : ''
          }`}
          style={{ width: `${progressPercent}%` }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`已使用 ${Math.round(usedRatio * 100)}% 預算`}
        />
      </div>

      <div className="flex justify-between">
        <span className="text-[var(--font-size-small)] text-text-secondary">
          $0
        </span>
        <span className="text-[var(--font-size-small)] text-text-secondary">
          目標：{formatMoney(monthlyBudget)}
        </span>
      </div>
    </section>
  )
}

export default BudgetCard
