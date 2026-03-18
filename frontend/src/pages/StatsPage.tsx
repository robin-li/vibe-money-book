function StatsPage() {
  return (
    <div className="p-2xl">
      <header className="h-14 flex items-center mb-lg">
        <h1 className="text-title font-semibold text-text-primary">
          📊 統計
        </h1>
      </header>

      <section
        className="bg-surface rounded-lg shadow-card p-lg mb-xl"
        aria-label="本月總支出"
      >
        <p className="text-caption text-text-secondary mb-xs">
          本月總支出
        </p>
        <p className="text-headline font-bold text-danger">
          $0
        </p>
      </section>

      <section aria-label="消費分佈" className="text-center py-3xl">
        <div className="w-[200px] h-[200px] mx-auto border-2 border-dashed border-text-tertiary rounded-full flex items-center justify-center mb-lg">
          <p className="text-body text-text-tertiary">
            本月尚無消費記錄
          </p>
        </div>
      </section>
    </div>
  )
}

export default StatsPage
