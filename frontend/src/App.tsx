import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import DashboardPage from './pages/DashboardPage.tsx'
import StatsPage from './pages/StatsPage.tsx'
import HistoryPage from './pages/HistoryPage.tsx'
import SettingsPage from './pages/SettingsPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import { useAuthStore } from './stores/authStore.ts'

function App() {
  const location = useLocation()
  const hideTabBar = ['/login', '/register'].includes(location.pathname)
  const restoreSession = useAuthStore((state) => state.restoreSession)

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  return (
    <Routes>
      {hideTabBar ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </>
      ) : (
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      )}
    </Routes>
  )
}

export default App
