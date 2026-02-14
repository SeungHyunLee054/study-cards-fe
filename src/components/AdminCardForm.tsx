import { BaseCardForm } from '@/components/BaseCardForm'
import type { AdminCardResponse, AdminCardCreateRequest } from '@/types/admin'
import type { CategoryResponse } from '@/types/category'

interface AdminCardFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AdminCardCreateRequest) => Promise<void>
  initialData?: AdminCardResponse | null
  categories?: CategoryResponse[]
  isLoading?: boolean
}

export function AdminCardForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories = [],
  isLoading,
}: AdminCardFormProps) {
  return (
    <BaseCardForm<AdminCardCreateRequest, AdminCardResponse>
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      initialData={initialData}
      categories={categories}
      isLoading={isLoading}
      showCategoryCode
    />
  )
}
