import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PLANS } from '@/lib/plans'
import KakaoToggle from '@/components/KakaoToggle'
import type { Profile, Payment, PlanType } from '@/lib/supabase/types'

const BIZ_TYPE_LABEL: Record<string, string> = {
  restaurant: '음식업·카페', retail: '소매·판매업', beauty: '미용·뷰티',
  fitness: '운동·피트니스', it: 'IT·소프트웨어', manufacturing: '제조업',
  wholesale: '도매·유통', service: '서비스·수리', other: '기타',
}
const BIZ_SIZE_LABEL: Record<string, string> = {
  solo: '1인', under5: '2~4명', under10: '5~9명', over10: '10명 이상',
}
const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  success:   { label: '결제 완료', color: '#34D399' },
  failed:    { label: '결제 실패', color: '#F87171' },
  cancelled: { label: '취소',      color: '#94A3B8' },
}

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: paymentsData } = await supabase.from('payments').select('*').eq('user_id', user.id).order('paid_at', { ascending: false }).limit(20)

  const profile = profileData as Profile | null
  const payments = (paymentsData ?? []) as Payment[]
  const plan = (profile?.plan ?? 'free') as PlanType
  const planInfo = PLANS[plan]

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-8">마이페이지</h1>

      {/* 섹션1: 구독 정보 */}
      <section className="rounded-2xl p-6 mb-4" style={{ backgroundColor: '#0D1E3F' }}>
        <h2 className="text-sm text-white/40 mb-4">구독 정보</h2>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full text-sm font-bold"
              style={{ backgroundColor: 'rgba(232,160,32,0.15)', color: '#E8A020' }}
            >
              {planInfo.name}
            </span>
            <span className="text-white">
              {planInfo.price === 0 ? '무료' : `${planInfo.price.toLocaleString()}원/월`}
            </span>
          </div>
        </div>
        {profile?.next_billing_date && (
          <p className="text-sm text-white/40 mb-4">다음 결제일: {profile.next_billing_date}</p>
        )}
        <div className="flex gap-2">
          <Link
            href="/mypage/settings"
            className="px-4 py-2 rounded-lg text-sm border border-white/20 text-white/60 hover:border-white/40 transition"
          >
            플랜 변경
          </Link>
          {plan !== 'free' && (
            <Link
              href="/mypage/settings?action=cancel"
              className="px-4 py-2 rounded-lg text-sm border border-red-500/30 text-red-400 hover:border-red-500/60 transition"
            >
              구독 해지
            </Link>
          )}
        </div>
      </section>

      {/* 섹션2: 결제 내역 */}
      <section className="rounded-2xl p-6 mb-4" style={{ backgroundColor: '#0D1E3F' }}>
        <h2 className="text-sm text-white/40 mb-4">결제 내역</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-white/40">결제 내역이 없습니다.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-xs border-b border-white/10">
                <th className="text-left pb-2">날짜</th>
                <th className="text-left pb-2">플랜</th>
                <th className="text-right pb-2">금액</th>
                <th className="text-right pb-2">상태</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const s = STATUS_LABEL[p.status] ?? { label: p.status, color: '#94A3B8' }
                return (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="py-3 text-white/60">{p.paid_at.slice(0, 10)}</td>
                    <td className="py-3 text-white/60">{PLANS[p.plan]?.name ?? p.plan}</td>
                    <td className="py-3 text-right text-white">{p.amount.toLocaleString()}원</td>
                    <td className="py-3 text-right text-xs" style={{ color: s.color }}>{s.label}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* 섹션3: 알림 설정 */}
      <section className="rounded-2xl p-6 mb-4" style={{ backgroundColor: '#0D1E3F' }}>
        <h2 className="text-sm text-white/40 mb-4">알림 설정</h2>
        <KakaoToggle initialValue={profile?.kakao_consent ?? false} />
      </section>

      {/* 섹션4: 내 정보 */}
      <section className="rounded-2xl p-6" style={{ backgroundColor: '#0D1E3F' }}>
        <h2 className="text-sm text-white/40 mb-4">내 정보</h2>
        <div className="space-y-2 text-sm text-white/70 mb-4">
          <p>업종: {BIZ_TYPE_LABEL[profile?.biz_type ?? ''] ?? '-'}</p>
          <p>지역: {profile?.biz_region_sido ?? '-'} {profile?.biz_region_sigungu ?? ''}</p>
          <p>규모: {BIZ_SIZE_LABEL[profile?.biz_size ?? ''] ?? '-'}</p>
        </div>
        <Link
          href="/onboarding"
          className="text-sm px-4 py-2 rounded-lg border border-white/20 text-white/60 hover:border-white/40 transition"
        >
          수정하기
        </Link>
      </section>
    </div>
  )
}
