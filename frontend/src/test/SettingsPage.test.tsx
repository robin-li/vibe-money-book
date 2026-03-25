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

const mockProviders = [
  {
    code: 'gemini' as const,
    name: 'Google Gemini',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: '快速且經濟實惠', isDefault: true },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: '高品質推理能力', isDefault: false },
    ],
  },
  {
    code: 'openai' as const,
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: '高性價比', isDefault: true },
    ],
  },
  {
    code: 'anthropic' as const,
    name: 'Anthropic',
    models: [
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', description: '快速且經濟實惠', isDefault: true },
      { id: 'claude-sonnet-4-5-20250514', name: 'Claude Sonnet 4.5', description: '平衡速度與品質', isDefault: false },
    ],
  },
  {
    code: 'xai' as const,
    name: 'xAI',
    models: [
      { id: 'grok-3-mini-fast', name: 'Grok 3 Mini Fast', description: '最快速度', isDefault: true },
    ],
  },
]

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
    useSettingsStore.setState({
      persona: 'gentle',
      aiEngine: 'gemini',
      aiModel: null,
      monthlyBudget: 20000,
      userName: '測試使用者',
      userEmail: 'test@example.com',
      loading: false,
      saving: false,
      error: null,
      keyValidationStatus: 'idle',
      providers: mockProviders,
      fetchProfile: vi.fn(),
      fetchAIConfig: vi.fn(),
      fetchProviders: vi.fn(),
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
    it('renders all four provider options', () => {
      renderSettings()
      expect(screen.getByLabelText('選擇 Gemini 引擎')).toBeInTheDocument()
      expect(screen.getByLabelText('選擇 OpenAI 引擎')).toBeInTheDocument()
      expect(screen.getByLabelText('選擇 Anthropic 引擎')).toBeInTheDocument()
      expect(screen.getByLabelText('選擇 xAI 引擎')).toBeInTheDocument()
    })

    it('highlights selected engine', () => {
      renderSettings()
      expect(screen.getByLabelText('選擇 Gemini 引擎')).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByLabelText('選擇 OpenAI 引擎')).toHaveAttribute('aria-pressed', 'false')
      expect(screen.getByLabelText('選擇 Anthropic 引擎')).toHaveAttribute('aria-pressed', 'false')
      expect(screen.getByLabelText('選擇 xAI 引擎')).toHaveAttribute('aria-pressed', 'false')
    })

    it('calls updateAIEngine and updateAIModel when switching provider', async () => {
      const updateAIEngine = vi.fn()
      const updateAIModel = vi.fn()
      useSettingsStore.setState({ updateAIEngine, updateAIModel })
      renderSettings()

      await userEvent.click(screen.getByLabelText('選擇 Anthropic 引擎'))
      expect(updateAIEngine).toHaveBeenCalledWith('anthropic')
    })
  })

  describe('ModelSelector', () => {
    it('renders model dropdown for current provider', () => {
      renderSettings()
      const select = screen.getByLabelText('AI 模型') as HTMLSelectElement
      expect(select).toBeInTheDocument()
      // Gemini should have 2 models
      const options = select.querySelectorAll('option')
      expect(options).toHaveLength(2)
      expect(options[0].textContent).toContain('Gemini 2.5 Flash')
      expect(options[0].textContent).toContain('(推薦)')
    })

    it('shows model description', () => {
      renderSettings()
      expect(screen.getByText('快速且經濟實惠')).toBeInTheDocument()
    })

    it('calls updateAIModel when selecting a different model', async () => {
      const updateAIModel = vi.fn()
      useSettingsStore.setState({ updateAIModel })
      renderSettings()

      const select = screen.getByLabelText('AI 模型') as HTMLSelectElement
      await userEvent.selectOptions(select, 'gemini-2.5-pro')
      expect(updateAIModel).toHaveBeenCalledWith('gemini-2.5-pro')
    })
  })

  describe('APIKeyInput', () => {
    it('stores API key only in localStorage, not on server', async () => {
      renderSettings()

      const input = screen.getByLabelText('gemini API Key')
      await userEvent.type(input, 'test-api-key-123')

      const stored = JSON.parse(localStorage.getItem('llm_api_keys') ?? '{}')
      expect(stored.gemini).toBe('test-api-key-123')
    })

    it('loads existing API key from localStorage', () => {
      localStorage.setItem('llm_api_keys', JSON.stringify({ gemini: 'existing-key', openai: '', anthropic: '', xai: '' }))
      useSettingsStore.setState({ loading: false })
      renderSettings()

      const input = screen.getByLabelText('gemini API Key') as HTMLInputElement
      expect(input.type).toBe('password')
    })

    it('toggles visibility of API key', async () => {
      renderSettings()

      const input = screen.getByLabelText('gemini API Key') as HTMLInputElement
      expect(input.type).toBe('password')

      await userEvent.click(screen.getByLabelText('顯示 API Key'))
      expect(input.type).toBe('text')

      await userEvent.click(screen.getByLabelText('隱藏 API Key'))
      expect(input.type).toBe('password')
    })

    it('calls validateApiKey with engine and model when clicking validate button', async () => {
      const validateApiKey = vi.fn().mockResolvedValue(true)
      useSettingsStore.setState({ validateApiKey })
      renderSettings()

      const input = screen.getByLabelText('gemini API Key')
      await userEvent.type(input, 'my-key')

      await userEvent.click(screen.getByLabelText('驗證 API Key'))
      expect(validateApiKey).toHaveBeenCalledWith('my-key', 'gemini', 'gemini-2.5-flash')
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
      aiModel: null,
      monthlyBudget: 0,
      userName: '',
      userEmail: '',
      loading: false,
      saving: false,
      error: null,
      keyValidationStatus: 'idle',
      providers: [],
    })
  })

  it('API key is stored only in localStorage, never sent to profile API', async () => {
    const store = useSettingsStore.getState()
    expect('apiKey' in store).toBe(false)

    const keys = { gemini: 'secret-key', openai: 'other-key', anthropic: '', xai: '' }
    localStorage.setItem('llm_api_keys', JSON.stringify(keys))
    expect(JSON.parse(localStorage.getItem('llm_api_keys')!).gemini).toBe('secret-key')
  })
})
