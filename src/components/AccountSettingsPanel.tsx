import { useEffect, useState } from 'react'
import { AlertTriangle, Bell, Loader2, Lock, Smartphone, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/ConfirmDialog'
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

interface AccountSettingsPanelProps {
  className?: string
}

export function AccountSettingsPanel({ className }: AccountSettingsPanelProps) {
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
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [withdrawConfirmText, setWithdrawConfirmText] = useState('')

  useEffect(() => {
    if (user) {
      setNickname(user.nickname)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      void loadPushSettings()
      void checkFcmSupport()
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

    const nextPushEnabled = !pushSettings.pushEnabled

    try {
      setIsNotificationSubmitting(true)
      setNotificationError(null)

      if (nextPushEnabled && isFcmAvailable && !pushSettings.hasFcmToken) {
        await handleDeviceRegister()
      }

      const nextSettings = await updatePushSettings(nextPushEnabled)
      setPushSettings(nextSettings)
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
      const nextSettings = await getPushSettings()
      setPushSettings(nextSettings)
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
      const nextSettings = await getPushSettings()
      setPushSettings(nextSettings)
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
      await updateUserProfile({ nickname: nickname.trim() })
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
      await changePassword({ currentPassword, newPassword })
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

  function openWithdrawDialog() {
    setWithdrawError(null)
    setWithdrawConfirmText('')
    setIsWithdrawDialogOpen(true)
  }

  function closeWithdrawDialog() {
    if (isWithdrawSubmitting) return
    setIsWithdrawDialogOpen(false)
    setWithdrawConfirmText('')
  }

  async function handleWithdrawAccount() {
    setWithdrawError(null)

    if (withdrawConfirmText.trim() !== '탈퇴') {
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
      <div className="rounded-xl border border-gray-200 bg-white p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-8">
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
                <div className="flex items-start sm:items-center justify-between gap-4">
                  <div>
                    <Label className="text-base">푸시 알림</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      모든 푸시 알림을 켜거나 끕니다
                    </p>
                  </div>
                  <ToggleSwitch
                    enabled={pushSettings.pushEnabled}
                    onChange={() => { void handlePushToggle() }}
                    disabled={isNotificationSubmitting}
                  />
                </div>

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
                        onClick={() => { void handleDeviceRegister() }}
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
                      onClick={() => { void handleDeviceUnregister() }}
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
              onClick={openWithdrawDialog}
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

      <ConfirmDialog
        isOpen={isWithdrawDialogOpen}
        title="회원 탈퇴 확인"
        description={(
          <>
            계정 복구가 불가능합니다. 진행하려면 아래 입력칸에
            {' '}
            <span className="font-semibold text-gray-900">탈퇴</span>
            {' '}
            를 입력하세요.
          </>
        )}
        confirmLabel="회원 탈퇴"
        confirmVariant="destructive"
        isConfirming={isWithdrawSubmitting}
        onCancel={closeWithdrawDialog}
        onConfirm={() => void handleWithdrawAccount()}
      >
        <div className="space-y-2">
          <Label htmlFor="withdraw-confirm-text">확인 문구</Label>
          <Input
            id="withdraw-confirm-text"
            value={withdrawConfirmText}
            onChange={(e) => setWithdrawConfirmText(e.target.value)}
            placeholder="탈퇴"
            disabled={isWithdrawSubmitting}
            autoFocus
          />
        </div>

        {withdrawError && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {withdrawError}
          </div>
        )}
      </ConfirmDialog>
    </div>
  )
}
