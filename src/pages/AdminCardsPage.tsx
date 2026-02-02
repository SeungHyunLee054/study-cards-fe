import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, BookOpen, Loader2, Filter, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminCardForm } from '@/components/AdminCardForm'
import {
  fetchAdminCards,
  createAdminCard,
  updateAdminCard,
  deleteAdminCard,
} from '@/api/admin'
import type { Category } from '@/types/card'
import type { AdminCardResponse, AdminCardCreateRequest } from '@/types/admin'

const CATEGORIES: (Category | 'ALL')[] = ['ALL', 'CS', 'ENGLISH', 'SQL', 'JAPANESE']

export function AdminCardsPage() {
  const [cards, setCards] = useState<AdminCardResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<AdminCardResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  useEffect(() => {
    loadCards()
  }, [selectedCategory])

  async function loadCards() {
    try {
      setIsLoading(true)
      setError(null)
      const category = selectedCategory === 'ALL' ? undefined : selectedCategory
      const data = await fetchAdminCards(category)
      setCards(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '카드를 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateCard(data: AdminCardCreateRequest) {
    try {
      setIsSubmitting(true)
      await createAdminCard(data)
      setIsFormOpen(false)
      await loadCards()
    } catch (err) {
      setError(err instanceof Error ? err.message : '카드 생성에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateCard(data: AdminCardCreateRequest) {
    if (!editingCard) return

    try {
      setIsSubmitting(true)
      await updateAdminCard(editingCard.id, data)
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
      await deleteAdminCard(id)
      setDeleteConfirmId(null)
      await loadCards()
    } catch (err) {
      setError(err instanceof Error ? err.message : '카드 삭제에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  function openEditForm(card: AdminCardResponse) {
    setEditingCard(card)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingCard(null)
  }

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
              <Link to="/mypage">마이페이지</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">카드 관리</h1>
            <p className="mt-1 text-gray-600">시스템의 모든 학습 카드를 관리합니다</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            새 카드
          </Button>
        </div>

        {/* Error Message */}
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

        {/* Filter */}
        <div className="mb-6 flex items-center gap-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat === 'ALL' ? '전체' : cat}
              </button>
            ))}
          </div>
        </div>

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
                : `${selectedCategory} 카테고리에 카드가 없습니다`}
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
                        {card.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        EF: {card.efFactor.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400">
                        ID: #{card.id}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="font-medium text-gray-900">{card.questionEn}</p>
                      {card.questionKo && (
                        <p className="text-sm text-gray-500 mt-1">{card.questionKo}</p>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{card.answerEn}</p>
                      {card.answerKo && (
                        <p className="text-sm text-gray-500 mt-1">{card.answerKo}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditForm(card)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {deleteConfirmId === card.id ? (
                      <div className="flex gap-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCard(card.id)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            '삭제'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirmId(null)}
                          disabled={isSubmitting}
                        >
                          취소
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(card.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
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

      {/* Create Form Modal */}
      <AdminCardForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleCreateCard}
        isLoading={isSubmitting}
      />

      {/* Edit Form Modal */}
      <AdminCardForm
        isOpen={!!editingCard}
        onClose={closeForm}
        onSubmit={handleUpdateCard}
        initialData={editingCard}
        isLoading={isSubmitting}
      />
    </div>
  )
}
