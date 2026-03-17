import { create } from 'zustand'
import type { User } from '../types/index.ts'
import api from '../lib/api.ts'

/** Auth API 回應資料結構 */
interface AuthResponseData {
  user: User
  token: string
}

interface AuthState {
  /** 當前使用者 */
  user: User | null
  /** JWT Token */
  token: string | null
  /** 是否正在載入（登入/註冊中） */
  loading: boolean
  /** 錯誤訊息 */
  error: string | null

  /** 登入 */
  login: (email: string, password: string) => Promise<void>
  /** 註冊 */
  register: (name: string, email: string, password: string) => Promise<void>
  /** 登出 */
  logout: () => void
  /** 從 localStorage 恢復登入狀態 */
  restoreSession: () => void
  /** 清除錯誤訊息 */
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

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
    } catch (err: unknown) {
      const message = extractErrorMessage(err, '登入失敗，請檢查帳號密碼')
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
      const message = extractErrorMessage(err, '註冊失敗，請稍後再試')
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
    const token = localStorage.getItem('auth_token')
    const userJson = localStorage.getItem('auth_user')
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User
        set({ user, token })
      } catch {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))

/** 從 axios error 中提取錯誤訊息 */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string }; status?: number } })
      .response
    if (response?.data?.message) {
      return response.data.message
    }
    if (response?.status === 409) {
      return 'Email 已被註冊'
    }
    if (response?.status === 401) {
      return '帳號或密碼錯誤'
    }
  }
  return fallback
}
