interface BudgetBarProps {
  /** Used ratio (0 to 1+) */
  usedRatio: number
}

/**
 * Budget progress bar with color gradient based on remaining budget percentage.
 * - >= 50% remaining -> green (success)
 * - 20-50% remaining -> yellow (warning)
 * - < 20% remaining -> red (danger) with breathing animation
 */
function BudgetBar({ usedRatio }: BudgetBarProps) {
  const remainingRatio = Math.max(0, 1 - usedRatio)
  const progressPercent = Math.min(usedRatio * 100, 100)

  const getBarColor = () => {
    if (remainingRatio < 0.2) return 'bg-danger'
    if (remainingRatio < 0.5) return 'bg-warning'
    return 'bg-success'
  }

  const getStatusClass = () => {
    if (remainingRatio < 0.2) return 'budget-bar-danger'
    if (remainingRatio < 0.5) return 'budget-bar-warning'
    return 'budget-bar-safe'
  }

  return (
    <div
      className={`h-2 rounded-full bg-border overflow-hidden ${getStatusClass()}`}
      data-testid="budget-bar"
    >
      <div
        className={`h-full rounded-full transition-all duration-[var(--transition-normal)] ${getBarColor()} ${
          remainingRatio < 0.2 ? 'animate-budget-pulse' : ''
        }`}
        style={{ width: `${progressPercent}%` }}
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`已使用 ${Math.round(usedRatio * 100)}% 預算`}
      />
    </div>
  )
}

export default BudgetBar
