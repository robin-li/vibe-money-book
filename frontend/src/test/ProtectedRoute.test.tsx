import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import ProtectedRoute from '../components/ProtectedRoute.tsx'
import { useAuthStore } from '../stores/authStore.ts'

function renderWithRouter(initialRoute: string) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Dashboard Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      loading: false,
      error: null,
    })
  })

  it('redirects to /login when user is not authenticated', () => {
    renderWithRouter('/dashboard')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument()
  })

  it('renders children when user is authenticated', () => {
    useAuthStore.setState({
      token: 'valid-token',
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

    renderWithRouter('/dashboard')
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('redirects to login when token is null even if user exists', () => {
    useAuthStore.setState({
      token: null,
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

    renderWithRouter('/dashboard')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })
})
