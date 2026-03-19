import { useEffect, useState, useCallback } from 'react'
import api from '../lib/api'
import BudgetBar from '../components/BudgetBar'
import DistributionChart from '../components/DistributionChart'
import type { DistributionItem } from '../components/DistributionChart'
import { getCategoryColor, getCategoryName } from '../lib/categoryUtils'

interface BudgetSummaryData {
  month: string
  monthlyBudget: number
  totalSpent: number
  remaining: number
  usedRatio: number
}

type TimeFilter = 'week' | 'month' | 'custom'

function StatsPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month')
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummaryData | null>(null)
  const [distribution, setDistribution] = useState<DistributionItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [budgetRes, distRes] = await Promise.all([
        api.get('/budget/summary'),
        api.get('/stats/distribution', { params: { period: timeFilter } }),
      ])

      const b = budgetRes.data.data
      setBudgetSummary({
        month: b.month,
        monthlyBudget: b.monthly_budget,
        totalSpent: b.total_spent,
        remaining: b.remaining,
        usedRatio: b.used_ratio,
      })

      const items: DistributionItem[] = (
        distRes.data.data.categories as Array<{
          category: string
          amount: number
          percentage: number
        }>
      ).map((c) => ({
        category: c.category,
        amount: c.amount,
        percentage: c.percentage,
      }))
      setDistribution(items)
    } catch {
      // Silently fail - show empty state
    } finally {
      setLoading(false)
    }
  }, [timeFilter])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const formatMoney = (n: number) =>
    `$${n.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}`

  // Sort distribution by amount descending for ranking
  const ranked = [...distribution].sort((a, b) => b.amount - a.amount)
  const maxAmount = ranked.length > 0 ? ranked[0].amount : 0

  return (
    <div className="p-2xl pb-[100px]">
      {/* Header */}
      <header className="h-14 flex items-center mb-lg">
        <h1 className="text-title font-semibold text-text-primary">
          📊 統計
        </h1>
      </header>

      {/* Time filter */}
      <div className="flex gap-sm mb-xl">
        {([
          { key: 'week' as const, label: '本週' },
          { key: 'month' as const, label: '本月' },
          { key: 'custom' as const, label: '自訂' },
        ]).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTimeFilter(key)}
            className={`px-lg py-sm rounded-full text-caption transition-colors ${
              timeFilter === key
                ? 'bg-primary text-surface'
                : 'bg-surface text-text-secondary border border-border'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-xl">
          <div className="bg-surface rounded-lg shadow-card p-lg animate-pulse">
            <div className="h-4 bg-border rounded w-1/3 mb-md" />
            <div className="h-6 bg-border rounded w-1/2" />
          </div>
        </div>
      ) : (
        <>
          {/* Budget summary card */}
          <section
            className="bg-surface rounded-lg shadow-card p-lg mb-xl"
            aria-label="本月總支出"
          >
            <div className="flex justify-between items-baseline mb-sm">
              <p className="text-caption text-text-secondary">
                本月總支出
              </p>
              {budgetSummary && budgetSummary.monthlyBudget > 0 && (
                <p className="text-small text-text-secondary">
                  目標：{formatMoney(budgetSummary.monthlyBudget)}
                </p>
              )}
            </div>
            <p className="text-headline font-bold text-danger mb-md">
              {budgetSummary ? formatMoney(budgetSummary.totalSpent) : '$0'}
            </p>
            {budgetSummary && budgetSummary.monthlyBudget > 0 && (
              <BudgetBar usedRatio={budgetSummary.usedRatio} />
            )}
          </section>

          {/* Distribution chart */}
          <section aria-label="消費分佈" className="mb-xl">
            <DistributionChart
              data={distribution}
              totalSpent={budgetSummary?.totalSpent ?? 0}
            />
          </section>

          {/* Category ranking */}
          {ranked.length > 0 && (
            <section aria-label="類別排行">
              <h2 className="text-title font-semibold text-text-primary mb-md">
                類別排行
              </h2>
              <div className="space-y-md">
                {ranked.map((item, index) => (
                  <div
                    key={item.category}
                    className="bg-surface rounded-lg shadow-card p-md flex items-center gap-md"
                  >
                    <span className="text-caption font-bold text-text-secondary w-6 text-center">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-xs">
                        <span className="text-body font-semibold text-text-primary">
                          {getCategoryName(item.category)}
                        </span>
                        <span className="text-body text-text-primary">
                          {formatMoney(item.amount)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: maxAmount > 0 ? `${(item.amount / maxAmount) * 100}%` : '0%',
                            backgroundColor: getCategoryColor(item.category, index),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default StatsPage
