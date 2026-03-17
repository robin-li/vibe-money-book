import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore.ts'

/** Email 格式驗證 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const login = useAuthStore((state) => state.login)
  const loading = useAuthStore((state) => state.loading)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/'

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!email.trim()) {
      errors.email = '請輸入 Email'
    } else if (!isValidEmail(email)) {
      errors.email = 'Email 格式不正確'
    }
    if (!password) {
      errors.password = '請輸入密碼'
    } else if (password.length < 8) {
      errors.password = '密碼長度至少 8 個字元'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearError()
    if (!validate()) return

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch {
      // error is already set in store
    }
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center p-2xl bg-bg">
      <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-3xl mb-lg">
        💰
      </div>
      <h1 className="text-[var(--font-size-title)] font-semibold text-text-primary mb-xs">
        Vibe Money Book
      </h1>
      <p className="text-[var(--font-size-small)] text-text-secondary tracking-[2px] mb-3xl">
        語音記帳教練
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm" noValidate>
        {error && (
          <div
            className="mb-lg p-md rounded-md bg-danger-light text-danger text-[var(--font-size-caption)] text-center"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="mb-md">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (validationErrors.email) {
                setValidationErrors((prev) => {
                  const next = { ...prev }
                  delete next.email
                  return next
                })
              }
            }}
            className={`w-full h-12 rounded-md border bg-surface px-lg text-[var(--font-size-body)] outline-none transition-colors ${
              validationErrors.email
                ? 'border-danger focus:border-danger'
                : 'border-border focus:border-primary'
            }`}
            aria-label="Email"
            aria-invalid={!!validationErrors.email}
            autoComplete="email"
          />
          {validationErrors.email && (
            <p className="mt-xs text-[var(--font-size-small)] text-danger" role="alert">
              {validationErrors.email}
            </p>
          )}
        </div>

        <div className="mb-xl">
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (validationErrors.password) {
                setValidationErrors((prev) => {
                  const next = { ...prev }
                  delete next.password
                  return next
                })
              }
            }}
            className={`w-full h-12 rounded-md border bg-surface px-lg text-[var(--font-size-body)] outline-none transition-colors ${
              validationErrors.password
                ? 'border-danger focus:border-danger'
                : 'border-border focus:border-primary'
            }`}
            aria-label="密碼"
            aria-invalid={!!validationErrors.password}
            autoComplete="current-password"
          />
          {validationErrors.password && (
            <p className="mt-xs text-[var(--font-size-small)] text-danger" role="alert">
              {validationErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-primary text-surface rounded-md font-semibold text-[var(--font-size-body)] hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '登入中...' : '登入'}
        </button>

        <p className="text-center mt-xl text-[var(--font-size-caption)]">
          <span className="text-text-secondary">還沒有帳號？</span>
          <Link to="/register" className="text-primary underline ml-xs">
            立即註冊
          </Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
