import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PLANS } from '@/lib/plans'
import { tossAuthHeader, TOSS_BASE } from '@/lib/toss'
import type { PlanType } from '@/lib/supabase/types'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { authKey, customerKey, plan } = await request.json() as {
    authKey: string
    customerKey: string
    plan: PlanType
  }

  // 1. 빌링키 발급
  const issueRes = await fetch(`${TOSS_BASE}/billing/authorizations/issue`, {
    method: 'POST',
    headers: {
      Authorization: tossAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ authKey, customerKey }),
  })
  if (!issueRes.ok) {
    const err = await issueRes.json()
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
  const { billingKey } = await issueRes.json()

  // 2. 즉시 첫 결제
  const planInfo = PLANS[plan]
  const orderId = `order_${Date.now()}_${user.id.slice(0, 8)}`
  const chargeRes = await fetch(`${TOSS_BASE}/billing/${billingKey}`, {
    method: 'POST',
    headers: {
      Authorization: tossAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerKey,
      amount: planInfo.price,
      orderId,
      orderName: `지원알림 ${planInfo.name}`,
    }),
  })
  if (!chargeRes.ok) {
    const err = await chargeRes.json()
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // 3. 다음 결제일 계산 (다음달 1일)
  const nextBilling = new Date()
  nextBilling.setMonth(nextBilling.getMonth() + 1)
  nextBilling.setDate(1)

  // 4. 프로필 업데이트
  await supabase.from('profiles').update({
    billing_key: billingKey,
    plan,
    next_billing_date: nextBilling.toISOString().slice(0, 10),
  }).eq('id', user.id)

  // 5. 결제 내역 저장
  await supabase.from('payments').insert({
    user_id: user.id,
    amount: planInfo.price,
    plan,
    status: 'success',
    toss_order_id: orderId,
  })

  return NextResponse.json({ success: true })
}
