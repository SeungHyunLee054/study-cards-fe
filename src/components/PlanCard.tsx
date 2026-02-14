import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PlanResponse, BillingCycle } from '@/types/subscription'

interface PlanCardProps {
  plan: PlanResponse
  billingCycle: BillingCycle
  isCurrentPlan: boolean
  onSelect: (plan: PlanResponse) => void
  isLoading?: boolean
}

export function PlanCard({
  plan,
  billingCycle,
  isCurrentPlan,
  onSelect,
  isLoading,
}: PlanCardProps) {
  const price = billingCycle === 'MONTHLY' ? plan.monthlyPrice : plan.yearlyPrice
  const monthlyEquivalent = billingCycle === 'YEARLY' ? Math.round(price / 12) : price
  const isFree = plan.plan === 'FREE'
  const isPro = plan.plan === 'PRO'

  return (
    <div
      className={`relative p-6 rounded-2xl border-2 ${
        isPro
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 bg-white'
      }`}
    >
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary text-white">
            추천
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{plan.displayName}</h3>
      </div>

      <div className="text-center mb-6">
        {isFree ? (
          <div className="text-3xl font-bold text-gray-900">무료</div>
        ) : (
          <>
            <div className="text-3xl font-bold text-gray-900">
              {monthlyEquivalent.toLocaleString()}원
              <span className="text-base font-normal text-gray-500">/월</span>
            </div>
            {billingCycle === 'YEARLY' && (
              <p className="mt-1 text-sm text-gray-500">
                연 {price.toLocaleString()}원 결제
              </p>
            )}
          </>
        )}
      </div>

      <ul className="space-y-3 mb-6">
        <li className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-gray-700">카드 학습 무제한</span>
        </li>
        {!isFree && (
          <li className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">진행도 저장</span>
          </li>
        )}
        <li className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-gray-700">
            AI 카드 생성 {plan.canGenerateAiCards ? `일 ${plan.aiGenerationDailyLimit}회` : `체험 ${plan.aiGenerationDailyLimit}회`}
          </span>
        </li>
        {plan.canUseAiRecommendations && (
          <li className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">AI 복습 전략</span>
          </li>
        )}
      </ul>

      {isCurrentPlan ? (
        <Button variant="outline" className="w-full" disabled>
          현재 플랜
        </Button>
      ) : isFree ? (
        <Button variant="outline" className="w-full" disabled>
          기본 플랜
        </Button>
      ) : (
        <Button
          className={`w-full ${isPro ? '' : 'bg-gray-900 hover:bg-gray-800'}`}
          onClick={() => onSelect(plan)}
          disabled={isLoading}
        >
          {isLoading ? '처리 중...' : '구독하기'}
        </Button>
      )}
    </div>
  )
}
