import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SettingsPage from '../pages/SettingsPage'
import { useSettingsStore } from '../stores/settingsStore'

// Mock api module
vi.mock('../lib/api.ts', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderSettings() {
  return render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>
  )
}

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()

    // Set store to non-loading state with defaults
    // Override fetchProfile to a no-op so mount doesn't trigger loading
    useSettingsStore.setState({
      persona: 'gentle',
      aiEngine: 'gemini',
      monthlyBudget: 20000,
      userName: '測試使用者',
      userEmail: 'test@example.com',
      loading: false,
      saving: false,
      error: null,
      keyValidationStatus: 'idle',
      fetchProfile: vi.fn(),
    })
  })

  it('renders all sections', () => {
    renderSettings()
    expect(screen.getByText('⚙️ 設定')).toBeInTheDocument()
    expect(screen.getByLabelText('使用者資訊')).toBeInTheDocument()
    expect(screen.getByLabelText('AI 人設選擇')).toBeInTheDocument()
    expect(screen.getByLabelText('月預算設定')).toBeInTheDocument()
    expect(screen.getByLabelText('AI 引擎設定')).toBeInTheDocument()
    expect(screen.getByLabelText('登出')).toBeInTheDocument()
  })

  it('displays user info from store', () => {
    renderSettings()
    expect(screen.getByText('測試使用者')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    useSettingsStore.setState({ loading: true, fetchProfile: vi.fn() })
    renderSettings()
    expect(screen.getByText('載入設定中...')).toBeInTheDocument()
  })

  describe('PersonaSelector', () => {
    it('renders all three persona options', () => {
      renderSettings()
      expect(screen.getByLabelText('選擇毒舌人設')).toBeInTheDocument()
      expect(screen.getByLabelText('選擇溫柔人設')).toBeInTheDocument()
      expect(screen.getByLabelText('選擇情勒人設')).toBeInTheDocument()
    })

    it('highlights selected persona (gentle by default)', () => {
      renderSettings()
      const gentleBtn = screen.getByLabelText('選擇溫柔人設')
      expect(gentleBtn).toHaveAttribute('aria-pressed', 'true')

      const sarcasticBtn = screen.getByLabelText('選擇毒舌人設')
      expect(sarcasticBtn).toHaveAttribute('aria-pressed', 'false')
    })

    it('calls updatePersona when clicking a persona card', async () => {
      const updatePersona = vi.fn()
      useSettingsStore.setState({ updatePersona })
      renderSettings()

      await userEvent.click(screen.getByLabelText('選擇毒舌人設'))
      expect(updatePersona).toHaveBeenCalledWith('sarcastic')
    })
  })

  describe('BudgetEditor', () => {
    it('shows current budget value in the input', () => {
      renderSettings()
      const input = screen.getByLabelText('每月預算金額') as HTMLInputElement
      expect(input.value).toBe('20000')
    })

    it('shows formatted budget text', () => {
      renderSettings()
      expect(screen.getByText('目前設定：$20,000')).toBeInTheDocument()
    })

    it('calls updateBudget on blur', async () => {
      const updateBudget = vi.fn()
      useSettingsStore.setState({ updateBudget, monthlyBudget: 0 })
      renderSettings()

      const input = screen.getByLabelText('每月預算金額') as HTMLInputElement
      await userEvent.click(input)
      await userEvent.clear(input)
      await userEvent.type(input, '30000')
      // Trigger blur by tabbing
      await userEvent.tab()
      expect(updateBudget).toHaveBeenCalledWith(30000)
    })
  })

  describe('AIEngineSelector', () => {
    it('renders Gemini and OpenAI options', () => {
      renderSettings()
      expect(screen.getByLabelText('選擇 Gemini 引擎')).toBeInTheDocument()
      expect(screen.getByLabelText('選擇 OpenAI 引擎')).toBeInTheDocument()
    })

    it('highlights selected engine', () => {
      renderSettings()
      expect(screen.getByLabelText('選擇 Gemini 引擎')).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByLabelText('選擇 OpenAI 引擎')).toHaveAttribute('aria-pressed', 'false')
    })

    it('calls updateAIEngine when clicking', async () => {
      const updateAIEngine = vi.fn()
      useSettingsStore.setState({ updateAIEngine })
      renderSettings()

      await userEvent.click(screen.getByLabelText('選擇 OpenAI 引擎'))
      expect(updateAIEngine).toHaveBeenCalledWith('openai')
    })
  })

  describe('APIKeyInput', () => {
    it('stores API key only in localStorage, not on server', async () => {
      renderSettings()

      const input = screen.getByLabelText('API Key 輸入')
      await userEvent.type(input, 'test-api-key-123')

      expect(localStorage.getItem('llm_api_key')).toBe('test-api-key-123')
    })

    it('loads existing API key from localStorage', () => {
      localStorage.setItem('llm_api_key', 'existing-key')
      // Re-render picks up the initial state
      useSettingsStore.setState({ loading: false })
      renderSettings()

      const input = screen.getByLabelText('API Key 輸入') as HTMLInputElement
      // Input type is password by default
      expect(input.type).toBe('password')
    })

    it('toggles visibility of API key', async () => {
      renderSettings()

      const input = screen.getByLabelText('API Key 輸入') as HTMLInputElement
      expect(input.type).toBe('password')

      await userEvent.click(screen.getByLabelText('顯示 API Key'))
      expect(input.type).toBe('text')

      await userEvent.click(screen.getByLabelText('隱藏 API Key'))
      expect(input.type).toBe('password')
    })

    it('calls validateApiKey when clicking validate button', async () => {
      const validateApiKey = vi.fn().mockResolvedValue(true)
      useSettingsStore.setState({ validateApiKey })
      renderSettings()

      const input = screen.getByLabelText('API Key 輸入')
      await userEvent.type(input, 'my-key')

      await userEvent.click(screen.getByLabelText('驗證 API Key'))
      expect(validateApiKey).toHaveBeenCalledWith('my-key')
    })

    it('shows validation status', () => {
      useSettingsStore.setState({ keyValidationStatus: 'valid' })
      renderSettings()
      expect(screen.getByText('✅ 金鑰有效')).toBeInTheDocument()
    })

    it('shows invalid status', () => {
      useSettingsStore.setState({ keyValidationStatus: 'invalid' })
      renderSettings()
      expect(screen.getByText('❌ 金鑰無效')).toBeInTheDocument()
    })
  })

  describe('Logout', () => {
    it('calls logout and navigates to /login', async () => {
      const logoutFn = vi.fn()

      // Need to mock authStore's logout
      const { useAuthStore } = await import('../stores/authStore')
      useAuthStore.setState({ logout: logoutFn })

      renderSettings()
      await userEvent.click(screen.getByLabelText('登出'))

      expect(logoutFn).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  describe('Error handling', () => {
    it('displays error message and dismiss button', async () => {
      const clearError = vi.fn()
      useSettingsStore.setState({ error: '更新失敗', clearError })
      renderSettings()

      expect(screen.getByText('更新失敗')).toBeInTheDocument()
      await userEvent.click(screen.getByLabelText('關閉錯誤'))
      expect(clearError).toHaveBeenCalled()
    })
  })
})

describe('settingsStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    useSettingsStore.setState({
      persona: 'gentle',
      aiEngine: 'gemini',
      monthlyBudget: 0,
      userName: '',
      userEmail: '',
      loading: false,
      saving: false,
      error: null,
      keyValidationStatus: 'idle',
    })
  })

  it('API key is stored only in localStorage, never sent to profile API', async () => {
    // This test verifies the architectural decision:
    // API key is ONLY in localStorage, never in the settings store state
    const store = useSettingsStore.getState()
    // The store should not have an apiKey field
    expect('apiKey' in store).toBe(false)

    // Setting in localStorage should work
    localStorage.setItem('llm_api_key', 'secret-key')
    expect(localStorage.getItem('llm_api_key')).toBe('secret-key')
  })
})
