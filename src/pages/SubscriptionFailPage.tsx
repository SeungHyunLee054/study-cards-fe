import { Link, useSearchParams } from 'react-router-dom'
import { XCircle } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'

export function SubscriptionFailPage() {
  const [searchParams] = useSearchParams()

  const errorCode = searchParams.get('code')
  const errorMessage = searchParams.get('message')

  function getErrorDescription(code: string | null): string {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '결제가 취소되었습니다.'
      case 'PAY_PROCESS_ABORTED':
        return '결제가 중단되었습니다.'
      case 'REJECT_CARD_COMPANY':
        return '카드사에서 결제를 거부했습니다.'
      default:
        return errorMessage || '결제 중 오류가 발생했습니다.'
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader variant="brand-only" container="max-w-4xl" />

      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">결제에 실패했습니다</h1>
        <p className="text-gray-600 mb-2">{getErrorDescription(errorCode)}</p>
        {errorCode && (
          <p className="text-sm text-gray-400 mb-8">오류 코드: {errorCode}</p>
        )}
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link to="/subscription">다시 시도하기</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/mypage">마이페이지로 돌아가기</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
