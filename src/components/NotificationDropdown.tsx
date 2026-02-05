import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check, Loader2, Flame, Trophy, CreditCard, AlertCircle, BookOpen } from 'lucide-react'
import { fetchNotifications, fetchUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } from '@/api/notifications'
import type { NotificationResponse, NotificationType } from '@/types/notification'

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'DAILY_REVIEW':
      return <BookOpen className="h-4 w-4 text-blue-500" />
    case 'STREAK_7':
    case 'STREAK_30':
    case 'STREAK_100':
      return <Flame className="h-4 w-4 text-orange-500" />
    case 'CATEGORY_MASTERED':
      return <Trophy className="h-4 w-4 text-yellow-500" />
    case 'SUBSCRIPTION_EXPIRING_7':
    case 'SUBSCRIPTION_EXPIRING_3':
    case 'SUBSCRIPTION_EXPIRING_1':
      return <CreditCard className="h-4 w-4 text-purple-500" />
    case 'PAYMENT_FAILED':
      return <AlertCircle className="h-4 w-4 text-red-500" />
    default:
      return <Bell className="h-4 w-4 text-gray-500" />
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`
  return date.toLocaleDateString('ko-KR')
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadUnreadCount()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function loadUnreadCount() {
    try {
      const count = await fetchUnreadCount()
      setUnreadCount(count)
    } catch {
      // 에러 무시
    }
  }

  async function loadNotifications() {
    try {
      setIsLoading(true)
      setError(null)
      const [notificationList, count] = await Promise.all([
        fetchNotifications(),
        fetchUnreadCount(),
      ])
      setNotifications(notificationList)
      setUnreadCount(count)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알림을 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  function handleOpen() {
    setIsOpen(!isOpen)
    if (!isOpen) {
      loadNotifications()
    }
  }

  async function handleMarkAsRead(id: number) {
    try {
      await markNotificationAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // 에러 무시
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // 에러 무시
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="알림"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">알림</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary hover:underline"
              >
                모두 읽음
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="p-8 text-center text-gray-500">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                알림이 없습니다
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {notification.body}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                            title="읽음 처리"
                          >
                            <Check className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <Link
              to="/settings"
              className="block text-center text-sm text-gray-600 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              알림 설정
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
