import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore.ts'
import LanguageSelector from '../components/LanguageSelector.tsx'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function LoginPage() {
  const { t } = useTranslation()
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
      errors.email = t('auth:validation.emailRequired')
    } else if (!isValidEmail(email)) {
      errors.email = t('auth:validation.emailInvalid')
    }
    if (!password) {
      errors.password = t('auth:validation.passwordRequired')
    } else if (password.length < 8) {
      errors.password = t('auth:validation.passwordTooShort')
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
    <div className="min-h-svh flex flex-col items-center justify-center p-2xl bg-bg relative">
      <div className="absolute top-md right-md">
        <LanguageSelector />
      </div>
      <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-3xl mb-lg">
        💰
      </div>
      <h1 className="text-title font-semibold text-text-primary mb-xs">
        {t('common:appName')}
      </h1>
      <p className="text-small text-text-secondary tracking-[2px] mb-3xl">
        {t('common:appSlogan')}
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
            type="email"
            placeholder={t('auth:emailPlaceholder')}
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
            className={`w-full h-12 rounded-md border bg-surface px-lg text-body outline-none transition-colors ${
              validationErrors.email
                ? 'border-danger focus:border-danger'
                : 'border-border focus:border-primary'
            }`}
            aria-label={t('auth:email')}
            aria-invalid={!!validationErrors.email}
            autoComplete="email"
          />
          {validationErrors.email && (
            <p className="mt-xs text-small text-danger" role="alert">
              {validationErrors.email}
            </p>
          )}
        </div>

        <div className="mb-xl">
          <input
            type="password"
            placeholder={t('auth:passwordPlaceholder')}
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
            className={`w-full h-12 rounded-md border bg-surface px-lg text-body outline-none transition-colors ${
              validationErrors.password
                ? 'border-danger focus:border-danger'
                : 'border-border focus:border-primary'
            }`}
            aria-label={t('auth:password')}
            aria-invalid={!!validationErrors.password}
            autoComplete="current-password"
          />
          {validationErrors.password && (
            <p className="mt-xs text-small text-danger" role="alert">
              {validationErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-primary text-surface rounded-md font-semibold text-body hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? t('auth:login.submitting') : t('auth:login.submit')}
        </button>

        <p className="text-center mt-xl text-caption">
          <span className="text-text-secondary">{t('auth:login.noAccount')}</span>
          <Link to="/register" className="text-primary underline ml-xs">
            {t('common:register')}
          </Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
