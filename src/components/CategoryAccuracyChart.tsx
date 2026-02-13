import { cn } from '@/lib/utils'
import type { CategoryAccuracyResponse } from '@/types/recommendation'

interface CategoryAccuracyChartProps {
  data: CategoryAccuracyResponse[]
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return 'bg-green-500'
  if (accuracy >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getAccuracyBgColor(accuracy: number): string {
  if (accuracy >= 80) return 'bg-green-100'
  if (accuracy >= 50) return 'bg-yellow-100'
  return 'bg-red-100'
}

export function CategoryAccuracyChart({ data }: CategoryAccuracyChartProps) {
  if (data.length === 0) return null

  return (
    <div className="border border-gray-200 rounded-xl bg-white p-4 md:p-6">
      <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
        카테고리별 정답률
      </h3>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.categoryId}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs md:text-sm font-medium text-gray-700 truncate max-w-[60%]">
                {item.categoryName}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                {item.correctCount}/{item.totalCount} ({item.accuracy.toFixed(0)}%)
              </span>
            </div>
            <div className={cn('w-full h-2 rounded-full', getAccuracyBgColor(item.accuracy))}>
              <div
                className={cn('h-full rounded-full transition-all', getAccuracyColor(item.accuracy))}
                style={{ width: `${Math.min(item.accuracy, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
