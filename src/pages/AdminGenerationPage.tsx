import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  BookOpen,
  Loader2,
  Filter,
  Shield,
  BarChart3,
  List,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GenerationStats } from '@/components/GenerationStats'
import { GeneratedCardItem } from '@/components/GeneratedCardItem'
import { GenerationForm } from '@/components/GenerationForm'
import {
  generateCards,
  fetchGenerationStats,
  approveGeneratedCard,
  rejectGeneratedCard,
  batchApproveCards,
  migrateApprovedCards,
} from '@/api/generation'
import { fetchCategories } from '@/api/categories'
import { useInfiniteGeneratedCards } from '@/hooks/useInfiniteGeneratedCards'
import type { CategoryResponse } from '@/types/category'
import type {
  GenerationStatsResponse,
  GeneratedCardStatus,
  GenerationRequest,
} from '@/types/generation'

type Tab = 'stats' | 'cards' | 'generate'

const STATUS_OPTIONS: { value: GeneratedCardStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '대기중' },
  { value: 'APPROVED', label: '승인됨' },
  { value: 'REJECTED', label: '거부됨' },
  { value: 'MIGRATED', label: '마이그레이션' },
]

export function AdminGenerationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('stats')

  // 공통 상태
  const [categories, setCategories] = useState<CategoryResponse[]>([])

  // 통계 상태
  const [stats, setStats] = useState<GenerationStatsResponse | null>(null)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  // 카드 목록 필터
  const [statusFilter, setStatusFilter] = useState<GeneratedCardStatus | 'ALL'>('ALL')
  const [modelFilter, setModelFilter] = useState<string>('')

  // 카드 목록 훅
  const {
    cards,
    isLoading: isCardsLoading,
    isLoadingMore,
    error: cardsError,
    hasMore,
    totalElements,
    refresh: refreshCards,
    observerRef,
  } = useInfiniteGeneratedCards({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    model: modelFilter || undefined,
  })

  // 선택된 카드
  const [selectedCardIds, setSelectedCardIds] = useState<Set<number>>(new Set())

  // 액션 상태
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [isBatchApproving, setIsBatchApproving] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // 생성 폼 상태
  const [isGenerateFormOpen, setIsGenerateFormOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // 카테고리 로드
  useEffect(() => {
    loadCategories()
  }, [])

  // 통계 로드
  useEffect(() => {
    if (activeTab === 'stats') {
      loadStats()
    }
  }, [activeTab])

  async function loadCategories() {
    try {
      const data = await fetchCategories()
      setCategories(data)
    } catch {
      // 카테고리 로드 실패 시 무시
    }
  }

  async function loadStats() {
    try {
      setIsStatsLoading(true)
      setStatsError(null)
      const data = await fetchGenerationStats()
      setStats(data)
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : '통계를 불러오는데 실패했습니다')
    } finally {
      setIsStatsLoading(false)
    }
  }

  // 카드 선택 핸들러
  function handleSelectCard(id: number, selected: boolean) {
    setSelectedCardIds((prev) => {
      const next = new Set(prev)
      if (selected) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  // 전체 선택
  function handleSelectAll() {
    const pendingCards = cards.filter((c) => c.status === 'PENDING')
    if (selectedCardIds.size === pendingCards.length) {
      setSelectedCardIds(new Set())
    } else {
      setSelectedCardIds(new Set(pendingCards.map((c) => c.id)))
    }
  }

  // 개별 승인
  async function handleApprove(id: number) {
    try {
      setActionLoadingId(id)
      setActionType('approve')
      setActionError(null)
      await approveGeneratedCard(id)
      await refreshCards()
      if (activeTab === 'stats') {
        await loadStats()
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '승인에 실패했습니다')
    } finally {
      setActionLoadingId(null)
      setActionType(null)
    }
  }

  // 개별 거부
  async function handleReject(id: number) {
    try {
      setActionLoadingId(id)
      setActionType('reject')
      setActionError(null)
      await rejectGeneratedCard(id)
      await refreshCards()
      if (activeTab === 'stats') {
        await loadStats()
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '거부에 실패했습니다')
    } finally {
      setActionLoadingId(null)
      setActionType(null)
    }
  }

  // 일괄 승인
  async function handleBatchApprove() {
    if (selectedCardIds.size === 0) return

    try {
      setIsBatchApproving(true)
      setActionError(null)
      await batchApproveCards({ ids: Array.from(selectedCardIds) })
      setSelectedCardIds(new Set())
      setSuccessMessage(`${selectedCardIds.size}개의 문제가 승인되었습니다`)
      await refreshCards()
      if (activeTab === 'stats') {
        await loadStats()
      }
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '일괄 승인에 실패했습니다')
    } finally {
      setIsBatchApproving(false)
    }
  }

  // 마이그레이션
  async function handleMigrate() {
    try {
      setIsMigrating(true)
      setActionError(null)
      const result = await migrateApprovedCards()
      setSuccessMessage(result.message || `${result.migratedCount}개의 카드가 마이그레이션되었습니다`)
      await refreshCards()
      await loadStats()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '마이그레이션에 실패했습니다')
    } finally {
      setIsMigrating(false)
    }
  }

  // AI 문제 생성
  async function handleGenerate(data: GenerationRequest) {
    try {
      setIsGenerating(true)
      setActionError(null)
      const result = await generateCards(data)
      setIsGenerateFormOpen(false)
      setSuccessMessage(`${result.totalGenerated}개의 문제가 생성되었습니다`)
      await refreshCards()
      await loadStats()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '문제 생성에 실패했습니다')
    } finally {
      setIsGenerating(false)
    }
  }

  // 모델 목록 추출 (중복 제거)
  const availableModels = [...new Set(cards.map((c) => c.model))].filter(Boolean)

  const pendingCardsCount = cards.filter((c) => c.status === 'PENDING').length

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Study Cards</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
              <Shield className="h-4 w-4" />
              관리자
            </span>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/cards">카드 관리</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/mypage">마이페이지</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">AI 문제 생성</h1>
          </div>
          <p className="mt-1 text-gray-600">AI로 학습 문제를 생성하고 관리합니다</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'stats'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="inline-block h-4 w-4 mr-2" />
            통계
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'cards'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="inline-block h-4 w-4 mr-2" />
            생성된 문제
          </button>
          <button
            onClick={() => {
              setActiveTab('generate')
              setIsGenerateFormOpen(true)
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'generate'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles className="inline-block h-4 w-4 mr-2" />
            문제 생성
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {successMessage}
          </div>
        )}
        {actionError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {actionError}
            <button onClick={() => setActionError(null)} className="ml-2 text-red-900 hover:underline">
              닫기
            </button>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <GenerationStats stats={stats} isLoading={isStatsLoading} error={statsError} />
        )}

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <>
            {/* Cards Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">생성된 문제 목록</h2>
                <p className="text-sm text-gray-500">
                  {cards.length} / {totalElements}개
                </p>
              </div>
              <div className="flex gap-2">
                {selectedCardIds.size > 0 && (
                  <Button onClick={handleBatchApprove} disabled={isBatchApproving}>
                    {isBatchApproving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {selectedCardIds.size}개 일괄 승인
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleMigrate}
                  disabled={isMigrating}
                >
                  {isMigrating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  마이그레이션
                </Button>
                <Button onClick={() => setIsGenerateFormOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  새 문제 생성
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-gray-500" />
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value)
                        setSelectedCardIds(new Set())
                      }}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        statusFilter === option.value
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {availableModels.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">모델:</span>
                  <select
                    value={modelFilter}
                    onChange={(e) => {
                      setModelFilter(e.target.value)
                      setSelectedCardIds(new Set())
                    }}
                    className="h-8 px-2 text-sm rounded-md border border-gray-200 bg-white"
                  >
                    <option value="">전체</option>
                    {availableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {pendingCardsCount > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary hover:underline"
                >
                  {selectedCardIds.size === pendingCardsCount ? '전체 해제' : '전체 선택'}
                </button>
              )}
            </div>

            {/* Cards List */}
            {isCardsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : cardsError ? (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                {cardsError}
              </div>
            ) : cards.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">생성된 문제가 없습니다</h3>
                <p className="text-gray-600 mb-4">AI를 사용하여 새로운 학습 문제를 생성해보세요!</p>
                <Button onClick={() => setIsGenerateFormOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  문제 생성하기
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {cards.map((card) => (
                  <GeneratedCardItem
                    key={card.id}
                    card={card}
                    isSelected={selectedCardIds.has(card.id)}
                    onSelect={handleSelectCard}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isApproving={actionLoadingId === card.id && actionType === 'approve'}
                    isRejecting={actionLoadingId === card.id && actionType === 'reject'}
                  />
                ))}

                {/* 무한 스크롤 트리거 */}
                {hasMore && (
                  <div ref={observerRef} className="flex justify-center py-4">
                    {isLoadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && !isGenerateFormOpen && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">AI 문제 생성</h3>
            <p className="text-gray-600 mb-4">
              AI를 활용하여 학습 문제를 자동으로 생성합니다
            </p>
            <Button onClick={() => setIsGenerateFormOpen(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              문제 생성 시작
            </Button>
          </div>
        )}
      </main>

      {/* Generation Form Modal */}
      <GenerationForm
        isOpen={isGenerateFormOpen}
        onClose={() => {
          setIsGenerateFormOpen(false)
          if (activeTab === 'generate') {
            setActiveTab('cards')
          }
        }}
        onSubmit={handleGenerate}
        categories={categories}
        isLoading={isGenerating}
      />
    </div>
  )
}
