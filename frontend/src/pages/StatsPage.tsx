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
type TypeTab = 'expense' | 'income'

function StatsPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month')
  const [typeTab, setTypeTab] = useState<TypeTab>('expense')
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummaryData | null>(null)
  const [distribution, setDistribution] = useState<DistributionItem[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Custom date range
  const today = new Date().toISOString().slice(0, 10)
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const [customStart, setCustomStart] = useState(firstOfMonth)
  const [customEnd, setCustomEnd] = useState(today)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { period: timeFilter, type: typeTab }
      if (timeFilter === 'custom') {
        params.start_date = customStart
        params.end_date = customEnd
      }
      const requests: Promise<unknown>[] = [
        api.get('/stats/distribution', { params }),
      ]

      // Only fetch budget summary for expense tab
      if (typeTab === 'expense') {
        requests.push(api.get('/budget/summary'))
      }

      const results = await Promise.all(requests)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const distRes = results[0] as any
      const rawDist = (distRes.data.data.distribution ?? distRes.data.data.categories ?? []) as Array<{
        category: string
        amount: number
        ratio?: number
        percentage?: number
      }>
      const total = rawDist.reduce((sum, c) => sum + c.amount, 0)
      const items: DistributionItem[] = rawDist.map((c) => ({
        category: c.category,
        amount: c.amount,
        percentage: c.percentage ?? Math.round((c.ratio ?? 0) * 100),
      }))
      setDistribution(items)
      setTotalAmount(total)

      if (typeTab === 'expense' && results[1]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const budgetRes = results[1] as any
        const b = budgetRes.data.data
        setBudgetSummary({
          month: b.month,
          monthlyBudget: b.monthly_budget,
          totalSpent: b.total_spent,
          remaining: b.remaining,
          usedRatio: b.used_ratio,
        })
      } else {
        setBudgetSummary(null)
      }
    } catch {
      // Silently fail - show empty state
    } finally {
      setLoading(false)
    }
  }, [timeFilter, typeTab, customStart, customEnd])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const formatMoney = (n: number) =>
    `$${n.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}`

  // Sort distribution by amount descending for ranking
  const ranked = [...distribution].sort((a, b) => b.amount - a.amount)
  const maxAmount = ranked.length > 0 ? ranked[0].amount : 0

  const isExpense = typeTab === 'expense'

  return (
    <div className="p-2xl pb-[100px]">
      {/* Header */}
      <header className="h-14 flex items-center mb-lg">
        <h1 className="text-title font-semibold text-text-primary">
          📊 統計
        </h1>
      </header>

      {/* Income / Expense Tab */}
      <div className="flex mb-xl bg-surface rounded-lg shadow-card overflow-hidden" role="tablist">
        {([
          { key: 'expense' as const, label: '支出' },
          { key: 'income' as const, label: '收入' },
        ]).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={typeTab === key}
            data-testid={`tab-${key}`}
            onClick={() => setTypeTab(key)}
            className={`flex-1 py-sm text-body font-semibold transition-colors ${
              typeTab === key
                ? key === 'expense'
                  ? 'bg-danger text-surface'
                  : 'bg-success text-surface'
                : 'bg-surface text-text-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

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

      {/* Custom date range picker */}
      {timeFilter === 'custom' && (
        <div className="flex gap-sm mb-xl items-center">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            max={customEnd}
            className="flex-1 h-10 rounded-md border border-border bg-surface px-md text-caption text-text-primary focus:outline-none focus:border-primary"
            aria-label="開始日期"
          />
          <span className="text-caption text-text-secondary">～</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            min={customStart}
            max={today}
            className="flex-1 h-10 rounded-md border border-border bg-surface px-md text-caption text-text-primary focus:outline-none focus:border-primary"
            aria-label="結束日期"
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-xl">
          <div className="bg-surface rounded-lg shadow-card p-lg animate-pulse">
            <div className="h-4 bg-border rounded w-1/3 mb-md" />
            <div className="h-6 bg-border rounded w-1/2" />
          </div>
        </div>
      ) : (
        <>
          {/* Total amount card */}
          <section
            className="bg-surface rounded-lg shadow-card p-lg mb-xl"
            aria-label={isExpense ? '總支出' : '總收入'}
          >
            <div className="flex justify-between items-baseline mb-sm">
              <p className="text-caption text-text-secondary">
                {timeFilter === 'week'
                  ? (isExpense ? '本週總支出' : '本週總收入')
                  : timeFilter === 'custom'
                    ? (isExpense ? '區間總支出' : '區間總收入')
                    : (isExpense ? '本月總支出' : '本月總收入')}
              </p>
              {isExpense && budgetSummary && budgetSummary.monthlyBudget > 0 && (
                <p className="text-small text-text-secondary">
                  目標：{formatMoney(budgetSummary.monthlyBudget)}
                </p>
              )}
            </div>
            <p className={`text-headline font-bold mb-md ${isExpense ? 'text-danger' : 'text-success'}`}>
              {isExpense
                ? formatMoney(budgetSummary?.totalSpent ?? totalAmount)
                : formatMoney(totalAmount)}
            </p>
            {isExpense && budgetSummary && budgetSummary.monthlyBudget > 0 && (
              <BudgetBar usedRatio={budgetSummary.usedRatio} />
            )}
          </section>

          {/* Distribution chart */}
          <section aria-label={isExpense ? '支出分佈' : '收入分佈'} className="mb-xl">
            <DistributionChart
              data={distribution}
              totalSpent={isExpense ? (budgetSummary?.totalSpent ?? totalAmount) : totalAmount}
              emptyMessage={isExpense ? '本月尚無支出記錄' : '本月尚無收入記錄'}
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
