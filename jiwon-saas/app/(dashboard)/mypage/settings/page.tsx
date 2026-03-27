'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PlanSelector from '@/components/PlanSelector'
import CancelModal from '@/components/CancelModal'
import type { PlanType } from '@/lib/supabase/types'

function SettingsContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [plan, setPlan] = useState<PlanType>('free')
  const [showPlan, setShowPlan] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [phone, setPhone] = useState('')
  const [phoneSaving, setPhoneSaving] = useState(false)
  const [phoneMsg, setPhoneMsg] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then((res: { data: { user: { id: string } | null } }) => {
      const user = res.data?.user
      if (!user) return
      supabase.from('profiles').select('plan, phone').eq('id', user.id).single()
        .then((r: { data: { plan: string; phone: string | null } | null }) => {
          if (r.data) {
            setPlan(r.data.plan as PlanType)
            setPhone(r.data.phone ?? '')
          }
        })
    })
    if (searchParams.get('action') === 'cancel') setShowCancel(true)
  }, [searchParams])

  async function handleSavePhone() {
    setPhoneSaving(true)
    setPhoneMsg('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const { error } = await supabase
      .from('profiles')
      .update({ phone: cleanPhone || null })
      .eq('id', user.id)
    setPhoneSaving(false)
    setPhoneMsg(error ? '저장 실패' : '저장되었습니다')
    setTimeout(() => setPhoneMsg(''), 3000)
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-8">구독 설정</h1>

      {/* 전화번호 설정 */}
      <div className="rounded-2xl p-6 mb-4" style={{ backgroundColor: '#0D1E3F' }}>
        <h2 className="text-sm font-medium text-white/50 mb-4">카카오 알림톡 전화번호</h2>
        <div className="flex gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000"
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#E8A020] transition text-sm"
          />
          <button
            onClick={handleSavePhone}
            disabled={phoneSaving}
            className="px-4 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50"
            style={{ backgroundColor: '#E8A020', color: '#08112A' }}
          >
            {phoneSaving ? '저장 중...' : '저장'}
          </button>
        </div>
        {phoneMsg && (
          <p className={`mt-2 text-sm ${phoneMsg === '저장되었습니다' ? 'text-green-400' : 'text-red-400'}`}>
            {phoneMsg}
          </p>
        )}
      </div>

      {/* 구독 관리 */}
      <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: '#0D1E3F' }}>
        <h2 className="text-sm font-medium text-white/50 mb-4">구독 관리</h2>
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
