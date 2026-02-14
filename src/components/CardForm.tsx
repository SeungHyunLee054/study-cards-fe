import { BaseCardForm } from '@/components/BaseCardForm'
import type { UserCardResponse, UserCardCreateRequest } from '@/types/card'
import type { CategoryResponse } from '@/types/category'

interface CardFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UserCardCreateRequest) => Promise<void>
  initialData?: UserCardResponse | null
  categories?: CategoryResponse[]
  isLoading?: boolean
}

export function CardForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories = [],
  isLoading,
}: CardFormProps) {
  return (
    <BaseCardForm<UserCardCreateRequest, UserCardResponse>
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      initialData={initialData}
      categories={categories}
      isLoading={isLoading}
    />
  )
}
