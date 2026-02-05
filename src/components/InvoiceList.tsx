import { Receipt, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import type { InvoiceResponse } from '@/types/subscription'

interface InvoiceListProps {
  invoices: InvoiceResponse[]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getStatusIcon(status: InvoiceResponse['status']) {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'FAILED':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'CANCELED':
      return <AlertCircle className="h-4 w-4 text-gray-500" />
    case 'PENDING':
      return <Clock className="h-4 w-4 text-yellow-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

function getStatusLabel(status: InvoiceResponse['status']): string {
  switch (status) {
    case 'COMPLETED':
      return '완료'
    case 'FAILED':
      return '실패'
    case 'CANCELED':
      return '취소'
    case 'PENDING':
      return '대기'
    default:
      return status
  }
}

function getPaymentTypeLabel(type: InvoiceResponse['paymentType']): string {
  switch (type) {
    case 'INITIAL':
      return '최초 결제'
    case 'RENEWAL':
      return '갱신'
    case 'UPGRADE':
      return '업그레이드'
    default:
      return type
  }
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            결제 내역
          </h2>
        </div>
        <div className="p-6 text-center text-gray-500">
          결제 내역이 없습니다
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          결제 내역
        </h2>
      </div>
      <div className="divide-y divide-gray-100">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(invoice.status)}
              <div>
                <p className="font-medium text-gray-900">
                  {getPaymentTypeLabel(invoice.paymentType)}
                </p>
                <p className="text-sm text-gray-500">
                  {invoice.paidAt ? formatDate(invoice.paidAt) : formatDate(invoice.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">
                {invoice.amount.toLocaleString()}원
              </p>
              <p className="text-sm text-gray-500">
                {getStatusLabel(invoice.status)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
