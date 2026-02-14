import { useMemo, useState } from 'react'

export const ALL_CATEGORY = 'ALL'

export function useCategoryFilter(initialValue: string = ALL_CATEGORY) {
  const [selectedCategory, setSelectedCategory] = useState(initialValue)

  const categoryCode = useMemo(
    () => (selectedCategory === ALL_CATEGORY ? undefined : selectedCategory),
    [selectedCategory]
  )

  return {
    selectedCategory,
    setSelectedCategory,
    categoryCode,
    resetToAll: () => setSelectedCategory(ALL_CATEGORY),
  }
}
