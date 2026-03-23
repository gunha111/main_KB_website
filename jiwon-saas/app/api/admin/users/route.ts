import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// 유저 목록
export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = adminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, plan, kakao_consent, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// 플랜 변경
export async function PATCH(req: Request) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, plan } = await req.json()
  if (!email || !plan) return NextResponse.json({ error: 'email, plan 필요' }, { status: 400 })

  const supabase = adminClient()
  // 유저 존재 여부 확인
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (!existing) {
    return NextResponse.json({ error: '해당 이메일로 가입된 유저가 없습니다' }, { status: 404 })
  }

  const { error } = await supabase
    .from('profiles')
    .update({ plan })
    .eq('email', email)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
