import { createClient } from '@supabase/supabase-js'
import { PLANS } from '../../lib/plans'
import { chargeBilling } from '../../lib/toss'

// 매월 1일 UTC 00:00 실행 (netlify.toml: schedule = "0 0 1 * *")
export default async function handler() {
  console.log('[cron-billing] 자동결제 시작')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 유료 플랜 + 빌링키 보유 사용자 전체 조회
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, plan, billing_key, retry_count')
    .neq('plan', 'free')
    .not('billing_key', 'is', null)

  if (error) {
    console.error('[cron-billing] 사용자 조회 실패:', error)
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }

  let success = 0
  let failed = 0

  for (const user of users ?? []) {
    const plan = user.plan as keyof typeof PLANS
    const planInfo = PLANS[plan]
    if (!planInfo || planInfo.price === 0) continue

    const result = await chargeBilling(
      user.billing_key,
      user.id,
      planInfo.price,
      `지원알림 ${planInfo.name}`
    )

    if (result.success) {
      // 결제 성공: 내역 저장 + 다음 결제일 갱신
      const nextBilling = new Date()
      nextBilling.setMonth(nextBilling.getMonth() + 1)
      nextBilling.setDate(1)

      await Promise.all([
        supabase.from('payments').insert({
          user_id:       user.id,
          amount:        planInfo.price,
          plan,
          status:        'success',
          toss_order_id: result.orderId ?? null,
          retry_count:   0,
        }),
        supabase.from('profiles').update({
          next_billing_date: nextBilling.toISOString().slice(0, 10),
        }).eq('id', user.id),
      ])

      success++
    } else {
      // 결제 실패: 재시도 횟수 증가
      const retryCount = (user.retry_count ?? 0) + 1

      await supabase.from('payments').insert({
        user_id:       user.id,
        amount:        planInfo.price,
        plan,
        status:        'failed',
        toss_order_id: result.orderId ?? null,
        retry_count:   retryCount,
      })

      // 3회 이상 실패 시 무료 플랜으로 강등
      if (retryCount >= 3) {
        await supabase.from('profiles').update({
          plan:              'free',
          billing_key:       null,
          next_billing_date: null,
        }).eq('id', user.id)

        console.warn(`[cron-billing] ${user.id} 3회 실패 → free 플랜으로 전환`)
      }

      failed++
    }
  }

  console.log(`[cron-billing] 결제 완료: 성공 ${success}건, 실패 ${failed}건`)
  return Response.json({ ok: true, success, failed })
}
