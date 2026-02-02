import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

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
      setLoggedIn(true)
      navigate('/mypage', { replace: true })
    } else {
      setError('인증 정보를 받아오지 못했습니다.')
    }
  }, [searchParams, navigate, setLoggedIn])

  if (error) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center">
        <BookOpen className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">로그인 실패</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="text-primary hover:underline"
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
      <p className="text-gray-600">로그인 처리 중...</p>
    </div>
  )
}
