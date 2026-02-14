import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Check } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/useAuth'
import { getOAuthLoginUrl } from '@/api/auth'
import type { OAuthProvider } from '@/types/auth'

export function SignupPage() {
  const navigate = useNavigate()
  const { signup, isLoggedIn, isLoading: authLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreeTerms, setAgreeTerms] = useState(false)

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      navigate('/mypage', { replace: true })
    }
  }, [authLoading, isLoggedIn, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await signup({ email, password, passwordConfirm: confirmPassword, nickname })

      // sessionStorage에 인증 정보 저장 (페이지 이동 후에도 유지)
      const verificationData = {
        email,
        fromLogin: false,
        message: '회원가입이 완료되었습니다. 이메일로 발송된 인증 코드를 입력해주세요.',
        createdAt: Date.now()
      }
      sessionStorage.setItem('pendingEmailVerification', JSON.stringify(verificationData))

      // 이메일 인증 페이지로 리다이렉트
      navigate('/verify-email', {
        state: {
          email,
          message: verificationData.message
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordRequirements = [
    { text: '8자 이상', met: password.length >= 8 },
    { text: '영문 포함', met: /[a-zA-Z]/.test(password) },
    { text: '숫자 포함', met: /[0-9]/.test(password) },
  ]

  const isPasswordValid = passwordRequirements.every((req) => req.met)
  const isPasswordMatch = password === confirmPassword && confirmPassword.length > 0

  const handleOAuthLogin = (provider: OAuthProvider) => {
    window.location.href = getOAuthLoginUrl(provider)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader variant="brand-only" />

      {/* Main */}
      <main className="max-w-md mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="text-center mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="mt-2 text-gray-600">
            지금 바로 학습을 시작하세요
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              type="text"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="nickname"
            />
          </div>

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
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="new-password"
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
            {password && (
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req) => (
                  <div
                    key={req.text}
                    className={`flex items-center gap-2 text-xs ${
                      req.met ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    <Check className={`h-3 w-3 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                    {req.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {confirmPassword && (
              <div className={`flex items-center gap-2 text-xs ${isPasswordMatch ? 'text-green-600' : 'text-red-500'}`}>
                <Check className={`h-3 w-3 ${isPasswordMatch ? 'opacity-100' : 'opacity-30'}`} />
                {isPasswordMatch ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 min-h-[44px]">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              disabled={isLoading}
            />
            <label htmlFor="agreeTerms" className="text-sm text-gray-600 cursor-pointer select-none">
              <Link to="/terms" className="text-primary hover:underline" target="_blank">이용약관</Link>
              {' '}및{' '}
              <Link to="/privacy" className="text-primary hover:underline" target="_blank">개인정보 처리방침</Link>
              에 동의합니다. (필수)
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading || !isPasswordValid || !isPasswordMatch || !agreeTerms}
          >
            {isLoading ? '가입 중...' : '가입하기'}
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
              className="w-full"
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
              className="w-full"
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
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            로그인
          </Link>
        </p>
      </main>
    </div>
  )
}
