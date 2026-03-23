import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateDraft } from '@/lib/claude'
import { PLANS } from '@/lib/plans'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subsidyId } = await request.json() as { subsidyId: string }

  // 플랜 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, biz_name, biz_type, biz_region_sido, biz_region_sigungu, biz_size')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const plan = profile.plan
  if (plan === 'free' || plan === 'basic') {
    return NextResponse.json({ error: '스탠다드 이상 플랜에서 이용 가능합니다' }, { status: 403 })
  }

  // standard: 이번달 5건 제한
  if (plan === 'standard') {
    const now = new Date()
    const { count } = await supabase
      .from('drafts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', format(startOfMonth(now), "yyyy-MM-dd'T'00:00:00"))
      .lte('created_at', format(endOfMonth(now), "yyyy-MM-dd'T'23:59:59"))

    if ((count ?? 0) >= PLANS.standard.draftLimit) {
      return NextResponse.json({ error: '이번달 AI 초안 한도(5건)를 초과했습니다' }, { status: 403 })
    }
  }

  // 공고 조회
  const { data: subsidy } = await supabase
    .from('subsidies')
    .select('title, raw_content')
    .eq('id', subsidyId)
    .single()

  if (!subsidy) return NextResponse.json({ error: 'Subsidy not found' }, { status: 404 })

  // AI 초안 생성
  const draft = await generateDraft({
    subsidyTitle:   subsidy.title,
    subsidyContent: subsidy.raw_content,
    bizName:        profile.biz_name ?? '',
    bizType:        profile.biz_type ?? '',
    bizRegion:      `${profile.biz_region_sido ?? ''} ${profile.biz_region_sigungu ?? ''}`.trim(),
    bizSize:        profile.biz_size ?? '',
  })

  // 저장
  await supabase.from('drafts').insert({
    user_id:    user.id,
    subsidy_id: subsidyId,
    content:    JSON.stringify(draft),
  })

  return NextResponse.json({ draft })
}
