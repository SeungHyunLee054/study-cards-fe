import { apiClient } from './client'
import { withApiErrorHandling } from './helpers'
import type {
  FcmTokenRequest,
  PushSettingRequest,
  PushSettingResponse,
  NotificationResponse,
} from '@/types/notification'

// FCM 토큰 등록
export async function registerFcmToken(fcmToken: string): Promise<void> {
  return withApiErrorHandling(async () => {
    const request: FcmTokenRequest = { fcmToken }
    await apiClient.post('/api/notifications/fcm-token', request)
  }, 'FCM 토큰 등록에 실패했습니다.')
}

// FCM 토큰 제거
export async function removeFcmToken(): Promise<void> {
  return withApiErrorHandling(async () => {
    await apiClient.delete('/api/notifications/fcm-token')
  }, 'FCM 토큰 제거에 실패했습니다.')
}

// 푸시 설정 조회
export async function getPushSettings(): Promise<PushSettingResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<PushSettingResponse>('/api/notifications/settings')
    return response.data
  }, '푸시 설정을 불러오는데 실패했습니다.')
}

// 푸시 설정 수정
export async function updatePushSettings(pushEnabled: boolean): Promise<PushSettingResponse> {
  return withApiErrorHandling(async () => {
    const request: PushSettingRequest = { pushEnabled }
    const response = await apiClient.patch<PushSettingResponse>('/api/notifications/settings', request)
    return response.data
  }, '푸시 설정 수정에 실패했습니다.')
}

// 알림 목록 조회
export async function fetchNotifications(): Promise<NotificationResponse[]> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get('/api/notifications')
    const data = response.data
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.content)) return data.content
    return []
  }, '알림 목록을 불러오는데 실패했습니다.')
}

// 읽지 않은 알림 목록 조회
export async function fetchUnreadNotifications(): Promise<NotificationResponse[]> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get('/api/notifications/unread')
    const data = response.data
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.content)) return data.content
    return []
  }, '읽지 않은 알림을 불러오는데 실패했습니다.')
}

// 읽지 않은 알림 개수 조회
export async function fetchUnreadCount(): Promise<number> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get('/api/notifications/unread/count')
    return response.data?.count ?? 0
  }, '읽지 않은 알림 개수를 불러오는데 실패했습니다.')
}

// 알림 읽음 처리
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  return withApiErrorHandling(async () => {
    await apiClient.patch(`/api/notifications/${notificationId}/read`)
  }, '알림 읽음 처리에 실패했습니다.')
}

// 모든 알림 읽음 처리
export async function markAllNotificationsAsRead(): Promise<void> {
  return withApiErrorHandling(async () => {
    await apiClient.patch('/api/notifications/read-all')
  }, '알림 읽음 처리에 실패했습니다.')
}
