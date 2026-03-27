import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocaleFormatter } from '../hooks/useLocaleFormatter'
import { useAuthStore } from '../stores/authStore.ts'
import { useSettingsStore } from '../stores/settingsStore.ts'
import { useDashboardStore } from '../stores/dashboardStore.ts'
import type { CategoryInfo } from '../stores/dashboardStore.ts'
import type { Persona, AIEngine, KeyValidationStatus } from '../stores/settingsStore.ts'
import { getCategoryName, getCategoryTypeColorClass } from '../lib/categoryUtils.ts'

import type { SupportedLanguage } from '../i18n/index'

/** 人設選項定義 */
const PERSONA_OPTIONS: { value: Persona; emoji: string }[] = [
  { value: 'sarcastic', emoji: '🔥' },
  { value: 'gentle', emoji: '💖' },
  { value: 'guilt_trip', emoji: '🥺' },
]

/** AI 引擎選項定義 */
const ENGINE_OPTIONS: { value: AIEngine; label: string; emoji: string }[] = [
  { value: 'openai', label: 'OpenAI', emoji: '🤖' },
  { value: 'gemini', label: 'Gemini', emoji: '✨' },
  { value: 'anthropic', label: 'Anthropic', emoji: '🧠' },
  { value: 'xai', label: 'xAI', emoji: '⚡' },
]

/** 語言選項（含國旗 emoji） */
const LANGUAGE_OPTIONS: { value: SupportedLanguage; labelKey: string; flag: string }[] = [
  { value: 'zh-TW', labelKey: 'language.zhTW', flag: '🇹🇼' },
  { value: 'en', labelKey: 'language.en', flag: '🇺🇸' },
  { value: 'zh-CN', labelKey: 'language.zhCN', flag: '🇨🇳' },
  { value: 'vi', labelKey: 'language.vi', flag: '🇻🇳' },
]

function SettingsPage() {
  const { t } = useTranslation('settings')
  const { formatCurrency } = useLocaleFormatter()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  const {
    persona,
    aiEngine,
    aiModel,
    monthlyBudget,
    userName,
    userEmail,
    aiInstructions,
    language,
    loading,
    saving,
    error,
    keyValidationStatus,
    keyValidationMessage,
    hasDefaultKey,
    providers,
    dynamicModels,
    modelsLoading,
    fetchProfile,
    fetchAIConfig,
    fetchProviders,
    fetchModels,
    updatePersona,
    updateBudget,
    updateAIEngine,
    updateAIModel,
    updateAIInstructions,
    setLanguage,
    validateApiKey,
    clearError,
  } = useSettingsStore()

  const [aiInstructionsInput, setAiInstructionsInput] = useState(aiInstructions)
  const [aiInstructionsEditing, setAiInstructionsEditing] = useState(false)

  const [budgetInput, setBudgetInput] = useState(() =>
    monthlyBudget > 0 ? String(monthlyBudget) : ''
  )
  const [budgetEditing, setBudgetEditing] = useState(false)

  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('llm_api_keys')
      if (stored) return JSON.parse(stored)
    } catch { /* ignore */ }
    const legacy = localStorage.getItem('llm_api_key')
    if (legacy) {
      const migrated = { gemini: legacy, openai: '', anthropic: '', xai: '' }
      localStorage.setItem('llm_api_keys', JSON.stringify(migrated))
      localStorage.removeItem('llm_api_key')
      return migrated
    }
    return { gemini: '', openai: '', anthropic: '', xai: '' }
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const currentApiKey = apiKeys[aiEngine] ?? ''

  // Current provider's available models (prefer dynamic models if available)
  const currentProviderModels = useMemo(() => {
    if (dynamicModels[aiEngine]?.length) return dynamicModels[aiEngine]
    return providers.find((p) => p.code === aiEngine)?.models ?? []
  }, [providers, dynamicModels, aiEngine])

  // Selected model (use aiModel from store, fallback to default model)
  const selectedModel = useMemo(() => {
    if (aiModel && currentProviderModels.some((m) => m.id === aiModel)) {
      return aiModel
    }
    return currentProviderModels.find((m) => m.isDefault)?.id ?? currentProviderModels[0]?.id ?? ''
  }, [aiModel, currentProviderModels])

  // Selected model description
  const selectedModelDescription = useMemo(() => {
    return currentProviderModels.find((m) => m.id === selectedModel)?.description ?? ''
  }, [currentProviderModels, selectedModel])

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchProfile(), fetchAIConfig(), fetchProviders()])
      const state = useSettingsStore.getState()
      if (state.monthlyBudget > 0) setBudgetInput(String(state.monthlyBudget))
      setAiInstructionsInput(state.aiInstructions)
      // Fetch dynamic models for current engine if API key exists
      const keys = apiKeys
      const currentKey = keys[state.aiEngine] ?? ''
      if (currentKey || state.hasDefaultKey[state.aiEngine]) {
        fetchModels(state.aiEngine, currentKey || undefined)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProfile, fetchAIConfig, fetchProviders, fetchModels])

  const handleEngineChange = useCallback(async (engine: AIEngine) => {
    await updateAIEngine(engine)
    useSettingsStore.setState({ keyValidationStatus: 'idle' })
    // Fetch dynamic models for new engine
    const key = apiKeys[engine] ?? ''
    const state = useSettingsStore.getState()
    if (key || state.hasDefaultKey[engine]) {
      await fetchModels(engine, key || undefined)
    }
    // Auto-select default model
    const models = useSettingsStore.getState().dynamicModels[engine]
      ?? state.providers.find((p) => p.code === engine)?.models ?? []
    const defaultModel = models.find((m) => m.isDefault)
    if (defaultModel) {
      await updateAIModel(defaultModel.id)
    } else {
      await updateAIModel(null)
    }
  }, [updateAIEngine, updateAIModel, fetchModels, apiKeys])

  const handleModelChange = useCallback(async (modelId: string) => {
    await updateAIModel(modelId)
    // Auto-validate with new model if API key exists
    const key = apiKeys[aiEngine] ?? ''
    if (key) {
      await validateApiKey(key, aiEngine, modelId)
    }
  }, [updateAIModel, apiKeys, aiEngine, validateApiKey])

  const handleBudgetSave = useCallback(() => {
    const val = parseInt(budgetInput, 10)
    if (!isNaN(val) && val >= 0) {
      updateBudget(val)
    } else {
      setBudgetInput(monthlyBudget > 0 ? String(monthlyBudget) : '')
    }
    setBudgetEditing(false)
  }, [budgetInput, updateBudget, monthlyBudget])

  const handleAiInstructionsSave = useCallback(() => {
    if (aiInstructionsInput !== aiInstructions) {
      updateAIInstructions(aiInstructionsInput)
    }
    setAiInstructionsEditing(false)
  }, [aiInstructionsInput, aiInstructions, updateAIInstructions])

  const saveApiKeys = useCallback((keys: Record<string, string>) => {
    localStorage.setItem('llm_api_keys', JSON.stringify(keys))
  }, [])

  const handleValidateKey = useCallback(async () => {
    saveApiKeys(apiKeys)
    const valid = await validateApiKey(currentApiKey, aiEngine, selectedModel || undefined)
    if (valid && currentApiKey) {
      // Fetch dynamic models after successful validation
      await fetchModels(aiEngine, currentApiKey)
    }
  }, [currentApiKey, apiKeys, saveApiKeys, validateApiKey, aiEngine, selectedModel, fetchModels])

  const handleLanguageChange = useCallback(async (lang: SupportedLanguage) => {
    await setLanguage(lang)
  }, [setLanguage])

  // Category management
  const categoryInfoList = useDashboardStore((s) => s.categoryInfoList)
  const fetchCategories = useDashboardStore((s) => s.fetchCategories)
  const createCategoryAction = useDashboardStore((s) => s.createCategory)
  const deleteCategoryAction = useDashboardStore((s) => s.deleteCategory)

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense')
  const [categoryAdding, setCategoryAdding] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const expenseCategories = categoryInfoList.filter((c: CategoryInfo) => c.type === 'expense')
  const incomeCategories = categoryInfoList.filter((c: CategoryInfo) => c.type === 'income')

  const handleAddCategory = useCallback(async () => {
    if (!newCategoryName.trim()) return
    setCategoryAdding(true)
    try {
      await createCategoryAction(newCategoryName.trim(), newCategoryType)
      setNewCategoryName('')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (msg) {
        alert(msg)
      }
    } finally {
      setCategoryAdding(false)
    }
  }, [newCategoryName, newCategoryType, createCategoryAction])

  const handleDeleteCategory = useCallback(async (category: string, type: 'income' | 'expense') => {
    const name = getCategoryName(category)
    if (!window.confirm(t('categories.deleteConfirm', { name }))) return
    try {
      await deleteCategoryAction(category, type)
    } catch {
      // Error handled by store
    }
  }, [deleteCategoryAction, t])

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])

  const keyStatusText = (status: KeyValidationStatus) => {
    switch (status) {
      case 'validating': return t('aiEngine.validating')
      case 'valid': return t('aiEngine.valid')
      case 'invalid': return keyValidationMessage || t('aiEngine.invalid')
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
        <p className="text-body text-text-secondary">{t('loadingSettings')}</p>
      </div>
    )
  }

  return (
    <div className="p-2xl">
      {/* Header */}
      <header className="h-14 flex items-center mb-lg">
        <h1 className="text-title font-semibold text-text-primary">
          ⚙️ {t('title')}
        </h1>
        {saving && (
          <span className="ml-auto text-small text-text-secondary">{t('common:saving')}</span>
        )}
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-danger-light rounded-lg p-md mb-lg flex items-center justify-between" role="alert">
          <span className="text-caption text-danger">{error}</span>
          <button onClick={clearError} className="text-danger text-caption font-semibold ml-md" aria-label={t('closeError')}>
            ✕
          </button>
        </div>
      )}

      {/* 使用者資訊區 */}
      <section className="bg-surface rounded-lg shadow-card p-lg mb-xl" aria-label={t('userInfo.title')}>
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 bg-bg rounded-full flex items-center justify-center text-xl">
            👤
          </div>
          <div>
            <p className="text-body font-semibold text-text-primary">
              {userName || t('userInfo.defaultName')}
            </p>
            <p className="text-small text-text-secondary">
              {userEmail || 'user@email.com'}
            </p>
          </div>
        </div>
      </section>

      {/* 語言設定 (T-606) */}
      <section className="bg-surface rounded-lg shadow-card p-lg mb-xl" aria-label={t('language.title')}>
        <h2 className="text-caption text-text-secondary mb-md">
          {t('language.title')}
        </h2>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
          className="w-full px-lg py-sm rounded-lg text-body bg-surface border-2 border-primary appearance-none cursor-pointer"
          aria-label={t('language.title')}
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.flag} {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </section>

      {/* AI 人設選擇 */}
      <section className="bg-surface rounded-lg shadow-card p-lg mb-xl" aria-label={t('persona.title')}>
        <h2 className="text-caption text-text-secondary mb-md">
          {t('persona.title')}
        </h2>
        <div className="flex gap-md">
          {PERSONA_OPTIONS.map((opt) => {
            const selected = persona === opt.value
            const label = t(`persona.${opt.value}`)
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
                aria-label={t('persona.selectLabel', { label })}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-caption mt-xs">{label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* AI 指示 */}
      <section className="bg-surface rounded-lg shadow-card p-lg mb-xl" aria-label={t('aiInstructions.title')}>
        <h2 className="text-caption text-text-secondary mb-md">
          {t('aiInstructions.title')}
        </h2>
        <textarea
          value={aiInstructionsInput}
          onChange={(e) => { setAiInstructionsInput(e.target.value); setAiInstructionsEditing(true) }}
          onBlur={handleAiInstructionsSave}
          placeholder={t('aiInstructions.placeholder')}
          maxLength={1000}
          rows={5}
          className="w-full rounded-md border border-border bg-bg px-lg py-md text-body text-text-primary resize-none focus:outline-none focus:border-primary"
          aria-label={t('aiInstructions.label')}
        />
        <div className="flex justify-between items-center mt-sm">
          <p className="text-small text-text-secondary">{aiInstructionsInput.length}/1000</p>
          {aiInstructionsEditing && (
            <button onClick={handleAiInstructionsSave} disabled={saving}
              className="h-9 px-lg rounded-md bg-primary text-white text-caption font-semibold disabled:opacity-50 transition-all hover:bg-primary-dark"
              aria-label={t('aiInstructions.saveLabel')}>
              {t('common:save')}
            </button>
          )}
        </div>
      </section>

      {/* 月預算設定 */}
      <section className="bg-surface rounded-lg shadow-card p-lg mb-xl" aria-label={t('budget.title')}>
        <h2 className="text-caption text-text-secondary mb-md">{t('budget.title')}</h2>
        <div className="flex items-center gap-sm">
          <span className="text-body text-text-primary font-semibold">$</span>
          <input type="number" inputMode="numeric" min="0" value={budgetInput} placeholder={t('budget.placeholder')}
            onChange={(e) => { setBudgetInput(e.target.value); setBudgetEditing(true) }}
            onBlur={handleBudgetSave}
            onKeyDown={(e) => { if (e.key === 'Enter') handleBudgetSave() }}
            className="flex-1 h-12 rounded-md border border-border bg-bg px-lg text-body text-text-primary text-right focus:outline-none focus:border-primary"
            aria-label={t('budget.label')} />
        </div>
        {monthlyBudget > 0 && !budgetEditing && (
          <p className="text-small text-text-secondary mt-sm">
            {t('budget.currentSetting')}：{formatCurrency(monthlyBudget)}
          </p>
        )}
      </section>

      {/* AI 引擎設定 */}
      <section className="bg-surface rounded-lg shadow-card p-lg mb-xl" aria-label={t('aiEngine.title')}>
        <h2 className="text-caption text-text-secondary mb-md">{t('aiEngine.title')}</h2>

        {/* 供應商選擇 */}
        <div className="grid grid-cols-2 gap-md mb-lg">
          {ENGINE_OPTIONS.map((opt) => {
            const selected = aiEngine === opt.value
            return (
              <button key={opt.value}
                onClick={() => handleEngineChange(opt.value)}
                disabled={saving}
                className={`h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                  selected ? 'bg-primary-light border-2 border-primary' : 'bg-surface shadow-card hover:shadow-card-hover'
                }`}
                aria-pressed={selected}
                aria-label={t('aiEngine.selectLabel', { label: opt.label })}>
                <span className="text-lg">{opt.emoji}</span>
                <span className="text-body font-semibold">{opt.label}</span>
                {opt.value === 'openai' && <span className="text-small text-text-secondary">{t('aiEngine.default')}</span>}
              </button>
            )
          })}
        </div>

        {/* API Key 輸入 */}
        <div className="mt-md">
          <label className="text-caption text-text-secondary mb-sm block">
            {t('aiEngine.apiKeyLabel', { engine: ENGINE_OPTIONS.find((e) => e.value === aiEngine)?.label })}
          </label>
          <div className="flex items-center gap-sm">
            <div className="relative flex-1">
              <input type={showApiKey ? 'text' : 'password'} value={currentApiKey}
                onChange={(e) => { const updated = { ...apiKeys, [aiEngine]: e.target.value }; setApiKeys(updated); saveApiKeys(updated) }}
                placeholder={t('aiEngine.apiKeyPlaceholder', { engine: ENGINE_OPTIONS.find((e) => e.value === aiEngine)?.label })}
                className="w-full h-12 rounded-md border border-border bg-bg px-lg pr-12 text-body text-text-primary focus:outline-none focus:border-primary"
                aria-label={t('aiEngine.apiKeyLabel', { engine: aiEngine })} />
              <button type="button" onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                aria-label={showApiKey ? t('aiEngine.hideApiKey') : t('aiEngine.showApiKey')}>
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
            <button onClick={handleValidateKey} disabled={!currentApiKey || keyValidationStatus === 'validating'}
              className="h-12 px-lg rounded-md bg-primary text-white text-caption font-semibold disabled:opacity-50 transition-all hover:bg-primary-dark"
              aria-label={t('aiEngine.validateLabel')}>
              {t('aiEngine.validate')}
            </button>
          </div>
          {keyStatusText(keyValidationStatus) && (
            <p className={`text-caption mt-sm ${keyStatusColor(keyValidationStatus)}`} role="status">
              {keyStatusText(keyValidationStatus)}
            </p>
          )}
          {!currentApiKey && hasDefaultKey[aiEngine] && (
            <p className="text-caption mt-sm text-green-600">
              {t('aiEngine.defaultKeyConfigured')}
            </p>
          )}
        </div>

        {/* 模型選擇 */}
        {currentProviderModels.length > 0 && (
          <div className="mt-lg">
            <label className="text-caption text-text-secondary mb-sm block">
              {t('aiEngine.modelLabel')}
              {modelsLoading && <span className="ml-sm text-text-tertiary">{t('loading')}</span>}
            </label>
            <select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={saving || modelsLoading}
              className="w-full h-12 rounded-md border border-border bg-bg px-lg text-body text-text-primary focus:outline-none focus:border-primary disabled:opacity-50"
              aria-label={t('aiEngine.modelLabel')}>
              {currentProviderModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.isDefault ? t('aiEngine.recommended') : ''}
                </option>
              ))}
            </select>
            {selectedModelDescription && (
              <p className="text-small text-text-secondary mt-sm">
                {selectedModelDescription}
              </p>
            )}
          </div>
        )}
      </section>

      {/* 類別管理 */}
      <section className="bg-surface rounded-lg shadow-card p-lg mb-xl" aria-label={t('categories.title')}>
        <h2 className="text-caption text-text-secondary mb-md">{t('categories.title')}</h2>

        <div className="mb-lg">
          <h3 className="text-body font-semibold text-danger mb-sm">{t('categories.expenseCategories')}</h3>
          <div className="flex flex-wrap gap-sm">
            {expenseCategories.map((c: CategoryInfo) => (
              <span key={c.category} className={`px-md py-xs rounded-md text-caption ${getCategoryTypeColorClass('expense')} bg-[#FFF0F0] inline-flex items-center gap-xs`}>
                {getCategoryName(c.category)}
                {c.isCustom && (
                  <button type="button" onClick={() => handleDeleteCategory(c.category, 'expense')}
                    className="ml-xs text-danger hover:text-red-700 font-bold leading-none"
                    aria-label={t('categories.deleteCategoryLabel', { name: getCategoryName(c.category) })}>
                    ✕
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-lg">
          <h3 className="text-body font-semibold text-success mb-sm">{t('categories.incomeCategories')}</h3>
          <div className="flex flex-wrap gap-sm">
            {incomeCategories.map((c: CategoryInfo) => (
              <span key={c.category} className={`px-md py-xs rounded-md text-caption ${getCategoryTypeColorClass('income')} bg-[#F0FFF0] inline-flex items-center gap-xs`}>
                {getCategoryName(c.category)}
                {c.isCustom && (
                  <button type="button" onClick={() => handleDeleteCategory(c.category, 'income')}
                    className="ml-xs text-danger hover:text-red-700 font-bold leading-none"
                    aria-label={t('categories.deleteCategoryLabel', { name: getCategoryName(c.category) })}>
                    ✕
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-md">
          <p className="text-caption text-text-secondary mb-sm">{t('categories.addCustom')}</p>
          <div className="flex gap-sm items-center overflow-hidden">
            <select value={newCategoryType} onChange={(e) => setNewCategoryType(e.target.value as 'income' | 'expense')}
              className="h-9 flex-shrink-0 rounded-md border border-border px-sm text-caption"
              aria-label={t('categories.newCategoryType')}>
              <option value="expense">{t('common:expense')}</option>
              <option value="income">{t('common:income')}</option>
            </select>
            <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={t('categories.categoryName')} className="flex-1 min-w-0 h-9 rounded-md border border-border px-sm text-body"
              aria-label={t('categories.categoryName')}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory() }} />
            <button type="button" onClick={handleAddCategory} disabled={categoryAdding || !newCategoryName.trim()}
              className="h-9 px-lg flex-shrink-0 min-w-[80px] whitespace-nowrap rounded-md bg-primary text-white text-caption font-semibold disabled:opacity-50"
              aria-label={t('categories.addCategory')}>
              {categoryAdding ? t('common:adding') : t('common:add')}
            </button>
          </div>
        </div>
      </section>

      {/* 登出按鈕 */}
      <button onClick={handleLogout}
        className="w-full h-12 bg-surface rounded-md text-danger font-semibold text-body shadow-card hover:shadow-card-hover transition-all"
        aria-label={t('common:logout')}>
        {t('common:logout')}
      </button>
    </div>
  )
}

export default SettingsPage
