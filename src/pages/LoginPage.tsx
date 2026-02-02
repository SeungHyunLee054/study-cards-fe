import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { getOAuthLoginUrl } from '@/api/auth'
import type { OAuthProvider } from '@/types/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 회원가입 후 리다이렉트 메시지
  const successMessage = location.state?.message as string | undefined

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login({ email, password })
      navigate('/mypage')
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = (provider: OAuthProvider) => {
    window.location.href = getOAuthLoginUrl(provider)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Study Cards</span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-md mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">다시 오신 것을 환영합니다</h1>
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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
              className="w-full"
              disabled={isLoading}
              onClick={() => handleOAuthLogin('google')}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
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
              Google
            </Button>
            <Button
              variant="outline"
              type="button"
              className="w-full"
              disabled={isLoading}
              onClick={() => handleOAuthLogin('kakao')}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#000000"
                  d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"
                />
              </svg>
              Kakao
            </Button>
            <Button
              variant="outline"
              type="button"
              className="w-full"
              disabled={isLoading}
              onClick={() => handleOAuthLogin('naver')}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#03C75A"
                  d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"
                />
              </svg>
              Naver
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
