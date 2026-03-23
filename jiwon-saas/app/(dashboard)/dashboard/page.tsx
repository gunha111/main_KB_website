import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardStats from '@/components/DashboardStats'
import FilterBar from '@/components/FilterBar'
import SubsidyCard from '@/components/SubsidyCard'
import type { Subsidy } from '@/lib/supabase/types'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan ?? 'free'
  const today = new Date().toISOString().slice(0, 10)
  const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

  const { category } = await searchParams

  // 공고 조회
  let query = supabase
    .from('subsidies')
    .select('*')
    .gte('end_date', today)
    .order('end_date', { ascending: true })
    .limit(50)

  if (category) query = query.eq('category', category)

  const { data: subsidies } = await query

  // 통계
  const { count: total }    = await supabase.from('subsidies').select('*', { count: 'exact', head: true }).gte('end_date', today)
  const { count: urgent }   = await supabase.from('subsidies').select('*', { count: 'exact', head: true }).gte('end_date', today).lte('end_date', weekLater)
  const { count: newToday } = await supabase.from('subsidies').select('*', { count: 'exact', head: true }).gte('created_at', today)

  const isFree = plan === 'free'
  const items: Subsidy[] = (subsidies ?? []) as Subsidy[]

  return (
    <div className="min-h-screen px-4 py-8 max-w-5xl mx-auto" style={{ color: 'white' }}>
      <h1 className="text-2xl font-bold mb-6">맞춤 지원사업</h1>

      <DashboardStats
        total={total ?? 0}
        urgent={urgent ?? 0}
        newToday={newToday ?? 0}
      />

      <FilterBar />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((subsidy, i) => (
          <SubsidyCard
            key={subsidy.id}
            subsidy={subsidy}
            blurred={isFree && i >= 3}
          />
        ))}
        {items.length === 0 && (
          <p className="col-span-3 text-center text-white/40 py-20">
            해당 조건의 공고가 없습니다.
          </p>
        )}
      </div>
    </div>
  )
}
