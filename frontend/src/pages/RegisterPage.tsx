import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore.ts'

/** Email 格式驗證 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const register = useAuthStore((state) => state.register)
  const loading = useAuthStore((state) => state.loading)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

  const navigate = useNavigate()

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!name.trim()) {
      errors.name = '請輸入使用者名稱'
    } else if (name.trim().length < 2) {
      errors.name = '使用者名稱至少 2 個字元'
    }
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
    if (!confirmPassword) {
      errors.confirmPassword = '請再次輸入密碼'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = '兩次輸入的密碼不一致'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearError()
    if (!validate()) return

    try {
      await register(name.trim(), email, password)
      navigate('/', { replace: true })
    } catch {
      // error is already set in store
    }
  }

  function clearFieldError(field: string) {
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center p-2xl bg-bg">
      <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-3xl mb-lg">
        💰
      </div>
      <h1 className="text-title font-semibold text-text-primary mb-xs">
        Vibe Money Book
      </h1>
      <p className="text-small text-text-secondary tracking-[2px] mb-3xl">
        語音記帳教練
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-[384px]" noValidate>
        {error && (
          <div
            className="mb-lg p-md rounded-md bg-danger-light text-danger text-caption text-center"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="mb-md">
          <input
            type="text"
            placeholder="使用者名稱"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              clearFieldError('name')
            }}
            className={`w-full h-12 rounded-md border bg-surface px-lg text-body outline-none transition-colors ${
              validationErrors.name
                ? 'border-danger focus:border-danger'
                : 'border-border focus:border-primary'
            }`}
            aria-label="使用者名稱"
            aria-invalid={!!validationErrors.name}
            autoComplete="name"
          />
          {validationErrors.name && (
            <p className="mt-xs text-small text-danger" role="alert">
              {validationErrors.name}
            </p>
          )}
        </div>

        <div className="mb-md">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearFieldError('email')
            }}
            className={`w-full h-12 rounded-md border bg-surface px-lg text-body outline-none transition-colors ${
              validationErrors.email
                ? 'border-danger focus:border-danger'
                : 'border-border focus:border-primary'
            }`}
            aria-label="Email"
            aria-invalid={!!validationErrors.email}
            autoComplete="email"
          />
          {validationErrors.email && (
            <p className="mt-xs text-small text-danger" role="alert">
              {validationErrors.email}
            </p>
          )}
        </div>

        <div className="mb-md">
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              clearFieldError('password')
            }}
            className={`w-full h-12 rounded-md border bg-surface px-lg text-body outline-none transition-colors ${
              validationErrors.password
                ? 'border-danger focus:border-danger'
                : 'border-border focus:border-primary'
            }`}
            aria-label="密碼"
            aria-invalid={!!validationErrors.password}
            autoComplete="new-password"
          />
          {validationErrors.password && (
            <p className="mt-xs text-small text-danger" role="alert">
              {validationErrors.password}
            </p>
          )}
        </div>

        <div className="mb-xl">
          <input
            type="password"
            placeholder="確認密碼"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              clearFieldError('confirmPassword')
            }}
            className={`w-full h-12 rounded-md border bg-surface px-lg text-body outline-none transition-colors ${
              validationErrors.confirmPassword
                ? 'border-danger focus:border-danger'
                : 'border-border focus:border-primary'
            }`}
            aria-label="確認密碼"
            aria-invalid={!!validationErrors.confirmPassword}
            autoComplete="new-password"
          />
          {validationErrors.confirmPassword && (
            <p className="mt-xs text-small text-danger" role="alert">
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-primary text-surface rounded-md font-semibold text-body hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '註冊中...' : '註冊'}
        </button>

        <p className="text-center mt-xl text-caption">
          <span className="text-text-secondary">已有帳號？</span>
          <Link to="/login" className="text-primary underline ml-xs">
            返回登入
          </Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
