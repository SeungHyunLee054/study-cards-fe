import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  History,
  X,
  RotateCcw,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/AppHeader'
import { AppFooter } from '@/components/AppFooter'
import { getSessions, getSessionStats } from '@/api/sessions'
import { fetchCard } from '@/api/cards'
import { DASHBOARD_PATH } from '@/constants/routes'
import type { PageResponse, CardResponse } from '@/types/card'
import type { SessionResponse, SessionStatsResponse, StudyRecordResponse } from '@/types/session'

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '-'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}초`
  return `${mins}분 ${secs}초`
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

// 카드 상세 보기 모달
interface CardDetailModalProps {
  card: CardResponse | null
  isLoading: boolean
  onClose: () => void
}

function CardDetailModal({ card, isLoading, onClose }: CardDetailModalProps) {
  if (!card && !isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      {/* 모달 콘텐츠 */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">카드 상세</h3>
          <button
            onClick={onClose}
            className="p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : card ? (
          <div className="p-6 space-y-6">
            {/* 질문 */}
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">질문</div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{card.question}</p>
                {card.questionSub && (
                  <p className="text-gray-600 text-sm mt-2 whitespace-pre-wrap">{card.questionSub}</p>
                )}
              </div>
            </div>
            {/* 정답 */}
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">정답</div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-gray-900 whitespace-pre-wrap">{card.answer}</p>
                {card.answerSub && (
                  <p className="text-gray-600 text-sm mt-2 whitespace-pre-wrap">{card.answerSub}</p>
                )}
              </div>
            </div>
            {/* 카테고리 */}
            {card.category && (
              <div className="text-sm text-gray-500">
                카테고리: <span className="text-gray-700">{card.category.name}</span>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

interface SessionCardProps {
  session: SessionResponse
  onReviewSession: (cardIds: number[]) => void
}

function SessionCard({ session, onReviewSession }: SessionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [stats, setStats] = useState<SessionStatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardResponse | null>(null)
  const [isCardLoading, setIsCardLoading] = useState(false)

  async function handleToggle() {
    if (!isExpanded && !stats) {
      setIsLoading(true)
      try {
        const data = await getSessionStats(session.id)
        setStats(data)
      } catch {
        // 통계 로드 실패 시 무시
      } finally {
        setIsLoading(false)
      }
    }
    setIsExpanded(!isExpanded)
  }

  async function handleCardClick(cardId: number) {
    setIsCardLoading(true)
    try {
      const card = await fetchCard(cardId)
      setSelectedCard(card)
    } catch {
      // 카드 로드 실패 시 무시
    } finally {
      setIsCardLoading(false)
    }
  }

  function handleReviewSession() {
    if (stats?.records) {
      const cardIds = stats.records.map((r) => r.cardId)
      onReviewSession(cardIds)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Session Summary */}
      <button
        onClick={handleToggle}
        className="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">{formatDateTime(session.startedAt)}</div>
            <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(session.durationSeconds)}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {session.totalCards}개 카드
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 self-end sm:self-auto">
          <div className="text-right">
            <div className="text-lg font-semibold text-primary">
              {formatPercent(session.accuracyRate)}
            </div>
            <div className="text-sm text-gray-500">
              {session.correctCount}/{session.totalCards} 정답
            </div>
          </div>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Session Details */}
      {isExpanded && stats && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">학습 기록</h4>
              {stats.records.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReviewSession}
                  className="flex items-center gap-2 min-h-[44px]"
                >
                  <RotateCcw className="h-4 w-4" />
                  다시 학습하기
                </Button>
              )}
            </div>
            {stats.records.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">기록이 없습니다</p>
            ) : (
              <div className="space-y-2">
                {stats.records.map((record: StudyRecordResponse) => (
                  <button
                    key={record.id}
                    onClick={() => handleCardClick(record.cardId)}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {record.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-gray-900 truncate">{record.question}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-sm text-gray-400">{formatTime(record.studiedAt)}</span>
                      <Eye className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 카드 상세 모달 */}
      {(selectedCard || isCardLoading) && (
        <CardDetailModal
          card={selectedCard}
          isLoading={isCardLoading}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  )
}

export function SessionHistoryPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<SessionResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data: PageResponse<SessionResponse> = await getSessions({ page, size: 10 })
      setSessions(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch {
      setError('세션 기록을 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  function handleReviewSession(cardIds: number[]) {
    // cardIds를 sessionStorage에 저장하고 학습 페이지로 이동
    sessionStorage.setItem('reviewCardIds', JSON.stringify(cardIds))
    navigate('/study?mode=session-review')
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader
        variant="back-title"
        container="max-w-4xl"
        backTo={DASHBOARD_PATH}
        backLabel="뒤로가기"
        title="학습 기록"
        titleClassName="text-xl font-semibold"
      />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* Sessions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-gray-400 mb-4">
              <History className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">학습 기록이 없습니다</h3>
            <p className="text-gray-600 mb-4">학습을 시작하면 기록이 여기에 표시됩니다</p>
            <Button asChild>
              <Link to="/study">학습 시작하기</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onReviewSession={handleReviewSession}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && sessions.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              총 {totalElements}개의 세션
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="min-h-[44px]"
              >
                이전
              </Button>
              <span className="text-sm text-gray-600 px-3">
                {page + 1} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="min-h-[44px]"
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </main>

      <AppFooter container="max-w-4xl" />
    </div>
  )
}
