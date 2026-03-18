import { Outlet, NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: '首頁', icon: '🏠' },
  { to: '/stats', label: '統計', icon: '📊' },
  { to: '/history', label: '記錄', icon: '📋' },
  { to: '/settings', label: '設定', icon: '⚙️' },
] as const

function Layout() {
  return (
    <div className="flex flex-col min-h-svh bg-bg">
      <main className="flex-1 pb-[72px]">
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 h-14 bg-surface border-t border-border flex items-center z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="主選單"
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors duration-[var(--transition-fast)] ${
                isActive
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`
            }
            aria-label={tab.label}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="block w-1.5 h-1.5 rounded-full bg-primary mb-0.5" />
                )}
                <span className="text-xl leading-none" role="img" aria-hidden="true">
                  {tab.icon}
                </span>
                <span className="text-small mt-0.5">
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Layout
