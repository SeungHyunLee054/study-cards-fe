import { AxiosError } from 'axios'
import { apiClient, publicClient } from './client'
import { toAppError, withApiErrorHandling } from './helpers'
import type { PageResponse } from '@/types/card'
import type {
  PlanResponse,
  SubscriptionResponse,
  CheckoutRequest,
  CheckoutResponse,
  BillingConfirmRequest,
  PaymentConfirmRequest,
  InvoiceResponse,
  CancelRequest,
} from '@/types/subscription'

// 요금제 목록 조회 (인증 불필요)
export async function fetchPlans(): Promise<PlanResponse[]> {
  return withApiErrorHandling(async () => {
    const response = await publicClient.get<PlanResponse[]>('/api/subscriptions/plans')
    return response.data
  }, '요금제 목록을 불러오는데 실패했습니다.')
}

// 내 구독 정보 조회
export async function fetchMySubscription(): Promise<SubscriptionResponse | null> {
  try {
    const response = await apiClient.get<SubscriptionResponse>('/api/subscriptions/me')
    if (response.status === 204 || !response.data) {
      return null
    }
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null
    }
    return toAppError(error, '구독 정보를 불러오는데 실패했습니다.')
  }
}

// 결제 세션 생성
export async function createCheckoutSession(request: CheckoutRequest): Promise<CheckoutResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.post<CheckoutResponse>('/api/payments/checkout', request)
    return response.data
  }, '결제 세션 생성에 실패했습니다.')
}

// 빌링 인증 확인 및 첫 결제
export async function confirmBilling(request: BillingConfirmRequest): Promise<SubscriptionResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.post<SubscriptionResponse>('/api/payments/confirm-billing', request)
    return response.data
  }, '결제 확인에 실패했습니다.')
}

// 연간 선결제 확인 (단건 결제)
export async function confirmPayment(request: PaymentConfirmRequest): Promise<SubscriptionResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.post<SubscriptionResponse>('/api/payments/confirm', request)
    return response.data
  }, '결제 확인에 실패했습니다.')
}

// 월간 구독 자동 갱신 해제
export async function cancelSubscription(request?: CancelRequest): Promise<SubscriptionResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.post<SubscriptionResponse>('/api/subscriptions/cancel', request || {})
    return response.data
  }, '자동결제 해제에 실패했습니다.')
}

// 결제 내역 조회
export async function fetchInvoices(): Promise<InvoiceResponse[]> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<PageResponse<InvoiceResponse>>('/api/payments/invoices')
    return response.data?.content ?? []
  }, '결제 내역을 불러오는데 실패했습니다.')
}
