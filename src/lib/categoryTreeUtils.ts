import type { CategoryTreeResponse } from '@/types/category'
import type { CategoryProgressItem } from '@/types/dashboard'

export interface AggregatedCategoryProgress {
  categoryCode: string
  totalCards: number
  studiedCards: number
  progressRate: number
  masteryRate: number
}

export function buildProgressMap(
  items: CategoryProgressItem[],
): Map<string, CategoryProgressItem> {
  const map = new Map<string, CategoryProgressItem>()
  for (const item of items) {
    map.set(item.categoryCode, item)
  }
  return map
}

export function getAggregatedProgress(
  node: CategoryTreeResponse,
  progressMap: Map<string, CategoryProgressItem>,
): AggregatedCategoryProgress {
  const own = progressMap.get(node.code)

  let totalCards = own?.totalCards ?? 0
  let studiedCards = own?.studiedCards ?? 0

  for (const child of node.children) {
    const childAgg = getAggregatedProgress(child, progressMap)
    totalCards += childAgg.totalCards
    studiedCards += childAgg.studiedCards
  }

  const progressRate = totalCards > 0 ? studiedCards / totalCards : 0
  const masteryRate = own?.masteryRate ?? 0

  return { categoryCode: node.code, totalCards, studiedCards, progressRate, masteryRate }
}
