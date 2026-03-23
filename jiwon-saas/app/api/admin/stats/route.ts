import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'

export async function GET() {
  if (!isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const [
      { count: totalUsers },
      { count: totalSubsidies },
      { count: totalNotifications },
      { data: planCounts },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('subsidies').select('*', { count: 'exact', head: true }),
      supabase.from('notifications').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('plan'),
    ])

    const plans = { free: 0, basic: 0, standard: 0, premium: 0 }
    for (const row of planCounts ?? []) {
      const p = row.plan as keyof typeof plans
      if (p in plans) plans[p]++
    }

    return NextResponse.json({ totalUsers, totalSubsidies, totalNotifications, plans })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
