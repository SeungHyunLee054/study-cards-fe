import { useState, useEffect, useMemo } from 'react'
import { X, Loader2, Sparkles, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchAdminCards } from '@/api/admin'
import type { AdminCardResponse } from '@/types/admin'
import type { CategoryResponse } from '@/types/category'
import type { GenerationRequest } from '@/types/generation'
import { flattenLeafCategoriesForSelect } from '@/lib/categoryHierarchy'
import { useDebounce } from '@/hooks/useDebounce'
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants'

interface GenerationFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: GenerationRequest) => Promise<void>
  categories: CategoryResponse[]
  isLoading?: boolean
}

type SourceMode = 'random' | 'manual'

const MAX_SOURCE_CARDS = 20
const SOURCE_CARD_PAGE_SIZE = 100

export function GenerationForm({
  isOpen,
  onClose,
  onSubmit,
  categories,
  isLoading,
}: GenerationFormProps) {
  const [categoryCode, setCategoryCode] = useState('')
  const [count, setCount] = useState(5)
  const [sourceMode, setSourceMode] = useState<SourceMode>('random')
  const [sourceKeyword, setSourceKeyword] = useState('')
  const debouncedSourceKeyword = useDebounce(sourceKeyword, SEARCH_DEBOUNCE_MS)
  const [sourceCards, setSourceCards] = useState<AdminCardResponse[]>([])
  const [selectedSourceCardIds, setSelectedSourceCardIds] = useState<number[]>([])
  const [isSourceCardsLoading, setIsSourceCardsLoading] = useState(false)
  const [sourceCardsError, setSourceCardsError] = useState<string | null>(null)
  const [sourceCardsRefreshToken, setSourceCardsRefreshToken] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const categoryOptions = useMemo(() => flattenLeafCategoriesForSelect(categories), [categories])

  // 폼 초기화
  useEffect(() => {
    if (isOpen) {
      setCategoryCode(categoryOptions[0]?.code || '')
      setCount(5)
      setSourceMode('random')
      setSourceKeyword('')
      setSourceCards([])
      setSelectedSourceCardIds([])
      setSourceCardsError(null)
      setSourceCardsRefreshToken(0)
      setErrors({})
    }
  }, [isOpen, categoryOptions])

  useEffect(() => {
    if (!isOpen || sourceMode !== 'manual') return
    if (!categoryCode) {
      setSourceCards([])
      setSourceCardsError(null)
      return
    }

    let isCancelled = false

    async function loadSourceCards() {
      try {
        setIsSourceCardsLoading(true)
        setSourceCardsError(null)
        const response = await fetchAdminCards(
          categoryCode,
          { page: 0, size: SOURCE_CARD_PAGE_SIZE },
          debouncedSourceKeyword.trim() || undefined
        )
        if (isCancelled) return
        setSourceCards(response.content)
      } catch (err) {
        if (isCancelled) return
        setSourceCardsError(err instanceof Error ? err.message : '원본 카드 목록을 불러오는데 실패했습니다')
      } finally {
        if (!isCancelled) {
          setIsSourceCardsLoading(false)
        }
      }
    }

    void loadSourceCards()

    return () => {
      isCancelled = true
    }
  }, [isOpen, sourceMode, categoryCode, debouncedSourceKeyword, sourceCardsRefreshToken])

  function handleSourceCardToggle(cardId: number, checked: boolean) {
    setSelectedSourceCardIds((prev) => {
      if (checked) {
        if (prev.includes(cardId) || prev.length >= MAX_SOURCE_CARDS) return prev
        return [...prev, cardId]
      }
      return prev.filter((id) => id !== cardId)
    })
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!categoryCode) {
      newErrors.categoryCode = '카테고리를 선택해주세요'
    }

    if (sourceMode === 'manual') {
      if (selectedSourceCardIds.length === 0) {
        newErrors.sourceCardIds = '원본 카드를 1개 이상 선택해주세요'
      } else if (selectedSourceCardIds.length > MAX_SOURCE_CARDS) {
        newErrors.sourceCardIds = `원본 카드는 최대 ${MAX_SOURCE_CARDS}개까지 선택 가능합니다`
      }
    } else if (count < 1 || count > MAX_SOURCE_CARDS) {
      newErrors.count = `생성 개수는 1-${MAX_SOURCE_CARDS} 사이여야 합니다`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    const isManualMode = sourceMode === 'manual'
    const data: GenerationRequest = {
      categoryCode,
      count: isManualMode ? selectedSourceCardIds.length : count,
      ...(isManualMode ? { sourceCardIds: selectedSourceCardIds } : {}),
    }

    await onSubmit(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">AI 문제 생성</h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 카테고리 선택 */}
          <div>
            <Label htmlFor="categoryCode">카테고리 *</Label>
            <select
              id="categoryCode"
              value={categoryCode}
              onChange={(e) => {
                setCategoryCode(e.target.value)
                setSelectedSourceCardIds([])
              }}
              className="mt-1 w-full h-11 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            >
              <option value="">카테고리 선택</option>
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.code}>
                  {option.pathLabel} ({option.code})
                </option>
              ))}
            </select>
            {errors.categoryCode && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryCode}</p>
            )}
          </div>

          {/* 생성 방식 */}
          <div>
            <Label>원본 카드 선택 방식 *</Label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSourceMode('random')
                  setSelectedSourceCardIds([])
                  setErrors((prev) => {
                    const next = { ...prev }
                    delete next.sourceCardIds
                    return next
                  })
                }}
                className={`h-11 px-3 rounded-md border text-sm transition-colors ${
                  sourceMode === 'random'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                disabled={isLoading}
              >
                랜덤 선택
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('manual')}
                className={`h-11 px-3 rounded-md border text-sm transition-colors ${
                  sourceMode === 'manual'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                disabled={isLoading}
              >
                수동 선택
              </button>
            </div>
          </div>

          {/* 랜덤 생성 개수 */}
          {sourceMode === 'random' ? (
            <div>
              <Label htmlFor="count">생성 개수 (1-20) *</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={MAX_SOURCE_CARDS}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="mt-1"
                disabled={isLoading}
              />
              {errors.count && <p className="mt-1 text-sm text-red-600">{errors.count}</p>}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">원본 카드 선택 (최대 20개)</Label>
                <span className="text-xs text-gray-500">
                  선택됨: {selectedSourceCardIds.length}/{MAX_SOURCE_CARDS}
                </span>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={sourceKeyword}
                  onChange={(e) => setSourceKeyword(e.target.value)}
                  placeholder="원본 카드 키워드 검색"
                  className="pl-9 h-10"
                  disabled={isLoading}
                />
              </div>

              <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 divide-y">
                {isSourceCardsLoading ? (
                  <div className="flex items-center justify-center gap-2 p-6 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    원본 카드 로딩 중...
                  </div>
                ) : sourceCardsError ? (
                  <div className="p-4 space-y-2">
                    <p className="text-sm text-red-600">{sourceCardsError}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setSourceCardsRefreshToken((prev) => prev + 1)}
                    >
                      다시 시도
                    </Button>
                  </div>
                ) : sourceCards.length === 0 ? (
                  <div className="p-6 text-sm text-gray-500 text-center">
                    선택 가능한 원본 카드가 없습니다.
                  </div>
                ) : (
                  sourceCards.map((card) => {
                    const isChecked = selectedSourceCardIds.includes(card.id)
                    const isDisabled = !isChecked && selectedSourceCardIds.length >= MAX_SOURCE_CARDS

                    return (
                      <label
                        key={card.id}
                        className={`flex items-start gap-3 p-3 ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={isChecked}
                          onChange={(e) => handleSourceCardToggle(card.id, e.target.checked)}
                          disabled={isLoading || isDisabled}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{card.question}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{card.answer}</p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            #{card.id} · {card.category.name}
                          </p>
                        </div>
                      </label>
                    )
                  })
                )}
              </div>

              {errors.sourceCardIds && (
                <p className="text-sm text-red-600">{errors.sourceCardIds}</p>
              )}
              <p className="text-xs text-gray-500">
                수동 선택 모드에서는 선택한 카드 수만큼 문제를 생성합니다.
              </p>
            </div>
          )}

          {/* 안내 문구 */}
          <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            AI가 선택한 카테고리에 맞는 학습 문제를 생성합니다. 생성된 문제는 검토 후 승인해야 실제
            학습 카드로 사용할 수 있습니다.
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  문제 생성
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
