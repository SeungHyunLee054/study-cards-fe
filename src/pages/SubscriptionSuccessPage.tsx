import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookOpen, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { confirmBilling } from '@/api/subscriptions'

export function SubscriptionSuccessPage() {
  const [searchParams] = useSearchParams()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    // 빌링 인증 콜백 파라미터
    const authKey = searchParams.get('authKey')
    const customerKey = searchParams.get('customerKey')
    const orderId = searchParams.get('orderId')

    if (!authKey || !customerKey || !orderId) {
      setError('결제 정보가 올바르지 않습니다.')
      setIsLoading(false)
      return
    }

    handleConfirmBilling(authKey, customerKey, orderId)
  }, [searchParams])

  async function handleConfirmBilling(
    authKey: string,
    customerKey: string,
    orderId: string
  ) {
    try {
      setIsLoading(true)
      await confirmBilling({ authKey, customerKey, orderId })
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '결제 확인에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-gray-600">결제를 확인하고 있습니다...</p>
      </div>
    )
  }

  if (error || !isSuccess) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <header className="border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">Study Cards</span>
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">결제 확인 실패</h1>
          <p className="text-gray-600 mb-8">{error || '결제 정보를 확인할 수 없습니다.'}</p>
          <Button asChild>
            <Link to="/subscription">구독 페이지로 돌아가기</Link>
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Study Cards</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">결제가 완료되었습니다!</h1>
        <p className="text-gray-600 mb-8">
          구독이 성공적으로 활성화되었습니다. 지금 바로 프리미엄 기능을 사용해보세요.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link to="/subscription">구독 정보 확인</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/study">학습 시작하기</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
