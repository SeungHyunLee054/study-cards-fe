import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/useAuth'
import { consumeLogoutRedirectToHome } from '@/lib/authRedirect'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isLoggedIn) {
    if (consumeLogoutRedirectToHome()) {
      return <Navigate to="/" replace />
    }
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
