import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestEmailVerification, verifyEmailVerification } from '@/api/auth'
import { EMAIL_VERIFICATION_TIMEOUT_SECONDS } from '@/lib/constants'

type Step = 'input' | 'success'

interface VerificationData {
  email: string
  message?: string
  fromLogin?: boolean
  createdAt: number
}

export function EmailVerificationPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // location.state 우선, 없으면 sessionStorage에서 복원
  const getVerificationData = (): VerificationData | null => {
    if (location.state?.email) {
      return {
        email: location.state.email as string,
        message: location.state.message as string | undefined,
        fromLogin: location.state.fromLogin as boolean | undefined,
        createdAt: Date.now()
      }
    }

    const stored = sessionStorage.getItem('pendingEmailVerification')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        sessionStorage.removeItem('pendingEmailVerification')
        return null
      }
    }
    return null
  }

  const verificationData = getVerificationData()
  const email = verificationData?.email
  const message = verificationData?.message
  const fromLogin = verificationData?.fromLogin

  // 저장된 시점 기준으로 남은 시간 계산
  const calculateTimeLeft = () => {
    if (!verificationData?.createdAt) return EMAIL_VERIFICATION_TIMEOUT_SECONDS
    const elapsed = Math.floor((Date.now() - verificationData.createdAt) / 1000)
    return Math.max(0, EMAIL_VERIFICATION_TIMEOUT_SECONDS - elapsed)
  }

  const [step, setStep] = useState<Step>('input')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)
  const [canResend, setCanResend] = useState(() => calculateTimeLeft() <= 0)

  // 이메일이 없으면 회원가입 페이지로 리다이렉트
  useEffect(() => {
    if (!email) {
      navigate('/signup', { replace: true })
    }
  }, [email, navigate])

  // 타이머 동작
  useEffect(() => {
    if (step !== 'input' || timeLeft <= 0) {
      if (timeLeft <= 0) {
        setCanResend(true)
      }
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [step])

  // 시간 포맷팅 (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // 숫자만 허용
    if (value.length <= 6) {
      setCode(value)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || code.length !== 6) return

    setError(null)
    setIsLoading(true)

    try {
      await verifyEmailVerification({ email, code })
      sessionStorage.removeItem('pendingEmailVerification')
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '이메일 인증에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email || !canResend) return

    setError(null)
    setIsLoading(true)

    try {
      await requestEmailVerification({ email })

      // sessionStorage 업데이트
      const newData: VerificationData = {
        email,
        message: verificationData?.message,
        fromLogin: verificationData?.fromLogin,
        createdAt: Date.now()
      }
      sessionStorage.setItem('pendingEmailVerification', JSON.stringify(newData))

      setTimeLeft(EMAIL_VERIFICATION_TIMEOUT_SECONDS) // 타이머 리셋
      setCanResend(false)
      setCode('')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 코드 재발송에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!email) {
    return null
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
        {step === 'input' ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">이메일 인증</h1>
              <p className="mt-2 text-gray-600">
                {email}로 발송된 인증 코드를 입력해주세요
              </p>
            </div>

            {message && (
              <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 text-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">인증 코드</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="000000"
                  value={code}
                  onChange={handleCodeChange}
                  maxLength={6}
                  required
                  disabled={isLoading}
                  className="text-center text-2xl tracking-widest font-mono"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    6자리 숫자 코드를 입력하세요
                  </span>
                  <span className={`font-mono ${timeLeft <= 60 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? '인증 중...' : '인증하기'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={!canResend || isLoading}
              >
                {canResend ? '코드 재발송' : `재발송 가능 (${formatTime(timeLeft)})`}
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">참고:</span> 인증 코드는 5분간 유효하며, 최대 5회까지 시도할 수 있습니다.
                이메일이 도착하지 않았다면 스팸함을 확인해주세요.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">인증 완료!</h1>
            <p className="text-gray-600 mb-8">
              이메일 인증이 성공적으로 완료되었습니다.
              {fromLogin ? ' 이제 로그인할 수 있습니다.' : ' 이제 로그인하고 학습을 시작하세요.'}
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
              size="lg"
            >
              로그인하러 가기
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
