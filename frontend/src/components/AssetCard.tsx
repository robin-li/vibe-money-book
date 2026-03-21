import type { BudgetSummary } from '../stores/dashboardStore'

interface AssetCardProps {
  summary: BudgetSummary | null
}

function AssetCard({ summary }: AssetCardProps) {
  const formatMoney = (n: number) =>
    `$${Math.abs(n).toLocaleString('zh-TW', { maximumFractionDigits: 0 })}`

  if (!summary) {
    return (
      <section
        className="bg-surface rounded-lg shadow-card p-lg flex-1 min-w-0"
        aria-label="總資產"
      >
        <h2 className="text-caption text-text-secondary mb-sm">
          總資產
        </h2>
        <p className="text-headline font-bold text-text-primary truncate">
          --
        </p>
        <p className="text-caption text-text-secondary mt-sm">
          尚無交易紀錄
        </p>
      </section>
    )
  }

  const { totalAsset, allTimeIncome, allTimeSpent } = summary
  const isPositive = totalAsset >= 0

  return (
    <section
      className="bg-surface rounded-lg shadow-card p-lg flex-1 min-w-0"
      aria-label="總資產"
    >
      <p className="text-caption text-text-secondary mb-xs">
        總資產
      </p>
      <p
        className={`text-headline font-bold truncate ${isPositive ? 'text-primary' : 'text-danger'}`}
        aria-live="polite"
      >
        {isPositive ? '+' : '-'}{formatMoney(totalAsset)}
      </p>
      <div className="space-y-xs mt-sm text-caption">
        <div className="flex justify-between">
          <span className="text-text-secondary">收入</span>
          <span className="text-success">+{formatMoney(allTimeIncome)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">支出</span>
          <span className="text-danger">-{formatMoney(allTimeSpent)}</span>
        </div>
      </div>
    </section>
  )
}

export default AssetCard
