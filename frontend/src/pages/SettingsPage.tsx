function SettingsPage() {
  return (
    <div className="p-2xl">
      <header className="h-14 flex items-center mb-lg">
        <h1 className="text-title font-semibold text-text-primary">
          ⚙️ 設定
        </h1>
      </header>

      <section className="bg-surface rounded-lg shadow-card p-lg mb-xl" aria-label="使用者資訊">
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 bg-bg rounded-full flex items-center justify-center text-xl">
            👤
          </div>
          <div>
            <p className="text-body font-semibold text-text-primary">
              使用者名稱
            </p>
            <p className="text-small text-text-secondary">
              user@email.com
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface rounded-lg shadow-card p-lg mb-xl" aria-label="AI 人設選擇">
        <h2 className="text-caption text-text-secondary mb-md">
          AI 人設選擇
        </h2>
        <div className="flex gap-md">
          <div className="w-[100px] h-[100px] bg-surface rounded-lg shadow-card flex flex-col items-center justify-center cursor-pointer">
            <span className="text-2xl">🔥</span>
            <span className="text-caption mt-xs">毒舌</span>
          </div>
          <div className="w-[100px] h-[100px] bg-primary-light rounded-lg border-2 border-primary flex flex-col items-center justify-center cursor-pointer">
            <span className="text-2xl">💖</span>
            <span className="text-caption mt-xs">溫柔</span>
          </div>
          <div className="w-[100px] h-[100px] bg-surface rounded-lg shadow-card flex flex-col items-center justify-center cursor-pointer">
            <span className="text-2xl">🥺</span>
            <span className="text-caption mt-xs">情勒</span>
          </div>
        </div>
      </section>

      <section className="bg-surface rounded-lg shadow-card p-lg mb-xl" aria-label="月預算設定">
        <h2 className="text-caption text-text-secondary mb-md">
          月預算設定
        </h2>
        <p className="text-body text-text-tertiary">
          尚未設定預算
        </p>
      </section>

      <section className="bg-surface rounded-lg shadow-card p-lg mb-xl" aria-label="AI 引擎設定">
        <h2 className="text-caption text-text-secondary mb-md">
          AI 引擎設定
        </h2>
        <div className="flex gap-md">
          <div className="flex-1 h-20 bg-primary-light rounded-lg border-2 border-primary flex flex-col items-center justify-center cursor-pointer">
            <span className="text-lg">✨</span>
            <span className="text-body font-semibold">Gemini</span>
            <span className="text-small text-text-secondary">(預設)</span>
          </div>
          <div className="flex-1 h-20 bg-surface rounded-lg shadow-card flex flex-col items-center justify-center cursor-pointer">
            <span className="text-lg">🤖</span>
            <span className="text-body font-semibold">OpenAI</span>
            <span className="text-small text-text-secondary">(GPT-4o-mini)</span>
          </div>
        </div>
      </section>

      <button className="w-full h-12 bg-surface rounded-md text-danger font-semibold text-body shadow-card">
        登出
      </button>
    </div>
  )
}

export default SettingsPage
