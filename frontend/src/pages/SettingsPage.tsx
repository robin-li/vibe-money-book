import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore.ts'
import { useSettingsStore } from '../stores/settingsStore.ts'
import type { Persona, AIEngine, KeyValidationStatus } from '../stores/settingsStore.ts'

/** 人設選項定義 */
const PERSONA_OPTIONS: { value: Persona; label: string; emoji: string }[] = [
  { value: 'sarcastic', label: '毒舌', emoji: '🔥' },
  { value: 'gentle', label: '溫柔', emoji: '💖' },
  { value: 'guilt_trip', label: '情勒', emoji: '🥺' },
]

/** AI 引擎選項定義 */
const ENGINE_OPTIONS: { value: AIEngine; label: string; emoji: string; sub: string }[] = [
  { value: 'gemini', label: 'Gemini', emoji: '✨', sub: '(預設)' },
  { value: 'openai', label: 'OpenAI', emoji: '🤖', sub: '(GPT-4o-mini)' },
]

function SettingsPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  const {
    persona,
    aiEngine,
    monthlyBudget,
    userName,
    userEmail,
    loading,
    saving,
    error,
    keyValidationStatus,
    fetchProfile,
    updatePersona,
    updateBudget,
    updateAIEngine,
    validateApiKey,
    clearError,
  } = useSettingsStore()

  // Local state for budget input (so user can type freely)
  const [budgetInput, setBudgetInput] = useState('')
  const [budgetEditing, setBudgetEditing] = useState(false)

  // Local state for API key
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('llm_api_key') ?? '')
  const [showApiKey, setShowApiKey] = useState(false)

  // Load profile on mount and sync budget input
  useEffect(() => {
    fetchProfile().then(() => {
      const budget = useSettingsStore.getState().monthlyBudget
      if (budget > 0) setBudgetInput(String(budget))
    })
  }, [fetchProfile])

  const handleBudgetSave = useCallback(() => {
    const val = parseInt(budgetInput, 10)
    if (!isNaN(val) && val >= 0) {
      updateBudget(val)
    } else {
      // Reset to store value if invalid
      setBudgetInput(monthlyBudget > 0 ? String(monthlyBudget) : '')
    }
    setBudgetEditing(false)
  }, [budgetInput, updateBudget, monthlyBudget])

  const handleApiKeySave = useCallback(() => {
    localStorage.setItem('llm_api_key', apiKey)
  }, [apiKey])

  const handleValidateKey = useCallback(async () => {
    handleApiKeySave()
    await validateApiKey(apiKey)
  }, [apiKey, handleApiKeySave, validateApiKey])

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])

  const keyStatusText = (status: KeyValidationStatus) => {
    switch (status) {
      case 'validating': return '⏳ 驗證中...'
      case 'valid': return '✅ 金鑰有效'
      case 'invalid': return '❌ 金鑰無效'
      default: return null
    }
  }

  const keyStatusColor = (status: KeyValidationStatus) => {
    switch (status) {
      case 'valid': return 'text-success'
      case 'invalid': return 'text-danger'
      default: return 'text-text-secondary'
    }
  }

  if (loading) {
    return (
      <div className="p-2xl flex items-center justify-center min-h-[50vh]">
        <p className="text-body text-text-secondary">載入設定中...</p>
      </div>
    )
  }

  return (
    <div className="p-2xl">
      {/* Header */}
      <header className="h-14 flex items-center mb-lg">
        <h1 className="text-title font-semibold text-text-primary">
          ⚙️ 設定
        </h1>
        {saving && (
          <span className="ml-auto text-small text-text-secondary">儲存中...</span>
        )}
      </header>

      {/* Error banner */}
      {error && (
        <div
          className="bg-danger-light rounded-lg p-md mb-lg flex items-center justify-between"
          role="alert"
        >
          <span className="text-caption text-danger">{error}</span>
          <button
            onClick={clearError}
            className="text-danger text-caption font-semibold ml-md"
            aria-label="關閉錯誤"
          >
            ✕
          </button>
        </div>
      )}

      {/* 使用者資訊區 */}
      <section className="bg-surface rounded-lg shadow-card p-lg mb-xl" aria-label="使用者資訊">
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 bg-bg rounded-full flex items-center justify-center text-xl">
            👤
          </div>
          <div>
            <p className="text-body font-semibold text-text-primary">
              {userName || '使用者名稱'}
            </p>
            <p className="text-small text-text-secondary">
              {userEmail || 'user@email.com'}
            </p>
          </div>
        </div>
      </section>

      {/* AI 人設選擇 */}
      <section className="bg-surface rounded-lg shadow-card p-lg mb-xl" aria-label="AI 人設選擇">
        <h2 className="text-caption text-text-secondary mb-md">
          AI 人設選擇
        </h2>
        <div className="flex gap-md">
          {PERSONA_OPTIONS.map((opt) => {
            const selected = persona === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => updatePersona(opt.value)}
                disabled={saving}
                className={`w-[100px] h-[100px] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                  selected
                    ? 'bg-primary-light border-2 border-primary'
                    : 'bg-surface shadow-card hover:shadow-card-hover'
                }`}
                aria-pressed={selected}
                aria-label={`選擇${opt.label}人設`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-caption mt-xs">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 月預算設定 */}
      <section className="bg-surface rounded-lg shadow-card p-lg mb-xl" aria-label="月預算設定">
        <h2 className="text-caption text-text-secondary mb-md">
          月預算設定
        </h2>
        <div className="flex items-center gap-sm">
          <span className="text-body text-text-primary font-semibold">$</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={budgetInput}
            placeholder="輸入每月預算"
            onChange={(e) => {
              setBudgetInput(e.target.value)
              setBudgetEditing(true)
            }}
            onBlur={handleBudgetSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleBudgetSave()
            }}
            className="flex-1 h-12 rounded-md border border-border bg-bg px-lg text-body text-text-primary text-right focus:outline-none focus:border-primary"
            aria-label="每月預算金額"
          />
        </div>
        {monthlyBudget > 0 && !budgetEditing && (
          <p className="text-small text-text-secondary mt-sm">
            目前設定：${monthlyBudget.toLocaleString()}
          </p>
        )}
      </section>

      {/* AI 引擎設定 */}
      <section className="bg-surface rounded-lg shadow-card p-lg mb-xl" aria-label="AI 引擎設定">
        <h2 className="text-caption text-text-secondary mb-md">
          AI 引擎設定
        </h2>
        <div className="flex gap-md mb-lg">
          {ENGINE_OPTIONS.map((opt) => {
            const selected = aiEngine === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => updateAIEngine(opt.value)}
                disabled={saving}
                className={`flex-1 h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                  selected
                    ? 'bg-primary-light border-2 border-primary'
                    : 'bg-surface shadow-card hover:shadow-card-hover'
                }`}
                aria-pressed={selected}
                aria-label={`選擇 ${opt.label} 引擎`}
              >
                <span className="text-lg">{opt.emoji}</span>
                <span className="text-body font-semibold">{opt.label}</span>
                <span className="text-small text-text-secondary">{opt.sub}</span>
              </button>
            )
          })}
        </div>

        {/* API Key 輸入 */}
        <div className="mt-md">
          <label className="text-caption text-text-secondary mb-sm block">
            API Key
          </label>
          <div className="flex items-center gap-sm">
            <div className="relative flex-1">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  // Auto-save to localStorage on change
                  localStorage.setItem('llm_api_key', e.target.value)
                }}
                placeholder="輸入 API Key"
                className="w-full h-12 rounded-md border border-border bg-bg px-lg pr-12 text-body text-text-primary focus:outline-none focus:border-primary"
                aria-label="API Key 輸入"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                aria-label={showApiKey ? '隱藏 API Key' : '顯示 API Key'}
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
            <button
              onClick={handleValidateKey}
              disabled={!apiKey || keyValidationStatus === 'validating'}
              className="h-12 px-lg rounded-md bg-primary text-white text-caption font-semibold disabled:opacity-50 transition-all hover:bg-primary-dark"
              aria-label="驗證 API Key"
            >
              驗證
            </button>
          </div>
          {keyStatusText(keyValidationStatus) && (
            <p className={`text-caption mt-sm ${keyStatusColor(keyValidationStatus)}`} role="status">
              {keyStatusText(keyValidationStatus)}
            </p>
          )}
        </div>
      </section>

      {/* 登出按鈕 */}
      <button
        onClick={handleLogout}
        className="w-full h-12 bg-surface rounded-md text-danger font-semibold text-body shadow-card hover:shadow-card-hover transition-all"
        aria-label="登出"
      >
        登出
      </button>
    </div>
  )
}

export default SettingsPage
