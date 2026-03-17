function DashboardPage() {
  return (
    <div className="p-2xl">
      <header className="flex items-center justify-between h-14 mb-lg">
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-surface text-lg">
            💰
          </div>
          <div>
            <h1 className="text-[var(--font-size-title)] font-semibold text-text-primary leading-tight">
              Vibe Money Book
            </h1>
            <p className="text-[var(--font-size-small)] text-text-secondary tracking-[2px]">
              語音記帳教練
            </p>
          </div>
        </div>
      </header>

      <section
        className="bg-surface rounded-lg shadow-card p-lg mb-xl"
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

      <section
        className="bg-primary-light rounded-lg p-lg mb-xl"
        aria-label="AI 回饋"
      >
        <p className="text-[var(--font-size-caption)] text-text-secondary mb-xs">
          溫柔管家 💖 的即時回饋
        </p>
        <p className="text-[var(--font-size-body)] text-primary-dark">
          「歡迎使用 Vibe Money Book！開始記錄你的第一筆消費吧～」
        </p>
      </section>

      <section aria-label="最近帳目">
        <h2 className="text-[var(--font-size-title)] font-semibold text-text-primary mb-md">
          🕐 最近帳目
        </h2>
        <p className="text-[var(--font-size-body)] text-text-tertiary text-center py-3xl">
          還沒有記帳紀錄，開始記帳吧！
        </p>
      </section>
    </div>
  )
}

export default DashboardPage
