import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Loader2, Sparkles, BookOpen } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { CardForm } from '@/components/CardForm'
import { InlineError } from '@/components/InlineError'
import { CategoryFilterSection } from '@/components/CategoryFilterSection'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { getUserCards, createUserCard, updateUserCard, deleteUserCard } from '@/api/cards'
import { useCategoryFilter } from '@/hooks/useCategoryFilter'
import { useCategories } from '@/hooks/useCategories'
import { DASHBOARD_PATH } from '@/constants/routes'
import type { UserCardResponse, UserCardCreateRequest } from '@/types/card'

export function MyCardsPage() {
  const [cards, setCards] = useState<UserCardResponse[]>([])
  const { categories, isLoading: isCategoriesLoading } = useCategories()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedCategory, setSelectedCategory, categoryCode } = useCategoryFilter()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<UserCardResponse | null>(null)
  const [deleteTargetCard, setDeleteTargetCard] = useState<UserCardResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 카드 목록 로드
  const loadCards = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getUserCards(categoryCode)
      setCards(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '카드를 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [categoryCode])

  useEffect(() => {
    loadCards()
  }, [loadCards])

  async function handleCreateCard(data: UserCardCreateRequest) {
    try {
      setIsSubmitting(true)
      await createUserCard(data)
      setIsFormOpen(false)
      await loadCards()
    } catch (err) {
      setError(err instanceof Error ? err.message : '카드 생성에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateCard(data: UserCardCreateRequest) {
    if (!editingCard) return

    try {
      setIsSubmitting(true)
      await updateUserCard(editingCard.id, data)
      setEditingCard(null)
      await loadCards()
    } catch (err) {
      setError(err instanceof Error ? err.message : '카드 수정에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteCard(id: number) {
    try {
      setIsSubmitting(true)
      await deleteUserCard(id)
      setDeleteTargetCard(null)
      await loadCards()
    } catch (err) {
      setError(err instanceof Error ? err.message : '카드 삭제에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  function openEditForm(card: UserCardResponse) {
    setEditingCard(card)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingCard(null)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader variant="brand-back" backTo={DASHBOARD_PATH} backLabel="대시보드" />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">내 카드</h1>
            <p className="mt-1 text-gray-600">나만의 학습 카드를 관리하세요</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" asChild>
              <Link to="/ai-generate">
                <Sparkles className="h-4 w-4 mr-2" />
                AI 생성
              </Link>
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              새 카드
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <InlineError message={error} onClose={() => setError(null)} className="mb-6 text-base" />
        )}

        {/* Filter */}
        <CategoryFilterSection
          className="mb-6"
          categories={categories}
          isLoading={isCategoriesLoading}
          selectedCategory={selectedCategory}
          onChange={setSelectedCategory}
          loadingText="로딩 중..."
          buttonBaseClassName="px-4 py-2.5 text-sm rounded-lg transition-colors min-h-[44px]"
        />

        {/* Cards List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-gray-400 mb-4">
              <BookOpen className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">카드가 없습니다</h3>
            <p className="text-gray-600 mb-4">
              {selectedCategory === 'ALL'
                ? '첫 번째 학습 카드를 만들어보세요!'
                : `해당 카테고리에 카드가 없습니다`}
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              카드 만들기
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">
                        {card.category.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        EF: {card.efFactor.toFixed(2)}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="font-medium text-gray-900">{card.question}</p>
                      {card.questionSub && (
                        <p className="text-sm text-gray-500 mt-1">{card.questionSub}</p>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{card.answer}</p>
                      {card.answerSub && (
                        <p className="text-sm text-gray-500 mt-1">{card.answerSub}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditForm(card)}
                      className="min-h-[44px] min-w-[44px]"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTargetCard(card)}
                      className="min-h-[44px] min-w-[44px]"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Card count */}
        {!isLoading && cards.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            총 {cards.length}개의 카드
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={!!deleteTargetCard}
        title="카드 삭제"
        description={deleteTargetCard ? (
          <>
            이 카드를 삭제하시겠습니까?
            <br />
            삭제된 카드는 복구할 수 없습니다.
          </>
        ) : undefined}
        confirmLabel="삭제"
        confirmVariant="destructive"
        isConfirming={isSubmitting}
        onCancel={() => {
          if (!isSubmitting) {
            setDeleteTargetCard(null)
          }
        }}
        onConfirm={() => {
          if (deleteTargetCard) {
            void handleDeleteCard(deleteTargetCard.id)
          }
        }}
      />

      {/* Create Form Modal */}
      <CardForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleCreateCard}
        categories={categories}
        isLoading={isSubmitting}
      />

      {/* Edit Form Modal */}
      <CardForm
        isOpen={!!editingCard}
        onClose={closeForm}
        onSubmit={handleUpdateCard}
        initialData={editingCard}
        categories={categories}
        isLoading={isSubmitting}
      />
    </div>
  )
}
