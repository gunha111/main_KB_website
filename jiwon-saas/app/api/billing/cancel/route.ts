import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase.from('profiles').update({
    billing_key: null,
    plan: 'free',
    next_billing_date: null,
  }).eq('id', user.id)

  return NextResponse.json({
    success: true,
    message: '다음 결제일까지 이용 가능합니다',
  })
}
