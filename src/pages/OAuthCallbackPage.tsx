import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { useAuth } from '@/contexts/useAuth'
import { DASHBOARD_PATH } from '@/constants/routes'

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setLoggedIn } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      return
    }

    if (token) {
      localStorage.setItem('accessToken', token)
      window.history.replaceState({}, '', '/oauth2/callback')
      setLoggedIn(true)
      navigate(DASHBOARD_PATH, { replace: true })
    } else {
      setError('인증 정보를 받아오지 못했습니다.')
    }
  }, [searchParams, navigate, setLoggedIn])

  if (error) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col">
        <AppHeader variant="brand-only" />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">로그인 실패</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="text-primary hover:underline"
          >
            로그인 페이지로 돌아가기
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <AppHeader variant="brand-only" />
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-gray-600">로그인 처리 중...</p>
      </main>
    </div>
  )
}
