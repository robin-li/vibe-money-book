import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore.ts'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * 保護路由元件：未認證使用者自動導向 /login
 * 保留原始目標路徑，登入後可跳轉回去
 */
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useAuthStore((state) => state.token)
  const isInitialized = useAuthStore((state) => state.isInitialized)
  const location = useLocation()

  if (!isInitialized) {
    return null
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
