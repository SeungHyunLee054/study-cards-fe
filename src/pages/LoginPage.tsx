import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/useAuth'
import { getOAuthLoginUrl } from '@/api/auth'
import { DASHBOARD_PATH } from '@/constants/routes'
import { AuthError } from '@/types/errors'
import type { OAuthProvider } from '@/types/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoggedIn, isLoading: authLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 회원가입 후 리다이렉트 메시지
  const successMessage = location.state?.message as string | undefined

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      navigate(DASHBOARD_PATH, { replace: true })
    }
  }, [authLoading, isLoggedIn, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login({ email, password })
      navigate(DASHBOARD_PATH)
    } catch (err) {
      // 이메일 미인증 에러 처리
      if (err instanceof AuthError && err.code === 'EMAIL_NOT_VERIFIED') {
        const verificationData = {
          email: err.email || email,
          fromLogin: true,
          message: '이메일 인증이 필요합니다. 가입 시 받은 인증 코드를 입력해주세요.',
          createdAt: Date.now()
        }
        sessionStorage.setItem('pendingEmailVerification', JSON.stringify(verificationData))

        navigate('/verify-email', {
          state: {
            email: verificationData.email,
            fromLogin: true,
            message: verificationData.message
          }
        })
        return
      }
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = (provider: OAuthProvider) => {
    window.location.href = getOAuthLoginUrl(provider)
  }

  const socialButtonClass = 'w-full oauth-social-button'
  const kakaoSocialButtonClass = 'w-full oauth-social-button oauth-kakao-button'

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader variant="brand-only" />

      {/* Main */}
      <main className="max-w-md mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="text-center mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">다시 오신 것을 환영합니다</h1>
          <p className="mt-2 text-gray-600">
            로그인하고 학습을 이어가세요
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">비밀번호</Label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                비밀번호 찾기
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              type="button"
              className={socialButtonClass}
              disabled={isLoading}
              onClick={() => handleOAuthLogin('google')}
            >
              <svg className="h-5 w-5 sm:mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="hidden sm:inline">Google</span>
            </Button>
            <Button
              variant="outline"
              type="button"
              className={kakaoSocialButtonClass}
              disabled={isLoading}
              onClick={() => handleOAuthLogin('kakao')}
            >
              <svg className="h-5 w-5 sm:mr-2" viewBox="0 0 24 24">
                <path
                  fill="#000000"
                  d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"
                />
              </svg>
              <span className="hidden sm:inline">Kakao</span>
            </Button>
            <Button
              variant="outline"
              type="button"
              className={socialButtonClass}
              disabled={isLoading}
              onClick={() => handleOAuthLogin('naver')}
            >
              <svg className="h-5 w-5 sm:mr-2" viewBox="0 0 24 24">
                <path
                  fill="#03C75A"
                  d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"
                />
              </svg>
              <span className="hidden sm:inline">Naver</span>
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            회원가입
          </Link>
        </p>
      </main>
    </div>
  )
}
