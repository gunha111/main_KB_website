'use client'

import { useState } from 'react'

interface Props {
  initialValue: boolean
}

export default function KakaoToggle({ initialValue }: Props) {
  const [enabled, setEnabled] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const next = !enabled
    const res = await fetch('/api/profile/kakao-consent', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent: next }),
    })
    if (res.ok) setEnabled(next)
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white font-medium">카카오 알림톡</p>
        <p className="text-sm text-white/50 mt-0.5">
          마감 D-14, D-7, D-3일 전 자동 발송
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className="relative w-12 h-6 rounded-full transition-colors disabled:opacity-50"
        style={{ backgroundColor: enabled ? '#E8A020' : 'rgba(255,255,255,0.15)' }}
      >
        <span
          className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform"
          style={{ transform: enabled ? 'translateX(24px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  )
}
