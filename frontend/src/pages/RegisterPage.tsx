import { Link } from 'react-router-dom'

function RegisterPage() {
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

      <div className="w-full max-w-sm">
        <input
          type="text"
          placeholder="使用者名稱"
          className="w-full h-12 rounded-md border border-border bg-surface px-lg text-[var(--font-size-body)] mb-md outline-none focus:border-primary transition-colors"
          aria-label="使用者名稱"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full h-12 rounded-md border border-border bg-surface px-lg text-[var(--font-size-body)] mb-md outline-none focus:border-primary transition-colors"
          aria-label="Email"
        />
        <input
          type="password"
          placeholder="密碼"
          className="w-full h-12 rounded-md border border-border bg-surface px-lg text-[var(--font-size-body)] mb-xl outline-none focus:border-primary transition-colors"
          aria-label="密碼"
        />
        <button className="w-full h-12 bg-primary text-surface rounded-md font-semibold text-[var(--font-size-body)] hover:bg-primary-dark transition-colors">
          註冊
        </button>

        <p className="text-center mt-xl text-[var(--font-size-caption)]">
          <span className="text-text-secondary">已有帳號？</span>
          <Link to="/login" className="text-primary underline ml-xs">
            返回登入
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
