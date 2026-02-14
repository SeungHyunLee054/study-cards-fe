import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Heart } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { BookmarkButton } from '@/components/BookmarkButton'
import { CategoryFilterSection } from '@/components/CategoryFilterSection'
import { Pagination } from '@/components/Pagination'
import { InlineError } from '@/components/InlineError'
import { fetchBookmarks } from '@/api/bookmarks'
import { useCategoryFilter } from '@/hooks/useCategoryFilter'
import { useCategories } from '@/hooks/useCategories'
import type { BookmarkResponse } from '@/types/bookmark'
import type { PageResponse } from '@/types/card'

export function BookmarksPage() {
  const [bookmarksPage, setBookmarksPage] = useState<PageResponse<BookmarkResponse> | null>(null)
  const { categories, isLoading: isCategoriesLoading } = useCategories()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedCategory, setSelectedCategory, categoryCode } = useCategoryFilter()
  const [page, setPage] = useState(0)
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set())

  const loadBookmarks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      setRemovedIds(new Set())
      const data = await fetchBookmarks({
        category: categoryCode,
        page,
        size: 20,
      })
      setBookmarksPage(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '북마크를 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [categoryCode, page])

  useEffect(() => {
    loadBookmarks()
  }, [loadBookmarks])

  function handleCategoryChange(code: string) {
    setSelectedCategory(code)
    setPage(0)
  }

  function handleBookmarkRemoved(bookmarkId: number) {
    setRemovedIds((prev) => new Set(prev).add(bookmarkId))
  }

  const bookmarks = bookmarksPage?.content.filter((b) => !removedIds.has(b.bookmarkId)) ?? []
  const totalPages = bookmarksPage?.totalPages ?? 0

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader
        variant="brand-back"
        backTo="/mypage"
        backLabel="마이페이지"
        hideBackLabelOnMobile
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">북마크</h1>
          <p className="mt-1 text-sm md:text-base text-gray-600">저장한 카드를 모아보세요</p>
        </div>

        {/* Error */}
        {error && (
          <InlineError
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Category Filter */}
        <CategoryFilterSection
          className="mb-6"
          categories={categories}
          isLoading={isCategoriesLoading}
          selectedCategory={selectedCategory}
          onChange={handleCategoryChange}
          loadingText="로딩 중..."
        />

        {/* Bookmarks List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">북마크한 카드가 없습니다</h3>
            <p className="text-sm text-gray-600 mb-4">
              학습 중 마음에 드는 카드를 북마크해보세요
            </p>
            <Button variant="outline" asChild>
              <Link to="/study">학습하러 가기</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.bookmarkId}
                className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">
                        {bookmark.category.name}
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-500">
                        {bookmark.cardType === 'PUBLIC' ? '공용' : '내 카드'}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="font-medium text-gray-900 text-sm md:text-base">{bookmark.question}</p>
                      {bookmark.questionSub && (
                        <p className="text-xs md:text-sm text-gray-500 mt-1">{bookmark.questionSub}</p>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{bookmark.answer}</p>
                      {bookmark.answerSub && (
                        <p className="text-xs text-gray-500 mt-1">{bookmark.answerSub}</p>
                      )}
                    </div>
                  </div>
                  <BookmarkButton
                    key={bookmark.bookmarkId}
                    cardId={bookmark.cardId}
                    cardType={bookmark.cardType}
                    initialBookmarked={true}
                    size="sm"
                    onToggled={() => handleBookmarkRemoved(bookmark.bookmarkId)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />

        {/* Count */}
        {!isLoading && bookmarks.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            총 {bookmarksPage?.totalElements ?? 0}개의 북마크
          </div>
        )}
      </main>
    </div>
  )
}
