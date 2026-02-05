import { loadTossPayments, TossPaymentsInstance } from '@tosspayments/payment-sdk'

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || ''

let tossPaymentsInstance: TossPaymentsInstance | null = null

export async function getTossPayments(): Promise<TossPaymentsInstance> {
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
  amount: number
  orderId: string
  orderName: string
  successUrl: string
  failUrl: string
}

export async function requestBillingAuth(request: TossBillingAuthRequest): Promise<void> {
  const tossPayments = await getTossPayments()

  await tossPayments.requestBillingAuth('카드', {
    customerKey: request.customerKey,
    successUrl: request.successUrl,
    failUrl: request.failUrl,
  })
}

export async function requestPayment(request: TossPaymentRequest): Promise<void> {
  const tossPayments = await getTossPayments()

  await tossPayments.requestPayment('카드', {
    amount: request.amount,
    orderId: request.orderId,
    orderName: request.orderName,
    successUrl: request.successUrl,
    failUrl: request.failUrl,
  })
}
