import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import App from '../App'

function renderWithRouter(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App Routing', () => {
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

  it('renders login page at /login', () => {
    renderWithRouter('/login')
    expect(screen.getByText('登入')).toBeInTheDocument()
    expect(screen.getByText('立即註冊')).toBeInTheDocument()
  })

  it('renders register page at /register', () => {
    renderWithRouter('/register')
    expect(screen.getByText('註冊')).toBeInTheDocument()
    expect(screen.getByText('返回登入')).toBeInTheDocument()
  })

  it('shows tab bar on main pages', () => {
    renderWithRouter('/')
    expect(screen.getByLabelText('主選單')).toBeInTheDocument()
    expect(screen.getByText('首頁')).toBeInTheDocument()
    expect(screen.getByText('統計')).toBeInTheDocument()
    expect(screen.getByText('記錄')).toBeInTheDocument()
    expect(screen.getByText('設定')).toBeInTheDocument()
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
