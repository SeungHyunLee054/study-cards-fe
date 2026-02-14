import { useCallback, useEffect, useState } from 'react'
import { fetchCategories } from '@/api/categories'
import type { CategoryResponse } from '@/types/category'

export function useCategories() {
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchCategories()
      setCategories(data)
      return data
    } catch (err) {
      setCategories([])
      setError(err instanceof Error ? err.message : '카테고리를 불러오는데 실패했습니다')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return {
    categories,
    isLoading,
    error,
    clearError: () => setError(null),
    reload,
  }
}
