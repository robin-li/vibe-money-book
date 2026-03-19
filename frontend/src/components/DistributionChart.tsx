import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { getCategoryColor, getCategoryName } from '../lib/categoryUtils'

export interface DistributionItem {
  category: string
  amount: number
  percentage: number
}

interface DistributionChartProps {
  data: DistributionItem[]
  totalSpent: number
}

function DistributionChart({ data, totalSpent }: DistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-3xl" data-testid="distribution-chart-empty">
        <div className="w-[200px] h-[200px] mx-auto border-2 border-dashed border-text-tertiary rounded-full flex items-center justify-center mb-lg">
          <p className="text-body text-text-tertiary">
            本月尚無消費記錄
          </p>
        </div>
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: getCategoryName(item.category),
    value: item.amount,
    percentage: item.percentage,
    category: item.category,
  }))

  const formatMoney = (n: number) =>
    `$${n.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}`

  return (
    <div data-testid="distribution-chart">
      {/* Pie Chart */}
      <div className="w-[200px] h-[200px] mx-auto relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.category}
                  fill={getCategoryColor(entry.category, index)}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatMoney(Number(value))}
              labelStyle={{ color: '#1A1A2E' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center total */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-caption font-semibold text-text-primary">
            {formatMoney(totalSpent)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-md mt-lg px-lg">
        {chartData.map((entry, index) => (
          <div key={entry.category} className="flex items-center gap-xs">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ backgroundColor: getCategoryColor(entry.category, index) }}
            />
            <span className="text-small text-text-secondary">
              {entry.name} {entry.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DistributionChart
