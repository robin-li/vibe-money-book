import type { Transaction } from '../stores/index'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

const categoryIcons: Record<string, string> = {
  food: '🍽️',
  transport: '🚌',
  entertainment: '🎬',
  shopping: '🛍️',
  daily: '🧴',
  medical: '🏥',
  education: '📚',
  other: '📦',
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const period = hours < 12 ? '上午' : '下午'
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${period}${displayHour.toString().padStart(2, '0')}:${minutes}`
}

const categoryNames: Record<string, string> = {
  food: '飲食',
  transport: '交通',
  entertainment: '娛樂',
  shopping: '購物',
  daily: '日用品',
  medical: '醫療',
  education: '教育',
  other: '其他',
}

function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <section className="px-2xl" aria-label="最近帳目">
      <h2 className="text-[var(--font-size-title)] font-semibold text-text-primary mb-md">
        🕐 最近帳目
      </h2>

      {transactions.length === 0 ? (
        <p className="text-[var(--font-size-body)] text-text-tertiary text-center py-3xl">
          還沒有記帳紀錄，開始記帳吧！
        </p>
      ) : (
        <div>
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-md py-md border-b border-border last:border-b-0"
            >
              <div className="w-10 h-10 rounded-md bg-danger-light flex items-center justify-center text-lg shrink-0">
                {categoryIcons[tx.category] ?? '📦'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[var(--font-size-body)] font-semibold text-text-primary truncate">
                  {tx.merchant || tx.category}
                </p>
                <div className="flex items-center gap-xs">
                  <span className="text-[var(--font-size-small)] text-text-secondary bg-[#F0F0F0] rounded-sm px-2 py-0.5">
                    {categoryNames[tx.category] ?? tx.category}
                  </span>
                  <span className="text-[var(--font-size-small)] text-text-secondary">
                    · {formatTime(tx.createdAt)}
                  </span>
                </div>
              </div>
              <p className="text-[var(--font-size-title)] font-semibold text-danger shrink-0">
                -${tx.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default RecentTransactions
