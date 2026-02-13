import { apiClient } from './client'
import { AxiosError } from 'axios'
import type {
  FcmTokenRequest,
  PushSettingRequest,
  PushSettingResponse,
  NotificationResponse,
} from '@/types/notification'

// FCM 토큰 등록
export async function registerFcmToken(fcmToken: string): Promise<void> {
  try {
    const request: FcmTokenRequest = { fcmToken }
    await apiClient.post('/api/notifications/fcm-token', request)
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'FCM 토큰 등록에 실패했습니다.')
    }
    throw error
  }
}

// FCM 토큰 제거
export async function removeFcmToken(): Promise<void> {
  try {
    await apiClient.delete('/api/notifications/fcm-token')
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'FCM 토큰 제거에 실패했습니다.')
    }
    throw error
  }
}

// 푸시 설정 조회
export async function getPushSettings(): Promise<PushSettingResponse> {
  try {
    const response = await apiClient.get<PushSettingResponse>('/api/notifications/settings')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '푸시 설정을 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 푸시 설정 수정
export async function updatePushSettings(pushEnabled: boolean): Promise<PushSettingResponse> {
  try {
    const request: PushSettingRequest = { pushEnabled }
    const response = await apiClient.patch<PushSettingResponse>('/api/notifications/settings', request)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '푸시 설정 수정에 실패했습니다.')
    }
    throw error
  }
}

// 알림 목록 조회
export async function fetchNotifications(): Promise<NotificationResponse[]> {
  try {
    const response = await apiClient.get('/api/notifications')
    const data = response.data
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.content)) return data.content
    return []
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '알림 목록을 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 읽지 않은 알림 목록 조회
export async function fetchUnreadNotifications(): Promise<NotificationResponse[]> {
  try {
    const response = await apiClient.get('/api/notifications/unread')
    const data = response.data
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.content)) return data.content
    return []
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '읽지 않은 알림을 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 읽지 않은 알림 개수 조회
export async function fetchUnreadCount(): Promise<number> {
  try {
    const response = await apiClient.get('/api/notifications/unread/count')
    return response.data?.count ?? 0
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '읽지 않은 알림 개수를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 알림 읽음 처리
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  try {
    await apiClient.patch(`/api/notifications/${notificationId}/read`)
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '알림 읽음 처리에 실패했습니다.')
    }
    throw error
  }
}

// 모든 알림 읽음 처리
export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await apiClient.patch('/api/notifications/read-all')
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '알림 읽음 처리에 실패했습니다.')
    }
    throw error
  }
}

