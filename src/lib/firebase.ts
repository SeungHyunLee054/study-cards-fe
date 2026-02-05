import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Firebase 앱 초기화 (중복 방지)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

let messaging: Messaging | null = null

// 브라우저 지원 여부 확인 후 messaging 초기화
async function getMessagingInstance(): Promise<Messaging | null> {
  if (messaging) return messaging

  const supported = await isSupported()
  if (!supported) {
    console.warn('Firebase Messaging is not supported in this browser')
    return null
  }

  messaging = getMessaging(app)
  return messaging
}

// FCM 토큰 발급
export async function requestFcmToken(): Promise<string | null> {
  try {
    // 알림 권한 요청
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('Notification permission denied')
      return null
    }

    const messagingInstance = await getMessagingInstance()
    if (!messagingInstance) return null

    // VAPID 키로 토큰 발급
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
    if (!vapidKey) {
      console.error('VAPID key is not configured')
      return null
    }

    const token = await getToken(messagingInstance, { vapidKey })
    return token
  } catch (error) {
    console.error('Failed to get FCM token:', error)
    return null
  }
}

// 포그라운드 메시지 수신 리스너
export async function onForegroundMessage(callback: (payload: unknown) => void): Promise<(() => void) | null> {
  const messagingInstance = await getMessagingInstance()
  if (!messagingInstance) return null

  return onMessage(messagingInstance, callback)
}

// 알림 권한 상태 확인
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied'
  }
  return Notification.permission
}

// FCM 지원 여부 확인
export async function isFcmSupported(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (!('serviceWorker' in navigator)) return false
  return await isSupported()
}
