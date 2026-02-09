import { loadTossPayments } from '@tosspayments/tosspayments-sdk'

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || ''

let tossPaymentsInstance: Awaited<ReturnType<typeof loadTossPayments>> | null = null

async function getTossPayments() {
  if (!TOSS_CLIENT_KEY) {
    throw new Error('Toss 클라이언트 키가 설정되지 않았습니다.')
  }

  if (!tossPaymentsInstance) {
    tossPaymentsInstance = await loadTossPayments(TOSS_CLIENT_KEY)
  }

  return tossPaymentsInstance
}

export interface TossBillingAuthRequest {
  customerKey: string
  successUrl: string
  failUrl: string
}

export interface TossPaymentRequest {
  customerKey: string
  amount: number
  orderId: string
  orderName: string
  successUrl: string
  failUrl: string
}

export async function requestBillingAuth(request: TossBillingAuthRequest): Promise<void> {
  const tossPayments = await getTossPayments()
  const payment = tossPayments.payment({ customerKey: request.customerKey })

  await payment.requestBillingAuth({
    method: 'CARD',
    successUrl: request.successUrl,
    failUrl: request.failUrl,
  })
}

export async function requestPayment(request: TossPaymentRequest): Promise<void> {
  const tossPayments = await getTossPayments()
  const payment = tossPayments.payment({ customerKey: request.customerKey })

  await payment.requestPayment({
    method: 'CARD',
    amount: {
      currency: 'KRW',
      value: request.amount,
    },
    orderId: request.orderId,
    orderName: request.orderName,
    successUrl: request.successUrl,
    failUrl: request.failUrl,
  })
}
