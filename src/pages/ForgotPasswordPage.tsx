import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff, Check, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestPasswordReset, verifyPasswordReset } from '@/api/auth'
import { PASSWORD_RESET_TIMEOUT_MS } from '@/lib/constants'

type Step = 'email' | 'verify'

interface PasswordResetData {
  email: string
  createdAt: number
}

export function ForgotPasswordPage() {
  const navigate = useNavigate()

  // sessionStorage에서 복원
  const getStoredData = (): PasswordResetData | null => {
    const stored = sessionStorage.getItem('pendingPasswordReset')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        // 5분 초과 시 만료 처리
        if (Date.now() - data.createdAt > PASSWORD_RESET_TIMEOUT_MS) {
          sessionStorage.removeItem('pendingPasswordReset')
          return null
        }
        return data
      } catch {
        sessionStorage.removeItem('pendingPasswordReset')
        return null
      }
    }
    return null
  }

  const storedData = getStoredData()

  const [step, setStep] = useState<Step>(storedData ? 'verify' : 'email')
  const [email, setEmail] = useState(storedData?.email || '')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(
    storedData ? '인증 코드가 이메일로 전송되었습니다. 이메일을 확인해주세요.' : null
  )

  const passwordRequirements = [
    { text: '8자 이상', met: newPassword.length >= 8 },
    { text: '영문 포함', met: /[a-zA-Z]/.test(newPassword) },
    { text: '숫자 포함', met: /[0-9]/.test(newPassword) },
  ]

  const isPasswordValid = passwordRequirements.every((req) => req.met)

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await requestPasswordReset({ email })

      // sessionStorage에 저장
      const resetData: PasswordResetData = {
        email,
        createdAt: Date.now()
      }
      sessionStorage.setItem('pendingPasswordReset', JSON.stringify(resetData))

      setSuccessMessage('인증 코드가 이메일로 전송되었습니다. 이메일을 확인해주세요.')
      setStep('verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : '요청에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await verifyPasswordReset({ email, code, newPassword })
      sessionStorage.removeItem('pendingPasswordReset')
      navigate('/login', { state: { message: '비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.' } })
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호 재설정에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
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
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          로그인으로 돌아가기
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">비밀번호 찾기</h1>
          <p className="mt-2 text-gray-600">
            {step === 'email'
              ? '가입한 이메일 주소를 입력하세요'
              : '이메일로 받은 인증 코드를 입력하세요'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {successMessage && step === 'verify' && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
            {successMessage}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleRequestCode} className="space-y-6">
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

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? '전송 중...' : '인증 코드 받기'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndReset} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">인증 코드</Label>
              <Input
                id="code"
                type="text"
                placeholder="6자리 인증 코드"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                인증 코드는 5분간 유효합니다.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="새 비밀번호를 입력하세요"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              {newPassword && (
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

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || !isPasswordValid || code.length !== 6}
            >
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </Button>

            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('pendingPasswordReset')
                setStep('email')
                setEmail('')
                setCode('')
                setNewPassword('')
                setError(null)
                setSuccessMessage(null)
              }}
              className="w-full text-sm text-gray-600 hover:text-gray-900"
            >
              다른 이메일로 다시 시도
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
