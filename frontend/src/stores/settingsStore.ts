import { create } from 'zustand'
import i18n from '../i18n/index'
import type { SupportedLanguage } from '../i18n/index'
import api from '../lib/api.ts'

export type Persona = 'sarcastic' | 'gentle' | 'guilt_trip'
export type AIEngine = 'gemini' | 'openai' | 'anthropic' | 'xai'

export type KeyValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid'

export interface ModelInfo {
  id: string
  name: string
  description: string
  isDefault: boolean
}

export interface ProviderInfo {
  code: AIEngine
  name: string
  models: ModelInfo[]
}

interface SettingsState {
  /** 使用者 Profile（從後端載入） */
  persona: Persona
  aiEngine: AIEngine
  aiModel: string | null
  monthlyBudget: number
  userName: string
  userEmail: string
  aiInstructions: string
  language: SupportedLanguage

  /** 載入/更新狀態 */
  loading: boolean
  saving: boolean
  error: string | null

  /** API Key 驗證狀態 */
  keyValidationStatus: KeyValidationStatus
  /** 驗證錯誤訊息 */
  keyValidationMessage: string | null

  /** 後端是否配置了預設 API Key（按引擎） */
  hasDefaultKey: Record<string, boolean>

  /** 供應商與模型列表 */
  providers: ProviderInfo[]

  /** 動態模型列表（按引擎） */
  dynamicModels: Record<string, ModelInfo[]>
  /** 模型載入中 */
  modelsLoading: boolean

  /** 從後端載入使用者設定 */
  fetchProfile: () => Promise<void>
  /** 載入 AI 配置（預設 Key 狀態） */
  fetchAIConfig: () => Promise<void>
  /** 載入供應商與模型列表 */
  fetchProviders: () => Promise<void>
  /** 動態載入模型列表 */
  fetchModels: (engine: AIEngine, apiKey?: string) => Promise<void>
  /** 更新人設 */
  updatePersona: (persona: Persona) => Promise<void>
  /** 更新月預算 */
  updateBudget: (monthlyBudget: number) => Promise<void>
  /** 更新 AI 引擎 */
  updateAIEngine: (aiEngine: AIEngine) => Promise<void>
  /** 更新 AI 模型 */
  updateAIModel: (aiModel: string | null) => Promise<void>
  /** 更新 AI 指示 */
  updateAIInstructions: (aiInstructions: string) => Promise<void>
  /** 驗證 API Key */
  validateApiKey: (apiKey: string, engine?: AIEngine, model?: string) => Promise<boolean>
  /** 設定語言 */
  setLanguage: (language: SupportedLanguage) => Promise<void>
  /** 清除錯誤 */
  clearError: () => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  persona: 'gentle',
  aiEngine: 'openai',
  aiModel: null,
  monthlyBudget: 0,
  userName: '',
  userEmail: '',
  aiInstructions: '',
  language: (i18n.language as SupportedLanguage) || 'zh-TW',
  loading: false,
  saving: false,
  error: null,
  keyValidationStatus: 'idle',
  keyValidationMessage: null,
  hasDefaultKey: {},
  providers: [],
  dynamicModels: {},
  modelsLoading: false,

  fetchAIConfig: async () => {
    try {
      const res = await api.get('/ai/config')
      const data = res.data.data as { hasDefaultKey: Record<string, boolean> }
      set({ hasDefaultKey: data.hasDefaultKey })
    } catch { /* ignore */ }
  },

  fetchProviders: async () => {
    try {
      const res = await api.get('/ai/providers')
      const data = res.data.data as { providers: ProviderInfo[] }
      set({ providers: data.providers })
    } catch { /* ignore */ }
  },

  fetchModels: async (engine: AIEngine, apiKey?: string) => {
    set({ modelsLoading: true })
    try {
      const headers: Record<string, string> = {}
      if (apiKey) headers['X-LLM-API-Key'] = apiKey
      const res = await api.get(`/ai/models?engine=${engine}`, { headers })
      const data = res.data.data as { models: ModelInfo[]; dynamic: boolean }
      set((state) => ({
        dynamicModels: { ...state.dynamicModels, [engine]: data.models },
        modelsLoading: false,
      }))
    } catch {
      set({ modelsLoading: false })
    }
  },

  fetchProfile: async () => {
    set({ loading: true, error: null })
    try {
      const res = await api.get('/users/profile')
      const d = res.data.data
      const language = d.language as SupportedLanguage | undefined
      set({
        persona: d.persona ?? 'gentle',
        aiEngine: d.ai_engine ?? d.aiEngine ?? 'openai',
        aiModel: d.ai_model ?? d.aiModel ?? null,
        monthlyBudget: Number(d.monthly_budget ?? d.monthlyBudget ?? 0),
        userName: d.name ?? '',
        userEmail: d.email ?? '',
        aiInstructions: d.ai_instructions ?? '',
        loading: false,
      })
      // If DB has language preference, apply it (DB > localStorage > browser)
      if (language && language !== i18n.language) {
        await i18n.changeLanguage(language)
        set({ language })
      }
    } catch (err: unknown) {
      const message = extractErrorMessage(err, '載入設定失敗')
      set({ loading: false, error: message })
    }
  },

  updatePersona: async (persona: Persona) => {
    const prev = get().persona
    set({ persona, saving: true, error: null })
    try {
      await api.put('/users/profile', { persona })
      set({ saving: false })
    } catch (err: unknown) {
      const message = extractErrorMessage(err, '更新人設失敗')
      set({ persona: prev, saving: false, error: message })
    }
  },

  updateBudget: async (monthlyBudget: number) => {
    const prev = get().monthlyBudget
    set({ monthlyBudget, saving: true, error: null })
    try {
      await api.put('/users/profile', { monthly_budget: monthlyBudget })
      set({ saving: false })
    } catch (err: unknown) {
      const message = extractErrorMessage(err, '更新預算失敗')
      set({ monthlyBudget: prev, saving: false, error: message })
    }
  },

  updateAIEngine: async (aiEngine: AIEngine) => {
    const prev = get().aiEngine
    set({ aiEngine, saving: true, error: null })
    try {
      await api.put('/users/profile', { ai_engine: aiEngine })
      set({ saving: false })
    } catch (err: unknown) {
      const message = extractErrorMessage(err, '更新 AI 引擎失敗')
      set({ aiEngine: prev, saving: false, error: message })
    }
  },

  updateAIModel: async (aiModel: string | null) => {
    const prev = get().aiModel
    set({ aiModel, saving: true, error: null })
    try {
      await api.put('/users/profile', { ai_model: aiModel })
      set({ saving: false })
    } catch (err: unknown) {
      const message = extractErrorMessage(err, '更新 AI 模型失敗')
      set({ aiModel: prev, saving: false, error: message })
    }
  },

  updateAIInstructions: async (aiInstructions: string) => {
    const prev = get().aiInstructions
    set({ aiInstructions, saving: true, error: null })
    try {
      await api.put('/users/profile', { ai_instructions: aiInstructions || null })
      set({ saving: false })
    } catch (err: unknown) {
      const message = extractErrorMessage(err, '更新 AI 指示失敗')
      set({ aiInstructions: prev, saving: false, error: message })
    }
  },

  setLanguage: async (language: SupportedLanguage) => {

    set({ language })
    // Immediately switch UI language
    await i18n.changeLanguage(language)
    // Persist to localStorage (handled by i18next detection)
    localStorage.setItem('i18nextLng', language)
    // If logged in, sync to DB
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        await api.put('/users/profile', { language })
      }
    } catch {
      // Don't revert language on API failure - local change is still valid
    }
  },

  validateApiKey: async (apiKey: string, engine?: AIEngine, model?: string) => {
    set({ keyValidationStatus: 'validating', keyValidationMessage: null })
    try {
      const body: Record<string, string> = {}
      if (engine) body.engine = engine
      if (model) body.model = model
      await api.post('/ai/validate-key', body, {
        headers: { 'X-LLM-API-Key': apiKey },
        timeout: 30000,
      })
      set({ keyValidationStatus: 'valid', keyValidationMessage: null })
      return true
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? null
      set({ keyValidationStatus: 'invalid', keyValidationMessage: message })
      return false
    }
  },

  clearError: () => set({ error: null }),
}))

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) {
      return response.data.message
    }
  }
  return fallback
}
