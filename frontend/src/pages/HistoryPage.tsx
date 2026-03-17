function HistoryPage() {
  return (
    <div className="p-2xl">
      <header className="h-14 flex items-center justify-between mb-lg">
        <h1 className="text-[var(--font-size-title)] font-semibold text-text-primary">
          📋 記錄
        </h1>
      </header>

      <div className="flex gap-sm mb-xl">
        <button className="px-lg py-sm bg-bg rounded-xl text-[var(--font-size-caption)] text-text-secondary">
          全部類別
        </button>
        <button className="px-lg py-sm bg-bg rounded-xl text-[var(--font-size-caption)] text-text-secondary">
          本月
        </button>
      </div>

      <div className="text-center py-3xl">
        <p className="text-[var(--font-size-body)] text-text-tertiary">
          還沒有記帳紀錄，開始記帳吧！
        </p>
      </div>
    </div>
  )
}

export default HistoryPage
