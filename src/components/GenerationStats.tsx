import { Loader2, TrendingUp, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react'
import type { GenerationStatsResponse } from '@/types/generation'

interface GenerationStatsProps {
  stats: GenerationStatsResponse | null
  isLoading: boolean
  error: string | null
}

export function GenerationStats({ stats, isLoading, error }: GenerationStatsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>
    )
  }

  if (!stats) {
    return null
  }

  const { overall, byModel } = stats

  return (
    <div className="space-y-6">
      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="총 생성"
          value={overall.totalGenerated}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="승인됨"
          value={overall.approved}
          color="green"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label="거부됨"
          value={overall.rejected}
          color="red"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="대기중"
          value={overall.pending}
          color="yellow"
        />
        <StatCard
          icon={<ArrowRight className="h-5 w-5" />}
          label="마이그레이션"
          value={overall.migrated}
          color="purple"
        />
      </div>

      {/* 승인률 */}
      <div className="p-4 rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">전체 승인률</span>
          <span className="text-lg font-bold text-primary">
            {(overall.approvalRate * 100).toFixed(1)}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${overall.approvalRate * 100}%` }}
          />
        </div>
      </div>

      {/* 모델별 통계 테이블 */}
      {byModel.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">모델별 통계</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    모델
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    생성
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    승인
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    거부
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    대기
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    마이그레이션
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    승인률
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {byModel.map((modelStat) => (
                  <tr key={modelStat.model} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {modelStat.model}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {modelStat.totalGenerated}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">
                      {modelStat.approved}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">
                      {modelStat.rejected}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-yellow-600">
                      {modelStat.pending}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-purple-600">
                      {modelStat.migrated}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-primary">
                      {(modelStat.approvalRate * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  }

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  )
}
