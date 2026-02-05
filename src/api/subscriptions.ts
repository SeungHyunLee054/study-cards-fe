import { apiClient, publicClient } from './client'
import { AxiosError } from 'axios'
import type {
  PlanResponse,
  SubscriptionResponse,
  CheckoutRequest,
  CheckoutResponse,
  BillingConfirmRequest,
  InvoiceResponse,
  CancelRequest,
} from '@/types/subscription'

// 요금제 목록 조회 (인증 불필요)
export async function fetchPlans(): Promise<PlanResponse[]> {
  try {
    const response = await publicClient.get<PlanResponse[]>('/api/subscriptions/plans')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '요금제 목록을 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 내 구독 정보 조회
export async function fetchMySubscription(): Promise<SubscriptionResponse | null> {
  try {
    const response = await apiClient.get<SubscriptionResponse>('/api/subscriptions/me')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        return null
      }
      throw new Error(error.response?.data?.message || '구독 정보를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 결제 세션 생성
export async function createCheckoutSession(request: CheckoutRequest): Promise<CheckoutResponse> {
  try {
    const response = await apiClient.post<CheckoutResponse>('/api/subscriptions/checkout', request)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '결제 세션 생성에 실패했습니다.')
    }
    throw error
  }
}

// 빌링 인증 확인 및 첫 결제
export async function confirmBilling(request: BillingConfirmRequest): Promise<SubscriptionResponse> {
  try {
    const response = await apiClient.post<SubscriptionResponse>('/api/subscriptions/confirm', request)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '결제 확인에 실패했습니다.')
    }
    throw error
  }
}

// 구독 취소
export async function cancelSubscription(request?: CancelRequest): Promise<SubscriptionResponse> {
  try {
    const response = await apiClient.post<SubscriptionResponse>('/api/subscriptions/cancel', request || {})
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '구독 취소에 실패했습니다.')
    }
    throw error
  }
}

// 결제 내역 조회
export async function fetchInvoices(): Promise<InvoiceResponse[]> {
  try {
    const response = await apiClient.get<InvoiceResponse[]>('/api/subscriptions/invoices')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '결제 내역을 불러오는데 실패했습니다.')
    }
    throw error
  }
}
