import { create } from 'zustand'
import type { User } from '../types/index.ts'
import api from '../lib/api.ts'
import i18n from '../i18n/index'
import type { SupportedLanguage } from '../i18n/index'

/** Auth API 回應資料結構 */
interface AuthResponseData {
  user: User & { language?: string }
  token: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  isInitialized: boolean

  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  restoreSession: () => void
  clearError: () => void
}

function restoreFromLocalStorage(): { user: User | null; token: string | null } {
  const token = localStorage.getItem('auth_token')
  const userJson = localStorage.getItem('auth_user')
  if (token && userJson) {
    try {
      const user = JSON.parse(userJson) as User
      return { user, token }
    } catch {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }
  return { user: null, token: null }
}

const initialSession = restoreFromLocalStorage()

export const useAuthStore = create<AuthState>((set) => ({
  user: initialSession.user,
  token: initialSession.token,
  loading: false,
  error: null,
  isInitialized: true,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post<{ data: AuthResponseData }>('/auth/login', {
        email,
        password,
      })
      const { user, token } = response.data.data
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))
      set({ user, token, loading: false, error: null })

      // Sync language from user profile (DB > localStorage > browser)
      const userLang = (response.data.data.user as { language?: string }).language
      if (userLang && ['zh-TW', 'en', 'zh-CN', 'vi'].includes(userLang)) {
        await i18n.changeLanguage(userLang as SupportedLanguage)
        localStorage.setItem('i18nextLng', userLang)
      }
    } catch (err: unknown) {
      const message = extractErrorMessage(err, i18n.t('auth:login.failed'))
      set({ loading: false, error: message })
      throw new Error(message)
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post<{ data: AuthResponseData }>('/auth/register', {
        name,
        email,
        password,
      })
      const { user, token } = response.data.data
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))
      set({ user, token, loading: false, error: null })
    } catch (err: unknown) {
      const message = extractErrorMessage(err, i18n.t('auth:register.failed'))
      set({ loading: false, error: message })
      throw new Error(message)
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    set({ user: null, token: null, error: null })
  },

  restoreSession: () => {
    const restored = restoreFromLocalStorage()
    set({ user: restored.user, token: restored.token, isInitialized: true })
  },

  clearError: () => {
    set({ error: null })
  },
}))

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string }; status?: number } })
      .response
    if (response?.data?.message) {
      return response.data.message
    }
    if (response?.status === 409) {
      return i18n.t('auth:emailTaken')
    }
    if (response?.status === 401) {
      return i18n.t('auth:wrongCredentials')
    }
  }
  return fallback
}
