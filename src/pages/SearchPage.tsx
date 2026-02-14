import { useState, useEffect, useCallback } from 'react'
import { Loader2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookmarkButton } from '@/components/BookmarkButton'
import { searchCards } from '@/api/search'
import { fetchCategories } from '@/api/categories'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/contexts/AuthContext'
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
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [page, setPage] = useState(0)

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
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        page,
        size: 20,
      })
      setResultsPage(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [debouncedKeyword, selectedCategory, page])

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
        <div className="mb-6 flex items-center gap-3">
          <Filter className="h-4 w-4 text-gray-500 shrink-0" />
          {isCategoriesLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              로딩 중...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('ALL')}
                className={`px-3 md:px-4 py-2 text-sm rounded-lg transition-colors min-h-[44px] ${
                  selectedCategory === 'ALL'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.code)}
                  className={`px-3 md:px-4 py-2 text-sm rounded-lg transition-colors min-h-[44px] ${
                    selectedCategory === cat.code
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-900 hover:underline">닫기</button>
          </div>
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
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="min-h-[44px]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`px-3 py-2 rounded-lg text-sm min-h-[44px] min-w-[44px] transition-colors ${
                      page === i
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                )).slice(
                  Math.max(0, page - 2),
                  Math.min(totalPages, page + 3)
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="min-h-[44px]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
