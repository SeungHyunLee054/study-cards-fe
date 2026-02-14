import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Filter, Loader2, Shield, UserX, Users, Sparkles, BookOpen, User } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { banAdminUser, fetchAdminUser, fetchAdminUsers } from '@/api/admin-users'
import type { AdminUserResponse, AdminUserStatus } from '@/types/admin'
import type { PageResponse } from '@/types/card'

type StatusFilter = 'ALL' | AdminUserStatus

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'WITHDRAWN', label: '탈퇴' },
  { value: 'BANNED', label: '이용 제한' },
]

function formatDateTime(value: string | null): string {
  if (!value) return '-'
  return new Date(value).toLocaleString('ko-KR')
}

function getStatusChip(status: AdminUserStatus): { label: string; className: string } {
  if (status === 'ACTIVE') {
    return {
      label: '활성',
      className: 'bg-green-100 text-green-700',
    }
  }

  if (status === 'BANNED') {
    return {
      label: '이용 제한',
      className: 'bg-red-100 text-red-700',
    }
  }

  return {
    label: '탈퇴',
    className: 'bg-gray-100 text-gray-700',
  }
}

function getStatusLabel(status: AdminUserStatus): string {
  if (status === 'ACTIVE') return '활성'
  if (status === 'BANNED') return '이용 제한'
  return '탈퇴'
}

function getRoleLabel(role: string): string {
  if (role === 'ROLE_ADMIN') return '관리자'
  if (role === 'ROLE_USER') return '일반 사용자'
  return role
}

function getProviderLabel(provider: string): string {
  if (provider === 'LOCAL') return '이메일'
  if (provider === 'GOOGLE') return 'Google'
  if (provider === 'KAKAO') return 'Kakao'
  if (provider === 'NAVER') return 'Naver'
  return provider
}

export function AdminUsersPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [page, setPage] = useState(0)
  const [usersPage, setUsersPage] = useState<PageResponse<AdminUserResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [banTargetUser, setBanTargetUser] = useState<AdminUserResponse | null>(null)

  const loadUsers = useCallback(async (isManualRefresh: boolean) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      const data = await fetchAdminUsers({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page,
        size: 20,
      })
      setUsersPage(data)

      setSelectedUserId((prevSelectedUserId) => {
        if (prevSelectedUserId && !data.content.some(user => user.id === prevSelectedUserId)) {
          setSelectedUser(null)
          return null
        }
        return prevSelectedUserId
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자 목록을 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    void loadUsers(false)
  }, [loadUsers])

  async function handleSelectUser(userId: number) {
    try {
      setSelectedUserId(userId)
      setIsDetailLoading(true)
      setError(null)
      const detail = await fetchAdminUser(userId)
      setSelectedUser(detail)
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자 상세 정보를 불러오는데 실패했습니다')
    } finally {
      setIsDetailLoading(false)
    }
  }

  function handleOpenBanDialog(user: AdminUserResponse) {
    if (user.status !== 'ACTIVE') {
      return
    }
    setBanTargetUser(user)
  }

  async function handleConfirmBanUser() {
    if (!banTargetUser || banTargetUser.status !== 'ACTIVE') {
      return
    }
    const targetUser = banTargetUser

    try {
      setActionLoadingId(targetUser.id)
      setError(null)
      await banAdminUser(targetUser.id)
      setBanTargetUser(null)
      await loadUsers(true)

      if (selectedUserId === targetUser.id) {
        const refreshed = await fetchAdminUser(targetUser.id)
        setSelectedUser(refreshed)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자 이용 제한 처리에 실패했습니다')
    } finally {
      setActionLoadingId(null)
    }
  }

  function handleStatusChange(nextStatus: StatusFilter) {
    setStatusFilter(nextStatus)
    setPage(0)
  }

  const users = usersPage?.content ?? []
  const totalElements = usersPage?.totalElements ?? 0
  const totalPages = usersPage?.totalPages ?? 0
  const currentPage = usersPage?.number ?? 0
  const isFirstPage = usersPage?.first ?? true
  const isLastPage = usersPage?.last ?? true

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader
        variant="brand-actions"
        rightSlot={(
          <>
            <span className="hidden sm:flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
              <Shield className="h-4 w-4" />
              관리자
            </span>
            <Button variant="ghost" size="sm" asChild className="min-h-[44px]">
              <Link to="/admin/cards" aria-label="카드 관리">
                <BookOpen className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">카드 관리</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="min-h-[44px]">
              <Link to="/admin/generation" aria-label="AI 생성">
                <Sparkles className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">AI 생성</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="min-h-[44px]">
              <Link to="/mypage" aria-label="마이페이지">
                <User className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">마이페이지</span>
              </Link>
            </Button>
          </>
        )}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">사용자 관리</h1>
          </div>
          <p className="text-gray-600">총 {totalElements.toLocaleString()}명의 사용자를 조회할 수 있습니다</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-900 hover:underline"
            >
              닫기
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-gray-500" />
            {STATUS_FILTERS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`px-4 py-2.5 text-sm rounded-lg transition-colors min-h-[44px] ${
                  statusFilter === option.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => void loadUsers(true)}
            disabled={isRefreshing}
            className="min-h-[44px]"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                새로고침 중...
              </>
            ) : (
              '새로고침'
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200 text-gray-600">
            조건에 맞는 사용자가 없습니다.
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => {
              const statusChip = getStatusChip(user.status)
              const isActionLoading = actionLoadingId === user.id

              return (
                <div key={user.id} className="p-4 rounded-xl border border-gray-200 bg-white">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusChip.className}`}>
                          {statusChip.label}
                        </span>
                        <span className="text-xs text-gray-500">ID: #{user.id}</span>
                        <span className="text-xs text-gray-500">가입: {formatDateTime(user.createdAt)}</span>
                      </div>
                      <p className="font-medium text-gray-900 truncate">{user.nickname}</p>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        권한: {user.roles.map(getRoleLabel).join(', ')} · 제공자: {getProviderLabel(user.provider)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[44px]"
                        onClick={() => void handleSelectUser(user.id)}
                      >
                        {selectedUserId === user.id && isDetailLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            상세
                          </>
                        )}
                      </Button>

                      {user.status === 'ACTIVE' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="min-h-[44px]"
                          disabled={isActionLoading}
                          onClick={() => handleOpenBanDialog(user)}
                        >
                          {isActionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              이용 제한
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {usersPage && totalPages > 0 && (
          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              페이지 {currentPage + 1} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={isFirstPage}
                className="min-h-[44px]"
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={isLastPage}
                className="min-h-[44px]"
              >
                다음
              </Button>
            </div>
          </div>
        )}

        {(selectedUserId || selectedUser) && (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">사용자 상세 정보</h2>
            </div>
            <div className="p-6">
              {isDetailLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  상세 정보를 불러오는 중...
                </div>
              ) : selectedUser ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">사용자 ID</p>
                    <p className="font-medium text-gray-900">{selectedUser.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">상태</p>
                    <p className="font-medium text-gray-900">{getStatusLabel(selectedUser.status)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">닉네임</p>
                    <p className="font-medium text-gray-900">{selectedUser.nickname}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">이메일</p>
                    <p className="font-medium text-gray-900 break-all">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">권한</p>
                    <p className="font-medium text-gray-900">{selectedUser.roles.map(getRoleLabel).join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">로그인 제공자</p>
                    <p className="font-medium text-gray-900">{getProviderLabel(selectedUser.provider)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">이메일 인증</p>
                    <p className="font-medium text-gray-900">{selectedUser.emailVerified ? '완료' : '미완료'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">가입일시</p>
                    <p className="font-medium text-gray-900">{formatDateTime(selectedUser.createdAt)}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500">최근 수정일시</p>
                    <p className="font-medium text-gray-900">{formatDateTime(selectedUser.modifiedAt)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">상세 정보를 조회할 사용자를 선택하세요.</p>
              )}
            </div>
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={!!banTargetUser}
        title="사용자 이용 제한"
        description={banTargetUser ? (
          <>
            <span className="font-medium text-gray-900">{banTargetUser.nickname}</span>
            {' '}
            사용자를 이용 제한 처리하시겠습니까?
            <br />
            처리 후 사용자는 즉시 서비스 이용이 제한되며 되돌릴 수 없습니다.
          </>
        ) : undefined}
        confirmLabel="이용 제한"
        confirmVariant="destructive"
        isConfirming={!!banTargetUser && actionLoadingId === banTargetUser.id}
        onCancel={() => {
          if (!(banTargetUser && actionLoadingId === banTargetUser.id)) {
            setBanTargetUser(null)
          }
        }}
        onConfirm={() => void handleConfirmBanUser()}
      />
    </div>
  )
}
