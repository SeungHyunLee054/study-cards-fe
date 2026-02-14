import { useState, useEffect } from 'react'
import { Loader2, User, Lock, Bell, Smartphone, AlertTriangle } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/useAuth'
import { updateUserProfile, changePassword, withdrawMyAccount } from '@/api/users'
import { getPushSettings, updatePushSettings, registerFcmToken, removeFcmToken } from '@/api/notifications'
import { requestFcmToken, isFcmSupported, getNotificationPermission } from '@/lib/firebase'
import type { PushSettingResponse } from '@/types/notification'

interface ToggleSwitchProps {
  enabled: boolean
  onChange: () => void
  disabled?: boolean
}

function ToggleSwitch({ enabled, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        enabled ? 'bg-primary' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export function SettingsPage() {
  const { user, isLoading: authLoading, refreshUser, logout } = useAuth()

  const [nickname, setNickname] = useState('')
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)

  const [pushSettings, setPushSettings] = useState<PushSettingResponse | null>(null)
  const [isNotificationLoading, setIsNotificationLoading] = useState(true)
  const [isNotificationSubmitting, setIsNotificationSubmitting] = useState(false)
  const [notificationError, setNotificationError] = useState<string | null>(null)
  const [isFcmAvailable, setIsFcmAvailable] = useState(false)
  const [isDeviceRegistering, setIsDeviceRegistering] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [withdrawError, setWithdrawError] = useState<string | null>(null)
  const [isWithdrawSubmitting, setIsWithdrawSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setNickname(user.nickname)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadPushSettings()
      checkFcmSupport()
    }
  }, [user])

  async function checkFcmSupport() {
    const supported = await isFcmSupported()
    setIsFcmAvailable(supported)
    if (supported) {
      setNotificationPermission(getNotificationPermission())
    }
  }

  async function loadPushSettings() {
    try {
      setIsNotificationLoading(true)
      const settings = await getPushSettings()
      setPushSettings(settings)
    } catch (err) {
      setNotificationError(err instanceof Error ? err.message : '알림 설정을 불러오는데 실패했습니다')
    } finally {
      setIsNotificationLoading(false)
    }
  }

  async function handlePushToggle() {
    if (!pushSettings) return

    const newPushEnabled = !pushSettings.pushEnabled

    try {
      setIsNotificationSubmitting(true)
      setNotificationError(null)

      // 푸시 알림을 켜는 경우, FCM 토큰 등록 시도
      if (newPushEnabled && isFcmAvailable && !pushSettings.hasFcmToken) {
        await handleDeviceRegister()
      }

      const newSettings = await updatePushSettings(newPushEnabled)
      setPushSettings(newSettings)
    } catch (err) {
      setNotificationError(err instanceof Error ? err.message : '알림 설정 변경에 실패했습니다')
    } finally {
      setIsNotificationSubmitting(false)
    }
  }

  async function handleDeviceRegister() {
    try {
      setIsDeviceRegistering(true)
      setNotificationError(null)

      const token = await requestFcmToken()
      if (!token) {
        const permission = getNotificationPermission()
        setNotificationPermission(permission)
        if (permission === 'denied') {
          setNotificationError('브라우저 알림 권한이 차단되어 있습니다. 브라우저 설정에서 알림을 허용해주세요.')
        } else {
          setNotificationError('FCM 토큰을 발급받지 못했습니다. 다시 시도해주세요.')
        }
        return
      }

      await registerFcmToken(token)
      setNotificationPermission('granted')

      // 설정 다시 불러오기
      const newSettings = await getPushSettings()
      setPushSettings(newSettings)
    } catch (err) {
      setNotificationError(err instanceof Error ? err.message : '기기 등록에 실패했습니다')
    } finally {
      setIsDeviceRegistering(false)
    }
  }

  async function handleDeviceUnregister() {
    try {
      setIsDeviceRegistering(true)
      setNotificationError(null)

      await removeFcmToken()

      // 설정 다시 불러오기
      const newSettings = await getPushSettings()
      setPushSettings(newSettings)
    } catch (err) {
      setNotificationError(err instanceof Error ? err.message : '기기 등록 해제에 실패했습니다')
    } finally {
      setIsDeviceRegistering(false)
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(null)

    if (!nickname.trim()) {
      setProfileError('닉네임을 입력해주세요')
      return
    }

    try {
      setIsProfileSubmitting(true)
      await updateUserProfile({
        nickname: nickname.trim(),
      })
      await refreshUser()
      setProfileSuccess('프로필이 수정되었습니다')
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : '프로필 수정에 실패했습니다')
    } finally {
      setIsProfileSubmitting(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (!currentPassword) {
      setPasswordError('현재 비밀번호를 입력해주세요')
      return
    }

    if (!newPassword) {
      setPasswordError('새 비밀번호를 입력해주세요')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('새 비밀번호는 8자 이상이어야 합니다')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다')
      return
    }

    try {
      setIsPasswordSubmitting(true)
      await changePassword({
        currentPassword,
        newPassword,
      })
      setPasswordSuccess('비밀번호가 변경되었습니다')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다')
    } finally {
      setIsPasswordSubmitting(false)
    }
  }

  async function handleWithdrawAccount() {
    setWithdrawError(null)

    const firstConfirm = confirm(
      '회원 탈퇴를 진행하시겠습니까?\n탈퇴 후 계정은 복구할 수 없습니다.'
    )
    if (!firstConfirm) {
      return
    }

    const finalCheck = prompt('탈퇴를 진행하려면 "탈퇴"를 입력하세요.')
    if (finalCheck !== '탈퇴') {
      setWithdrawError('탈퇴 확인 문구가 일치하지 않습니다.')
      return
    }

    try {
      setIsWithdrawSubmitting(true)
      await withdrawMyAccount()
      await logout({
        redirectTo: '/login',
        replace: true,
        state: { message: '회원 탈퇴가 완료되었습니다.' },
      })
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : '회원 탈퇴에 실패했습니다')
      setIsWithdrawSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader variant="brand-back" container="max-w-4xl" backTo="/mypage" backLabel="마이페이지" />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">설정</h1>
          <p className="mt-1 text-gray-600">계정 설정을 관리하세요</p>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5" />
                프로필
              </h2>
            </div>
            <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
              {profileError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                  {profileSuccess}
                </div>
              )}

              <div>
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  className="mt-1"
                  disabled={isProfileSubmitting}
                />
              </div>

              <Button type="submit" disabled={isProfileSubmitting}>
                {isProfileSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  '변경사항 저장'
                )}
              </Button>
            </form>
          </div>

          {/* Password Section - 소셜 로그인 사용자에게는 표시하지 않음 */}
          {(!user?.provider || user.provider === 'LOCAL') && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  비밀번호 변경
                </h2>
              </div>
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                {passwordError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                    {passwordSuccess}
                  </div>
                )}

                <div>
                  <Label htmlFor="currentPassword">현재 비밀번호</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="현재 비밀번호를 입력하세요"
                    className="mt-1"
                    disabled={isPasswordSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">새 비밀번호</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호를 입력하세요"
                    className="mt-1"
                    disabled={isPasswordSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    className="mt-1"
                    disabled={isPasswordSubmitting}
                  />
                </div>

                <Button type="submit" disabled={isPasswordSubmitting}>
                  {isPasswordSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      변경 중...
                    </>
                  ) : (
                    '비밀번호 변경'
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* Notification Section */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                알림 설정
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {notificationError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {notificationError}
                </div>
              )}

              {isNotificationLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  로딩 중...
                </div>
              ) : pushSettings ? (
                <div className="space-y-6">
                  {/* 전체 푸시 알림 */}
                  <div className="flex items-start sm:items-center justify-between gap-4">
                    <div>
                      <Label className="text-base">푸시 알림</Label>
                      <p className="text-sm text-gray-500 mt-1">
                        모든 푸시 알림을 켜거나 끕니다
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={pushSettings.pushEnabled}
                      onChange={handlePushToggle}
                      disabled={isNotificationSubmitting}
                    />
                  </div>

                  {/* 기기 등록 상태 */}
                  {!isFcmAvailable && (
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-sm">
                      이 브라우저는 푸시 알림을 지원하지 않습니다.
                    </div>
                  )}

                  {isFcmAvailable && !pushSettings.hasFcmToken && pushSettings.pushEnabled && (
                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                      <p className="text-yellow-700 text-sm mb-3">
                        {notificationPermission === 'denied'
                          ? '브라우저 알림 권한이 차단되어 있습니다. 브라우저 설정에서 알림을 허용해주세요.'
                          : '알림을 받으려면 기기 등록이 필요합니다.'}
                      </p>
                      {notificationPermission !== 'denied' && (
                        <Button
                          size="sm"
                          onClick={handleDeviceRegister}
                          disabled={isDeviceRegistering}
                        >
                          {isDeviceRegistering ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              등록 중...
                            </>
                          ) : (
                            <>
                              <Smartphone className="mr-2 h-4 w-4" />
                              이 기기 등록하기
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}

                  {pushSettings.pushEnabled && (
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="text-sm text-gray-600">
                        다음 알림을 받게 됩니다:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-500">
                        <li>• 일일 복습 리마인드</li>
                        <li>• 연속 학습 달성 (7일, 30일, 100일)</li>
                        <li>• 카테고리 마스터 달성</li>
                        <li>• 구독 만료 임박 (D-7, D-3, D-1)</li>
                        <li>• 결제 실패 알림</li>
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">기기 상태: </span>
                      {pushSettings.hasFcmToken ? (
                        <span className="text-green-600">등록됨</span>
                      ) : (
                        <span className="text-gray-400">미등록</span>
                      )}
                    </div>
                    {pushSettings.hasFcmToken && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeviceUnregister}
                        disabled={isDeviceRegistering}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {isDeviceRegistering ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          '기기 등록 해제'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">알림 설정을 불러올 수 없습니다</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/40">
            <div className="p-6 border-b border-red-200">
              <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                계정 탈퇴
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {withdrawError && (
                <div className="p-3 rounded-lg bg-red-100 border border-red-200 text-red-700 text-sm">
                  {withdrawError}
                </div>
              )}
              <p className="text-sm text-gray-700">
                회원 탈퇴 시 계정 정보와 로그인 세션이 비활성화되며, 동일 계정으로 자동 복구할 수 없습니다.
              </p>
              <p className="text-xs text-gray-500">
                탈퇴를 진행하면 즉시 로그아웃됩니다.
              </p>
              <Button
                variant="destructive"
                onClick={handleWithdrawAccount}
                disabled={isWithdrawSubmitting}
              >
                {isWithdrawSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    탈퇴 처리 중...
                  </>
                ) : (
                  '회원 탈퇴'
                )}
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
