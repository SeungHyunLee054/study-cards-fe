// 알림 타입 (백엔드와 일치)
export type NotificationType =
  | 'DAILY_REVIEW'             // 일일 복습 리마인드
  | 'SUBSCRIPTION_EXPIRING_7'  // 구독 만료 D-7
  | 'SUBSCRIPTION_EXPIRING_3'  // 구독 만료 D-3
  | 'SUBSCRIPTION_EXPIRING_1'  // 구독 만료 D-1
  | 'PAYMENT_FAILED'           // 결제 실패
  | 'STREAK_7'                 // 스트릭 7일 달성
  | 'STREAK_30'                // 스트릭 30일 달성
  | 'STREAK_100'               // 스트릭 100일 달성
  | 'CATEGORY_MASTERED'        // 카테고리 마스터

// 알림 응답 (백엔드와 일치)
export interface NotificationResponse {
  id: number
  type: NotificationType
  title: string
  body: string  // 백엔드: body (not message)
  isRead: boolean
  referenceId: number | null
  createdAt: string
}

// FCM 토큰 등록 요청
export interface FcmTokenRequest {
  fcmToken: string
}

// 푸시 설정 요청
export interface PushSettingRequest {
  pushEnabled: boolean
}

// 푸시 설정 응답
export interface PushSettingResponse {
  pushEnabled: boolean
  hasFcmToken: boolean
}
