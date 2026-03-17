import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../stores/authStore.ts'

// Mock the api module
vi.mock('../lib/api.ts', () => {
  return {
    default: {
      post: vi.fn(),
    },
  }
})

// Helper to get a fresh api mock
async function getApiMock() {
  const mod = await import('../lib/api.ts')
  return mod.default as unknown as { post: ReturnType<typeof vi.fn> }
}

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      token: null,
      loading: false,
      error: null,
    })
    // Clear localStorage
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('starts with null user and token', () => {
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('login', () => {
    it('sets user and token on successful login', async () => {
      const mockUser = {
        id: '1',
        name: 'Test',
        email: 'test@example.com',
        persona: 'gentle' as const,
        aiEngine: 'gemini' as const,
        monthlyBudget: 20000,
        currency: 'TWD',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      }
      const mockToken = 'jwt-token-123'

      const api = await getApiMock()
      api.post.mockResolvedValueOnce({
        data: { data: { user: mockUser, token: mockToken } },
      })

      await useAuthStore.getState().login('test@example.com', 'password123')

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe(mockToken)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
      expect(localStorage.getItem('auth_token')).toBe(mockToken)
      expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(mockUser))
    })

    it('sets error on failed login', async () => {
      const api = await getApiMock()
      api.post.mockRejectedValueOnce({
        response: { status: 401, data: { message: '帳號或密碼錯誤' } },
      })

      await expect(
        useAuthStore.getState().login('wrong@example.com', 'wrongpass'),
      ).rejects.toThrow('帳號或密碼錯誤')

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.loading).toBe(false)
      expect(state.error).toBe('帳號或密碼錯誤')
    })

    it('sets loading during login', async () => {
      const api = await getApiMock()
      let resolvePromise: (value: unknown) => void
      api.post.mockReturnValueOnce(
        new Promise((resolve) => {
          resolvePromise = resolve
        }),
      )

      const loginPromise = useAuthStore.getState().login('test@example.com', 'password123')
      expect(useAuthStore.getState().loading).toBe(true)

      resolvePromise!({
        data: {
          data: {
            user: { id: '1', name: 'Test', email: 'test@example.com' },
            token: 'token',
          },
        },
      })
      await loginPromise
      expect(useAuthStore.getState().loading).toBe(false)
    })
  })

  describe('register', () => {
    it('sets user and token on successful registration', async () => {
      const mockUser = {
        id: '2',
        name: 'New User',
        email: 'new@example.com',
        persona: 'gentle' as const,
        aiEngine: 'gemini' as const,
        monthlyBudget: 0,
        currency: 'TWD',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      }
      const mockToken = 'jwt-token-456'

      const api = await getApiMock()
      api.post.mockResolvedValueOnce({
        data: { data: { user: mockUser, token: mockToken } },
      })

      await useAuthStore.getState().register('New User', 'new@example.com', 'password123')

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe(mockToken)
      expect(state.loading).toBe(false)
      expect(localStorage.getItem('auth_token')).toBe(mockToken)
    })

    it('sets error on failed registration (409 conflict)', async () => {
      const api = await getApiMock()
      api.post.mockRejectedValueOnce({
        response: { status: 409, data: {} },
      })

      await expect(
        useAuthStore.getState().register('User', 'exists@example.com', 'password123'),
      ).rejects.toThrow('Email 已被註冊')

      expect(useAuthStore.getState().error).toBe('Email 已被註冊')
    })
  })

  describe('logout', () => {
    it('clears user, token, and localStorage', () => {
      useAuthStore.setState({
        user: { id: '1', name: 'Test', email: 'test@example.com' } as never,
        token: 'token-123',
      })
      localStorage.setItem('auth_token', 'token-123')
      localStorage.setItem('auth_user', '{}')

      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('auth_user')).toBeNull()
    })
  })

  describe('restoreSession', () => {
    it('restores user and token from localStorage', () => {
      const mockUser = {
        id: '1',
        name: 'Test',
        email: 'test@example.com',
        persona: 'gentle',
        aiEngine: 'gemini',
        monthlyBudget: 20000,
        currency: 'TWD',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      }
      localStorage.setItem('auth_token', 'saved-token')
      localStorage.setItem('auth_user', JSON.stringify(mockUser))

      useAuthStore.getState().restoreSession()

      const state = useAuthStore.getState()
      expect(state.token).toBe('saved-token')
      expect(state.user).toEqual(mockUser)
    })

    it('does nothing if no stored session', () => {
      useAuthStore.getState().restoreSession()

      const state = useAuthStore.getState()
      expect(state.token).toBeNull()
      expect(state.user).toBeNull()
    })

    it('clears invalid JSON from localStorage', () => {
      localStorage.setItem('auth_token', 'some-token')
      localStorage.setItem('auth_user', 'invalid-json')

      useAuthStore.getState().restoreSession()

      expect(useAuthStore.getState().user).toBeNull()
      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('auth_user')).toBeNull()
    })
  })

  describe('clearError', () => {
    it('clears the error message', () => {
      useAuthStore.setState({ error: 'some error' })
      useAuthStore.getState().clearError()
      expect(useAuthStore.getState().error).toBeNull()
    })
  })
})
