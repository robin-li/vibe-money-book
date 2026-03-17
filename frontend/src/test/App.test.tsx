import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import App from '../App'
import { useAuthStore } from '../stores/authStore.ts'

function renderWithRouter(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>,
  )
}

/** 設定已認證狀態 */
function setAuthenticated() {
  useAuthStore.setState({
    token: 'test-token',
    user: {
      id: '1',
      name: 'Test',
      email: 'test@example.com',
      persona: 'gentle',
      aiEngine: 'gemini',
      monthlyBudget: 20000,
      currency: 'TWD',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  })
}

describe('App Routing', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      loading: false,
      error: null,
    })
    localStorage.clear()
  })

  describe('authenticated routes', () => {
    beforeEach(() => {
      setAuthenticated()
    })

    it('renders dashboard page at /', () => {
      renderWithRouter('/')
      expect(screen.getByText('Vibe Money Book')).toBeInTheDocument()
      expect(screen.getByText('語音記帳教練')).toBeInTheDocument()
    })

    it('renders stats page at /stats', () => {
      renderWithRouter('/stats')
      expect(screen.getByText('📊 統計')).toBeInTheDocument()
    })

    it('renders history page at /history', () => {
      renderWithRouter('/history')
      expect(screen.getByText('📋 記錄')).toBeInTheDocument()
    })

    it('renders settings page at /settings', () => {
      renderWithRouter('/settings')
      expect(screen.getByText('⚙️ 設定')).toBeInTheDocument()
    })

    it('shows tab bar on main pages', () => {
      renderWithRouter('/')
      expect(screen.getByLabelText('主選單')).toBeInTheDocument()
      expect(screen.getByText('首頁')).toBeInTheDocument()
      expect(screen.getByText('統計')).toBeInTheDocument()
      expect(screen.getByText('記錄')).toBeInTheDocument()
      expect(screen.getByText('設定')).toBeInTheDocument()
    })
  })

  describe('public routes', () => {
    it('renders login page at /login', () => {
      renderWithRouter('/login')
      expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument()
      expect(screen.getByText('立即註冊')).toBeInTheDocument()
    })

    it('renders register page at /register', () => {
      renderWithRouter('/register')
      expect(screen.getByRole('button', { name: '註冊' })).toBeInTheDocument()
      expect(screen.getByText('返回登入')).toBeInTheDocument()
    })

    it('hides tab bar on login page', () => {
      renderWithRouter('/login')
      expect(screen.queryByLabelText('主選單')).not.toBeInTheDocument()
    })

    it('hides tab bar on register page', () => {
      renderWithRouter('/register')
      expect(screen.queryByLabelText('主選單')).not.toBeInTheDocument()
    })
  })

  describe('route protection', () => {
    it('redirects unauthenticated user from / to /login', () => {
      renderWithRouter('/')
      expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument()
    })

    it('redirects unauthenticated user from /settings to /login', () => {
      renderWithRouter('/settings')
      expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument()
    })
  })
})
