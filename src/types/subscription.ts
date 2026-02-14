export type PlanType = 'FREE' | 'PRO'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PENDING'
export type BillingCycle = 'MONTHLY' | 'YEARLY'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'CANCELED' | 'FAILED'
export type PaymentType = 'INITIAL' | 'RENEWAL' | 'UPGRADE'

export interface PlanResponse {
  plan: PlanType
  displayName: string
  monthlyPrice: number
  yearlyPrice: number
  canGenerateAiCards: boolean
  canUseAiRecommendations: boolean
  aiGenerationDailyLimit: number
  isPurchasable: boolean
}

export interface SubscriptionResponse {
  id: number
  plan: PlanType
  planDisplayName: string
  status: SubscriptionStatus
  billingCycle: BillingCycle
  startDate: string
  endDate: string
  isActive: boolean
  canGenerateAiCards: boolean
  canUseAiRecommendations: boolean
  aiGenerationDailyLimit: number
}

export interface CheckoutRequest {
  plan: PlanType
  billingCycle: BillingCycle
}

export interface CheckoutResponse {
  orderId: string
  customerKey: string
  amount: number
  orderName: string
}

export interface BillingConfirmRequest {
  authKey: string
  customerKey: string
  orderId: string
}

export interface InvoiceResponse {
  id: number
  orderId: string
  amount: number
  status: PaymentStatus
  paymentType: PaymentType
  planType: PlanType
  billingCycle: BillingCycle
  paidAt: string | null
  createdAt: string
}

export interface PaymentConfirmRequest {
  paymentKey: string
  orderId: string
  amount: number
}

export interface CancelRequest {
  reason?: string
}
