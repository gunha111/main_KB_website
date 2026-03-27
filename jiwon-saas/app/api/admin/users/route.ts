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

  // auth.users에서 이메일 가져오기
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  // profiles 가져오기
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, plan, kakao_consent, created_at')
    .order('created_at', { ascending: false })

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  // 이메일과 profiles 합치기
  const emailMap = new Map(authData.users.map(u => [u.id, u.email]))
  const result = profiles.map(p => ({
    ...p,
    email: emailMap.get(p.id) ?? null,
  }))

  return NextResponse.json(result)
}

// 플랜 변경
export async function PATCH(req: Request) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, plan } = await req.json()
  if (!email || !plan) return NextResponse.json({ error: 'email, plan 필요' }, { status: 400 })

  const supabase = adminClient()

  // auth.users에서 이메일로 유저 찾기
  const { data: authData } = await supabase.auth.admin.listUsers()
  const user = authData?.users.find(u => u.email === email)

  if (!user) {
    return NextResponse.json({ error: '해당 이메일로 가입된 유저가 없습니다' }, { status: 404 })
  }

  const { error } = await supabase
    .from('profiles')
    .update({ plan })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
