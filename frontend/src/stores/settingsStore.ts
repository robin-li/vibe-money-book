import { create } from 'zustand'
import api from '../lib/api.ts'

export type Persona = 'sarcastic' | 'gentle' | 'guilt_trip'
export type AIEngine = 'gemini' | 'openai'

export type KeyValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid'

interface SettingsState {
  /** 使用者 Profile（從後端載入） */
  persona: Persona
  aiEngine: AIEngine
  monthlyBudget: number
  userName: string
  userEmail: string
  aiInstructions: string

  /** 載入/更新狀態 */
  loading: boolean
  saving: boolean
  error: string | null

  /** API Key 驗證狀態 */
  keyValidationStatus: KeyValidationStatus

  /** 從後端載入使用者設定 */
  fetchProfile: () => Promise<void>
  /** 更新人設 */
  updatePersona: (persona: Persona) => Promise<void>
  /** 更新月預算 */
  updateBudget: (monthlyBudget: number) => Promise<void>
  /** 更新 AI 引擎 */
  updateAIEngine: (aiEngine: AIEngine) => Promise<void>
  /** 更新 AI 指示 */
  updateAIInstructions: (aiInstructions: string) => Promise<void>
  /** 驗證 API Key */
  validateApiKey: (apiKey: string) => Promise<boolean>
  /** 清除錯誤 */
  clearError: () => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  persona: 'gentle',
  aiEngine: 'gemini',
  monthlyBudget: 0,
  userName: '',
  userEmail: '',
  aiInstructions: '',
  loading: false,
  saving: false,
  error: null,
  keyValidationStatus: 'idle',

  fetchProfile: async () => {
    set({ loading: true, error: null })
    try {
      const res = await api.get('/users/profile')
      const d = res.data.data
      set({
        persona: d.persona ?? 'gentle',
        aiEngine: d.ai_engine ?? d.aiEngine ?? 'gemini',
        monthlyBudget: Number(d.monthly_budget ?? d.monthlyBudget ?? 0),
        userName: d.name ?? '',
        userEmail: d.email ?? '',
        aiInstructions: d.ai_instructions ?? '',
        loading: false,
      })
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

  validateApiKey: async (apiKey: string) => {
    set({ keyValidationStatus: 'validating' })
    try {
      await api.post('/ai/validate-key', {}, {
        headers: { 'X-LLM-API-Key': apiKey },
      })
      set({ keyValidationStatus: 'valid' })
      return true
    } catch {
      set({ keyValidationStatus: 'invalid' })
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
