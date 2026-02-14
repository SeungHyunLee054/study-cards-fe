import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, BookOpen, Loader2, Shield, FolderTree, Sparkles, Users, ArrowLeft } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { AdminCardForm } from '@/components/AdminCardForm'
import { AdminCategoryForm } from '@/components/AdminCategoryForm'
import { CategoryFilterSection } from '@/components/CategoryFilterSection'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import {
  createAdminCard,
  updateAdminCard,
  deleteAdminCard,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from '@/api/admin'
import { useInfiniteAdminCards } from '@/hooks/useInfiniteAdminCards'
import { useCategories } from '@/hooks/useCategories'
import type { AdminCardResponse, AdminCardCreateRequest } from '@/types/admin'
import type { CategoryResponse, CategoryCreateRequest, CategoryUpdateRequest } from '@/types/category'
import { buildCategoryTreeFromFlat } from '@/lib/categoryHierarchy'
import type { CategoryTreeNode } from '@/lib/categoryHierarchy'
import { DASHBOARD_PATH } from '@/constants/routes'

type Tab = 'cards' | 'categories'

export function AdminCardsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('cards')

  // 카테고리 공통 상태
  const {
    categories,
    isLoading: isCategoriesLoading,
    error: categoriesLoadError,
    clearError: clearCategoriesLoadError,
    reload: reloadCategories,
  } = useCategories()

  // 카드 관리 상태
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [isCardFormOpen, setIsCardFormOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<AdminCardResponse | null>(null)
  const [deleteTargetCard, setDeleteTargetCard] = useState<AdminCardResponse | null>(null)
  const [isCardSubmitting, setIsCardSubmitting] = useState(false)
  const [cardActionError, setCardActionError] = useState<string | null>(null)

  const categoryCode = selectedCategory === 'ALL' ? undefined : selectedCategory
  const selectedCategoryName = selectedCategory === 'ALL'
    ? '전체'
    : (categories.find((cat) => cat.code === selectedCategory)?.name ?? selectedCategory)
  const categoryTree = useMemo(() => buildCategoryTreeFromFlat(categories), [categories])
  const {
    cards,
    isLoading: isCardsLoading,
    isLoadingMore,
    error: cardsError,
    hasMore,
    totalElements,
    refresh: refreshCards,
    observerRef,
  } = useInfiniteAdminCards({ categoryCode })

  // 카테고리 관리 상태
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null)
  const [deleteTargetCategory, setDeleteTargetCategory] = useState<CategoryResponse | null>(null)
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false)

  // 카드 CRUD
  async function handleCreateCard(data: AdminCardCreateRequest) {
    try {
      setIsCardSubmitting(true)
      await createAdminCard(data)
      setIsCardFormOpen(false)
      await refreshCards()
    } catch (err) {
      setCardActionError(err instanceof Error ? err.message : '카드 생성에 실패했습니다')
    } finally {
      setIsCardSubmitting(false)
    }
  }

  async function handleUpdateCard(data: AdminCardCreateRequest) {
    if (!editingCard) return
    try {
      setIsCardSubmitting(true)
      await updateAdminCard(editingCard.id, data)
      setEditingCard(null)
      await refreshCards()
    } catch (err) {
      setCardActionError(err instanceof Error ? err.message : '카드 수정에 실패했습니다')
    } finally {
      setIsCardSubmitting(false)
    }
  }

  async function handleDeleteCard(id: number) {
    try {
      setIsCardSubmitting(true)
      await deleteAdminCard(id)
      setDeleteTargetCard(null)
      await refreshCards()
    } catch (err) {
      setCardActionError(err instanceof Error ? err.message : '카드 삭제에 실패했습니다')
    } finally {
      setIsCardSubmitting(false)
    }
  }

  // 카테고리 CRUD
  async function handleCreateCategory(data: CategoryCreateRequest) {
    try {
      setIsCategorySubmitting(true)
      await createAdminCategory(data)
      setIsCategoryFormOpen(false)
      await reloadCategories()
    } catch (err) {
      setCategoriesError(err instanceof Error ? err.message : '카테고리 생성에 실패했습니다')
    } finally {
      setIsCategorySubmitting(false)
    }
  }

  async function handleUpdateCategory(data: CategoryCreateRequest) {
    if (!editingCategory) return
    try {
      setIsCategorySubmitting(true)
      const updateData: CategoryUpdateRequest = {
        code: data.code,
        name: data.name,
        displayOrder: data.displayOrder,
      }
      await updateAdminCategory(editingCategory.id, updateData)
      setEditingCategory(null)
      await reloadCategories()
    } catch (err) {
      setCategoriesError(err instanceof Error ? err.message : '카테고리 수정에 실패했습니다')
    } finally {
      setIsCategorySubmitting(false)
    }
  }

  async function handleDeleteCategory(id: number) {
    try {
      setIsCategorySubmitting(true)
      await deleteAdminCategory(id)
      setDeleteTargetCategory(null)
      await reloadCategories()
    } catch (err) {
      setCategoriesError(err instanceof Error ? err.message : '카테고리 삭제에 실패했습니다')
    } finally {
      setIsCategorySubmitting(false)
    }
  }

  function closeCardForm() {
    setIsCardFormOpen(false)
    setEditingCard(null)
  }

  function closeCategoryForm() {
    setIsCategoryFormOpen(false)
    setEditingCategory(null)
  }

  function renderCategoryNode(node: CategoryTreeNode) {
    return (
      <div key={node.id} className="space-y-2">
        <div className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 text-sm font-medium rounded-lg bg-primary/10 text-primary">
                  {node.code}
                </span>
                <span className="text-lg font-medium text-gray-900">{node.name}</span>
                {node.parentCode && (
                  <span className="text-xs text-gray-500">
                    상위: {node.parentCode}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                ID: #{node.id} · 레벨 {node.depth + 1}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingCategory(categories.find((cat) => cat.id === node.id) ?? null)}
                className="min-h-[44px] min-w-[44px] flex-1 sm:flex-none"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const target = categories.find((cat) => cat.id === node.id)
                  if (target) {
                    setDeleteTargetCategory(target)
                  }
                }}
                className="min-h-[44px] min-w-[44px] flex-1 sm:flex-none"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
        {node.children.length > 0 && (
          <div className="ml-4 pl-4 border-l border-gray-200 space-y-2">
            {node.children.map((child) => renderCategoryNode(child))}
          </div>
        )}
      </div>
    )
  }

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
              <Link to="/admin/users" aria-label="사용자 관리">
                <Users className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">사용자 관리</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="min-h-[44px]">
              <Link to="/admin/generation" aria-label="AI 문제 생성">
                <Sparkles className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">AI 문제 생성</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="min-h-[44px]">
              <Link to={DASHBOARD_PATH} aria-label="뒤로가기">
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">뒤로가기</span>
              </Link>
            </Button>
          </>
        )}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="mt-1 text-gray-600">카드와 카테고리를 관리합니다</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors shrink-0 ${
              activeTab === 'cards'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen className="inline-block h-4 w-4 mr-2" />
            카드 관리
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors shrink-0 ${
              activeTab === 'categories'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FolderTree className="inline-block h-4 w-4 mr-2" />
            카테고리 관리
          </button>
        </div>

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <>
            {/* Cards Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">카드 목록</h2>
                <p className="text-sm text-gray-500">{cards.length} / {totalElements}개</p>
              </div>
              <Button onClick={() => setIsCardFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                새 카드
              </Button>
            </div>

            {/* Error Message */}
            {(cardsError || cardActionError) && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                {cardsError || cardActionError}
                <button
                  onClick={() => setCardActionError(null)}
                  className="ml-2 text-red-900 hover:underline"
                >
                  닫기
                </button>
              </div>
            )}

            {/* Category Filter */}
            <CategoryFilterSection
              className="mb-6"
              categories={categories}
              isLoading={isCategoriesLoading}
              selectedCategory={selectedCategory}
              onChange={setSelectedCategory}
              buttonBaseClassName="px-4 py-2.5 text-sm rounded-lg transition-colors min-h-[44px]"
            />

            {/* Cards List */}
            {isCardsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : cards.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">카드가 없습니다</h3>
                <p className="text-gray-600 mb-4">
                  {selectedCategory === 'ALL'
                    ? '첫 번째 학습 카드를 만들어보세요!'
                    : `${selectedCategoryName} 카테고리에 카드가 없습니다`}
                </p>
                <Button onClick={() => setIsCardFormOpen(true)}>
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
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">
                            {card.category.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            EF: {card.efFactor.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400">ID: #{card.id}</span>
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
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="ghost" size="sm" onClick={() => setEditingCard(card)} className="min-h-[44px] min-w-[44px] flex-1 sm:flex-none">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTargetCard(card)}
                          className="min-h-[44px] min-w-[44px] flex-1 sm:flex-none"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 무한 스크롤 트리거 */}
                {hasMore && (
                  <div ref={observerRef} className="flex justify-center py-4">
                    {isLoadingMore && (
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <>
            {/* Categories Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">카테고리 목록</h2>
                <p className="text-sm text-gray-500">총 {categories.length}개</p>
              </div>
              <Button onClick={() => setIsCategoryFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                새 카테고리
              </Button>
            </div>

            {/* Error Message */}
            {(categoriesError || categoriesLoadError) && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                {categoriesError || categoriesLoadError}
                <button
                  onClick={() => {
                    setCategoriesError(null)
                    clearCategoriesLoadError()
                  }}
                  className="ml-2 text-red-900 hover:underline"
                >
                  닫기
                </button>
              </div>
            )}

            {/* Categories List */}
            {isCategoriesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <FolderTree className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">카테고리가 없습니다</h3>
                <p className="text-gray-600 mb-4">첫 번째 카테고리를 만들어보세요!</p>
                <Button onClick={() => setIsCategoryFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  카테고리 만들기
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {categoryTree.map((node) => renderCategoryNode(node))}
              </div>
            )}
          </>
        )}
      </main>

      <ConfirmDialog
        isOpen={!!deleteTargetCard}
        title="카드 삭제"
        description={deleteTargetCard ? (
          <>
            관리자 카드(ID: #{deleteTargetCard.id})를 삭제하시겠습니까?
            <br />
            삭제된 카드는 복구할 수 없습니다.
          </>
        ) : undefined}
        confirmLabel="삭제"
        confirmVariant="destructive"
        isConfirming={isCardSubmitting}
        onCancel={() => {
          if (!isCardSubmitting) {
            setDeleteTargetCard(null)
          }
        }}
        onConfirm={() => {
          if (deleteTargetCard) {
            void handleDeleteCard(deleteTargetCard.id)
          }
        }}
      />

      <ConfirmDialog
        isOpen={!!deleteTargetCategory}
        title="카테고리 삭제"
        description={deleteTargetCategory ? (
          <>
            <span className="font-medium text-gray-900">{deleteTargetCategory.name}</span>
            {' '}
            카테고리를 삭제하시겠습니까?
            <br />
            하위 카테고리/카드 영향 여부를 확인한 뒤 진행하세요.
          </>
        ) : undefined}
        confirmLabel="삭제"
        confirmVariant="destructive"
        isConfirming={isCategorySubmitting}
        onCancel={() => {
          if (!isCategorySubmitting) {
            setDeleteTargetCategory(null)
          }
        }}
        onConfirm={() => {
          if (deleteTargetCategory) {
            void handleDeleteCategory(deleteTargetCategory.id)
          }
        }}
      />

      {/* Card Form Modal */}
      <AdminCardForm
        isOpen={isCardFormOpen}
        onClose={closeCardForm}
        onSubmit={handleCreateCard}
        categories={categories}
        isLoading={isCardSubmitting}
      />
      <AdminCardForm
        isOpen={!!editingCard}
        onClose={closeCardForm}
        onSubmit={handleUpdateCard}
        initialData={editingCard}
        categories={categories}
        isLoading={isCardSubmitting}
      />

      {/* Category Form Modal */}
      <AdminCategoryForm
        isOpen={isCategoryFormOpen}
        onClose={closeCategoryForm}
        onSubmit={handleCreateCategory}
        categories={categories}
        isLoading={isCategorySubmitting}
      />
      <AdminCategoryForm
        isOpen={!!editingCategory}
        onClose={closeCategoryForm}
        onSubmit={handleUpdateCategory}
        initialData={editingCategory}
        categories={categories}
        isLoading={isCategorySubmitting}
      />
    </div>
  )
}
