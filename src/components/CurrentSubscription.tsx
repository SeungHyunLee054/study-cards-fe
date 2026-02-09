import { Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SubscriptionResponse } from '@/types/subscription'

interface CurrentSubscriptionProps {
  subscription: SubscriptionResponse
  onCancel: () => void
  isCancelling?: boolean
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getStatusLabel(status: SubscriptionResponse['status']): { label: string; className: string } {
  switch (status) {
    case 'ACTIVE':
      return { label: '활성', className: 'bg-green-100 text-green-700' }
    case 'CANCELED':
      return { label: '취소됨', className: 'bg-yellow-100 text-yellow-700' }
    case 'EXPIRED':
      return { label: '만료됨', className: 'bg-gray-100 text-gray-700' }
    case 'PENDING':
      return { label: '대기 중', className: 'bg-blue-100 text-blue-700' }
    default:
      return { label: status, className: 'bg-gray-100 text-gray-700' }
  }
}

export function CurrentSubscription({
  subscription,
  onCancel,
  isCancelling,
}: CurrentSubscriptionProps) {
  const status = getStatusLabel(subscription.status)
  const billingLabel = subscription.billingCycle === 'MONTHLY' ? '월간' : '연간'

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">현재 구독</h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{subscription.planDisplayName}</h3>
            <p className="text-sm text-gray-500">{billingLabel} 결제</p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.className}`}>
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(subscription.startDate)} ~ {formatDate(subscription.endDate)}
          </span>
        </div>

        {subscription.status === 'ACTIVE' && (
          <Button
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={onCancel}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              '구독 취소'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
