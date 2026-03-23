'use client'

import { useState } from 'react'
import { PLANS } from '@/lib/plans'
import type { PlanType } from '@/lib/supabase/types'

interface Props {
  currentPlan: PlanType
  onClose: () => void
}

const PLAN_FEATURES: Record<PlanType, string[]> = {
  free:     ['공고 3건 열람', '알림 없음', 'AI 초안 없음'],
  basic:    ['공고 전체 열람', '알림 무제한', 'AI 초안 없음'],
  standard: ['공고 전체 열람', '알림 무제한', 'AI 초안 월 5건'],
  premium:  ['공고 전체 열람', '알림 무제한', 'AI 초안 무제한'],
}

export default function PlanSelector({ currentPlan, onClose }: Props) {
  const [selected, setSelected] = useState<PlanType>(currentPlan)
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    if (selected === currentPlan) { onClose(); return }
    setLoading(true)
    // 실제 구현 시 토스페이먼츠 위젯 호출
    alert(`${PLANS[selected].name} 플랜으로 변경은 토스페이먼츠 연동 후 이용 가능합니다.`)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div
        className="w-full max-w-lg rounded-2xl p-6"
        style={{ backgroundColor: '#0D1E3F' }}
      >
        <h3 className="text-lg font-bold text-white mb-4">플랜 변경</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(Object.entries(PLANS) as [PlanType, typeof PLANS[PlanType]][]).map(([key, plan]) => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className="p-4 rounded-xl border text-left transition"
              style={{
                borderColor: selected === key ? '#E8A020' : 'rgba(255,255,255,0.1)',
                backgroundColor: selected === key ? 'rgba(232,160,32,0.1)' : 'transparent',
              }}
            >
              <p className="font-semibold text-white">{plan.name}</p>
              <p className="text-lg font-bold mt-1" style={{ color: '#E8A020' }}>
                {plan.price === 0 ? '무료' : `${plan.price.toLocaleString()}원/월`}
              </p>
              <ul className="mt-2 space-y-1">
                {PLAN_FEATURES[key].map((f) => (
                  <li key={f} className="text-xs text-white/50">· {f}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-white/10 text-white/60 hover:border-white/30 transition"
          >
            취소
          </button>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="flex-1 py-3 rounded-lg font-semibold text-white transition disabled:opacity-50"
            style={{ backgroundColor: '#E8A020' }}
          >
            {loading ? '처리 중...' : '변경하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
