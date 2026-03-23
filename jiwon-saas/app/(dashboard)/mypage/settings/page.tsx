'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PlanSelector from '@/components/PlanSelector'
import CancelModal from '@/components/CancelModal'
import type { PlanType } from '@/lib/supabase/types'

function SettingsContent() {
  const searchParams = useSearchParams()
  const [plan, setPlan] = useState<PlanType>('free')
  const [showPlan, setShowPlan] = useState(false)
  const [showCancel, setShowCancel] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then((res: { data: { user: { id: string } | null } }) => {
      const user = res.data?.user
      if (!user) return
      supabase.from('profiles').select('plan').eq('id', user.id).single()
        .then((r: { data: { plan: string } | null }) => {
          if (r.data) setPlan(r.data.plan as PlanType)
        })
    })
    if (searchParams.get('action') === 'cancel') setShowCancel(true)
  }, [searchParams])

  return (
    <div className="min-h-screen px-4 py-8 max-w-xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-8">구독 설정</h1>
      <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: '#0D1E3F' }}>
        <button
          onClick={() => setShowPlan(true)}
          className="w-full py-3 rounded-lg border border-white/20 text-white/70 hover:border-[#E8A020] transition"
        >
          플랜 변경
        </button>
        {plan !== 'free' && (
          <button
            onClick={() => setShowCancel(true)}
            className="w-full py-3 rounded-lg border border-red-500/30 text-red-400 hover:border-red-500/60 transition"
          >
            구독 해지
          </button>
        )}
      </div>
      {showPlan && <PlanSelector currentPlan={plan} onClose={() => setShowPlan(false)} />}
      {showCancel && <CancelModal onClose={() => setShowCancel(false)} />}
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: '#08112A' }} />}>
      <SettingsContent />
    </Suspense>
  )
}
