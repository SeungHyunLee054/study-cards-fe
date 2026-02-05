import type { BillingCycle } from '@/types/subscription'

interface BillingCycleToggleProps {
  value: BillingCycle
  onChange: (cycle: BillingCycle) => void
}

export function BillingCycleToggle({ value, onChange }: BillingCycleToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span
        className={`text-sm font-medium ${
          value === 'MONTHLY' ? 'text-gray-900' : 'text-gray-500'
        }`}
      >
        월간 결제
      </span>
      <button
        type="button"
        onClick={() => onChange(value === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value === 'YEARLY' ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-medium ${
            value === 'YEARLY' ? 'text-gray-900' : 'text-gray-500'
          }`}
        >
          연간 결제
        </span>
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
          2개월 무료
        </span>
      </div>
    </div>
  )
}
