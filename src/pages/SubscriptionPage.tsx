import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Loader2, CreditCard, Check, Sparkles } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { AppFooter } from '@/components/AppFooter'
import { Button } from '@/components/ui/button'
import { BillingCycleToggle } from '@/components/BillingCycleToggle'
import { CurrentSubscription } from '@/components/CurrentSubscription'
import { InvoiceList } from '@/components/InvoiceList'
import { useAuth } from '@/contexts/useAuth'
import {
  fetchPlans,
  fetchMySubscription,
  createCheckoutSession,
  cancelSubscription,
  fetchInvoices,
} from '@/api/subscriptions'
import { requestBillingAuth, requestPayment } from '@/lib/tosspayments'
import type {
  PlanResponse,
  SubscriptionResponse,
  InvoiceResponse,
  BillingCycle,
} from '@/types/subscription'

export function SubscriptionPage() {
  const { isLoading: authLoading, isLoggedIn } = useAuth()
  const [searchParams] = useSearchParams()

  const [plan, setPlan] = useState<PlanResponse | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([])
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY')

  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const success = searchParams.get('success')
    if (success === 'true') {
      setSuccessMessage('결제가 완료되었습니다.')
    }
  }, [searchParams])

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const plansData = await fetchPlans()
      // 구매 가능한 플랜 우선 선택, 없으면 유료 플랜(PRO/가격>0) fallback
      const paidPlan =
        plansData.find((p) => p.isPurchasable)
        || plansData.find((p) => p.plan === 'PRO')
        || plansData.find((p) => p.monthlyPrice > 0 || p.yearlyPrice > 0)
        || plansData[0]
      setPlan(paidPlan)

      if (isLoggedIn) {
        const [subscriptionData, invoicesData] = await Promise.all([
          fetchMySubscription(),
          fetchInvoices(),
        ])
        setSubscription(subscriptionData)
        setInvoices(invoicesData)
      } else {
        setSubscription(null)
        setInvoices([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (authLoading) return
    loadData()
  }, [loadData, authLoading])

  async function handleSubscribe() {
    if (!plan) return

    if (!isLoggedIn) {
      window.location.href = '/login?redirect=/subscription'
      return
    }

    try {
      setIsCheckingOut(true)
      setError(null)

      const checkout = await createCheckoutSession({
        plan: plan.plan,
        billingCycle,
      })

      const baseUrl = window.location.origin
      const failUrl = `${baseUrl}/subscription/fail`

      if (billingCycle === 'MONTHLY') {
        // 월간: 토스 빌링 인증은 orderId를 리다이렉트 파라미터로 전달하지 않으므로 미리 포함
        const successUrl = `${baseUrl}/subscription/success?orderId=${checkout.orderId}`
        // 월간 정기 결제: 카드 등록 후 빌링키 발급
        await requestBillingAuth({
          customerKey: checkout.customerKey,
          successUrl,
          failUrl,
        })
      } else {
        // 연간 단건 결제: 토스가 orderId를 리다이렉트 파라미터로 자동 전달하므로 미리 포함하지 않음
        const successUrl = `${baseUrl}/subscription/success`
        await requestPayment({
          customerKey: checkout.customerKey,
          amount: checkout.amount,
          orderId: checkout.orderId,
          orderName: checkout.orderName,
          successUrl,
          failUrl,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '결제 처리 중 오류가 발생했습니다')
    } finally {
      setIsCheckingOut(false)
    }
  }

  async function handleCancelSubscription() {
    if (!confirm('월간 자동결제를 해제하시겠습니까? 남은 구독 기간 동안은 계속 이용할 수 있습니다.')) {
      return
    }

    try {
      setIsCancelling(true)
      setError(null)
      const updated = await cancelSubscription()
      setSubscription(updated)
      setSuccessMessage('자동결제가 해제되었습니다. 만료일까지 프리미엄 기능을 이용할 수 있습니다.')
    } catch (err) {
      setError(err instanceof Error ? err.message : '자동결제 해제에 실패했습니다')
    } finally {
      setIsCancelling(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const isSubscribed = subscription?.isActive
  const price = plan ? (billingCycle === 'MONTHLY' ? plan.monthlyPrice : plan.yearlyPrice) : 0
  const monthlyPrice = billingCycle === 'YEARLY' ? Math.round(price / 12) : price

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader
        variant="brand-back"
        container="max-w-4xl"
        backTo="/mypage"
        backLabel="마이페이지"
        hideBackLabelOnMobile
      />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <CreditCard className="h-6 w-6 md:h-8 md:w-8" />
            구독 관리
          </h1>
          <p className="mt-2 text-gray-600">
            프리미엄으로 더 많은 기능을 이용하세요
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* Current Subscription */}
        {subscription && subscription.status !== 'EXPIRED' && (
          <div className="mb-8">
            <CurrentSubscription
              subscription={subscription}
              onCancel={handleCancelSubscription}
              isCancelling={isCancelling}
            />
          </div>
        )}

        {/* Plan Comparison */}
        {!isSubscribed && plan && (
          <div className="mb-8">
            {/* Billing Cycle Toggle */}
            <div className="mb-6">
              <BillingCycleToggle value={billingCycle} onChange={setBillingCycle} />
            </div>

            {/* Comparison Table */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[360px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-600 w-1/4 border-r border-gray-200">기능</th>
                    <th className="text-center p-4 font-medium text-gray-600 w-1/4 border-r border-gray-200">비로그인</th>
                    <th className="text-center p-4 font-medium text-gray-600 w-1/4 border-r border-gray-200">로그인</th>
                    <th className="text-center p-4 font-medium text-gray-600 w-1/4 bg-primary/5">
                      <div className="flex items-center justify-center gap-1">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-primary">{plan.displayName || '프리미엄'}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-4 text-gray-700 border-r border-gray-200">학습 카드</td>
                    <td className="p-4 text-center text-gray-500 border-r border-gray-200">15개/일</td>
                    <td className="p-4 text-center text-gray-500 border-r border-gray-200">무제한</td>
                    <td className="p-4 text-center bg-primary/5 font-medium text-primary">무제한</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-gray-700 border-r border-gray-200">진행도 저장</td>
                    <td className="p-4 text-center border-r border-gray-200">
                      <span className="text-gray-300">-</span>
                    </td>
                    <td className="p-4 text-center border-r border-gray-200">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="p-4 text-center bg-primary/5">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 text-gray-700 border-r border-gray-200">AI 카드 생성</td>
                    <td className="p-4 text-center border-r border-gray-200">
                      <span className="text-gray-300">-</span>
                    </td>
                    <td className="p-4 text-center text-gray-500 border-r border-gray-200">5회 체험</td>
                    <td className="p-4 text-center bg-primary/5 font-medium text-primary">30회/일</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-gray-700 border-r border-gray-200">AI 복습 전략</td>
                    <td className="p-4 text-center border-r border-gray-200">
                      <span className="text-gray-300">-</span>
                    </td>
                    <td className="p-4 text-center border-r border-gray-200">
                      <span className="text-gray-300">-</span>
                    </td>
                    <td className="p-4 text-center bg-primary/5">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-medium text-gray-900 border-r border-gray-200">가격</td>
                    <td className="p-4 text-center font-medium text-gray-900 border-r border-gray-200">무료</td>
                    <td className="p-4 text-center font-medium text-gray-900 border-r border-gray-200">무료</td>
                    <td className="p-4 text-center bg-primary/5">
                      <div className="font-bold text-primary">
                        {monthlyPrice.toLocaleString()}원/월
                      </div>
                      {billingCycle === 'YEARLY' && (
                        <div className="text-xs text-gray-500">
                          연 {price.toLocaleString()}원
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Subscribe Button */}
            <div className="mt-6 text-center">
              {isLoggedIn ? (
                <Button
                  size="lg"
                  onClick={handleSubscribe}
                  disabled={isCheckingOut}
                  className="px-8"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {plan.displayName || '프리미엄'} 구독하기
                    </>
                  )}
                </Button>
              ) : (
                <Button size="lg" asChild className="px-8">
                  <Link to="/login?redirect=/subscription">
                    로그인하고 구독하기
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Invoices */}
        {isLoggedIn && invoices.length > 0 && (
          <InvoiceList invoices={invoices} />
        )}
      </main>

      <AppFooter container="max-w-4xl" />
    </div>
  )
}
