import { useTranslation } from 'react-i18next'
import { useLocaleFormatter } from '../hooks/useLocaleFormatter'
import type { BudgetSummary } from '../stores/dashboardStore'

interface AssetCardProps {
  summary: BudgetSummary | null
}

function AssetCard({ summary }: AssetCardProps) {
  const { t } = useTranslation('dashboard')
  const { formatCurrency } = useLocaleFormatter()

  const formatMoney = (n: number) => formatCurrency(Math.abs(n))

  if (!summary) {
    return (
      <section
        className="bg-surface rounded-lg shadow-card p-lg flex-1 min-w-0"
        aria-label={t('assetCard.title')}
      >
        <h2 className="text-caption text-text-secondary mb-sm">
          {t('assetCard.title')}
        </h2>
        <p className="text-headline font-bold text-text-primary truncate">
          --
        </p>
        <p className="text-caption text-text-secondary mt-sm">
          {t('assetCard.noTransactions')}
        </p>
      </section>
    )
  }

  const { totalAsset, allTimeIncome, allTimeSpent } = summary
  const isPositive = totalAsset >= 0

  return (
    <section
      className="bg-surface rounded-lg shadow-card p-lg flex-1 min-w-0"
      aria-label={t('assetCard.title')}
    >
      <p className="text-caption text-text-secondary mb-xs">
        {t('assetCard.title')}
      </p>
      <p
        className={`text-headline font-bold truncate ${isPositive ? 'text-primary' : 'text-danger'}`}
        aria-live="polite"
      >
        {isPositive ? '+' : '-'}{formatMoney(totalAsset)}
      </p>
      <div className="space-y-xs mt-sm text-caption">
        <div className="flex justify-between">
          <span className="text-text-secondary">{t('assetCard.income')}</span>
          <span className="text-success">+{formatMoney(allTimeIncome)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">{t('assetCard.expense')}</span>
          <span className="text-danger">-{formatMoney(allTimeSpent)}</span>
        </div>
      </div>
    </section>
  )
}

export default AssetCard
