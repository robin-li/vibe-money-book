import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — 可在此加入 auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 不應觸發自動登出的 API 路徑（登入/註冊本身回傳 401 屬正常業務錯誤）
const AUTH_WHITELIST = ['/auth/login', '/auth/register']

// Response interceptor — 統一錯誤處理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url ?? ''
      const isAuthRequest = AUTH_WHITELIST.some((path) => requestUrl.includes(path))

      if (!isAuthRequest) {
        // Token 失效：清除本地狀態並導向登入頁
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')

        // 重置 Zustand auth store（延遲 import 避免循環依賴）
        import('../stores/authStore.ts').then(({ useAuthStore }) => {
          useAuthStore.getState().logout()
        })

        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
