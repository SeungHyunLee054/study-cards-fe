import { useState, useEffect, useCallback } from 'react'
import { Loader2, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { Input } from '@/components/ui/input'
import { BookmarkButton } from '@/components/BookmarkButton'
import { CategoryFilterChips } from '@/components/CategoryFilterChips'
import { Pagination } from '@/components/Pagination'
import { InlineError } from '@/components/InlineError'
import { searchCards } from '@/api/search'
import { fetchCategories } from '@/api/categories'
import { useDebounce } from '@/hooks/useDebounce'
import { useCategoryFilter } from '@/hooks/useCategoryFilter'
import { useAuth } from '@/contexts/useAuth'
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants'
import type { CardResponse, PageResponse } from '@/types/card'
import type { CategoryResponse } from '@/types/category'

export function SearchPage() {
  const { isLoggedIn } = useAuth()
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, SEARCH_DEBOUNCE_MS)
  const [resultsPage, setResultsPage] = useState<PageResponse<CardResponse> | null>(null)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { selectedCategory, setSelectedCategory, categoryCode } = useCategoryFilter()
  const [page, setPage] = useState(0)
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setIsCategoriesLoading(false))
  }, [])

  const doSearch = useCallback(async () => {
    if (!debouncedKeyword.trim()) {
      setResultsPage(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await searchCards({
        keyword: debouncedKeyword.trim(),
        category: categoryCode,
        page,
        size: 20,
      })
      setResultsPage(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [debouncedKeyword, categoryCode, page])

  useEffect(() => {
    doSearch()
  }, [doSearch])

  function handleCategoryChange(code: string) {
    setSelectedCategory(code)
    setPage(0)
  }

  const results = resultsPage?.content ?? []
  const totalPages = resultsPage?.totalPages ?? 0
  const hasSearched = debouncedKeyword.trim().length > 0
  const selectedCategoryLabel = selectedCategory === 'ALL'
    ? '전체'
    : (categories.find((category) => category.code === selectedCategory)?.name ?? selectedCategory)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader
        variant="brand-back"
        backTo={isLoggedIn ? '/mypage' : '/'}
        backLabel="돌아가기"
        hideBackLabelOnMobile
        sticky
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">카드 검색</h1>
          <p className="mt-1 text-sm md:text-base text-gray-600">키워드로 학습 카드를 찾아보세요</p>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="검색어를 입력하세요"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(0)
            }}
            className="pl-10 h-12 text-base"
            autoFocus
          />
        </div>

        {/* Category Filter */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white">
          <button
            type="button"
            onClick={() => setIsCategoryFilterOpen((prev) => !prev)}
            className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-gray-50 rounded-xl"
          >
            <span className="inline-flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4 text-gray-500" />
              카테고리 필터
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-gray-700">
              <span className="max-w-[160px] truncate">{selectedCategoryLabel}</span>
              {isCategoryFilterOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </span>
          </button>

          {isCategoryFilterOpen && (
            <div className="border-t border-gray-100 px-4 py-3">
              {isCategoriesLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  로딩 중...
                </div>
              ) : (
                <CategoryFilterChips
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onChange={handleCategoryChange}
                  buttonBaseClassName="px-3 py-2 text-sm rounded-md transition-colors min-h-[38px]"
                />
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <InlineError
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !hasSearched ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 text-sm md:text-base">검색어를 입력하여 카드를 찾아보세요</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-sm text-gray-600">
              다른 키워드로 검색해보세요
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              총 <span className="font-medium text-foreground">{resultsPage?.totalElements}</span>개의 결과
            </p>

            <div className="grid gap-4">
              {results.map((card) => (
                <div
                  key={`${card.cardType}-${card.id}`}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">
                          {card.category.name}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-500">
                          {card.cardType === 'PUBLIC' ? '공용' : '내 카드'}
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="font-medium text-gray-900 text-sm md:text-base">{card.question}</p>
                        {card.questionSub && (
                          <p className="text-xs md:text-sm text-gray-500 mt-1">{card.questionSub}</p>
                        )}
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{card.answer}</p>
                        {card.answerSub && (
                          <p className="text-xs text-gray-500 mt-1">{card.answerSub}</p>
                        )}
                      </div>
                    </div>
                    {isLoggedIn && (
                      <BookmarkButton
                        cardId={card.id}
                        cardType={card.cardType}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </main>
    </div>
  )
}
