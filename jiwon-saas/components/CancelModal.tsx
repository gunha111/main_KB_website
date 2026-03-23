'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  onClose: () => void
}

export default function CancelModal({ onClose }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    setLoading(true)
    const res = await fetch('/api/billing/cancel', { method: 'POST' })
    if (res.ok) {
      onClose()
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ backgroundColor: '#0D1E3F' }}
      >
        <h3 className="text-lg font-bold text-white mb-2">구독을 해지하시겠습니까?</h3>
        <p className="text-sm text-white/60 mb-6">
          다음 결제일까지 이용 가능합니다.
          해지 후에는 무료 플랜으로 전환됩니다.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-white/10 text-white/60 hover:border-white/30 transition"
          >
            취소
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-lg font-semibold text-white bg-red-500/80 hover:bg-red-500 transition disabled:opacity-50"
          >
            {loading ? '처리 중...' : '해지 확인'}
          </button>
        </div>
      </div>
    </div>
  )
}
